import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiErrorHandling } from '@/lib/api-handler';
import { createClient } from '@/lib/supabase/server';

/**
 * Check for duplicate leads before import.
 * Returns list of leads with duplicate flags.
 */
export const POST = withApiErrorHandling(async (req: NextRequest) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leads } = await req.json();

    if (!leads || !Array.isArray(leads)) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Extract potential matching values
    const companyNames = leads.map(l => l.company_name).filter(Boolean);
    const emails = leads.flatMap(l => {
        const contactEmails = l.contacts?.map((c: any) => c.email).filter(Boolean) || [];
        return [l.email, ...contactEmails].filter(Boolean);
    });
    const phones = leads.flatMap(l => {
        const contactPhones = l.contacts?.map((c: any) => c.phone).filter(Boolean) || [];
        return [l.phone, ...contactPhones].filter(Boolean);
    });

    // Query for existing leads including those in trash
    const existingLeads = await prisma.lead.findMany({
        where: {
            OR: [
                { company_name: { in: companyNames, mode: 'insensitive' } },
                { email: { in: emails, mode: 'insensitive' } },
                { phone: { in: phones } }
            ]
            // Removed deletedAt: null to catch duplicates even in trash
        },
        select: {
            id: true,
            company_name: true,
            email: true,
            phone: true,
            decision_maker: true,
            deletedAt: true
        }
    });

    // Create lookup sets for fast matching
    const existingCompanies = new Set(existingLeads.map(l => l.company_name?.toLowerCase()));
    const existingEmails = new Set(existingLeads.map(l => l.email?.toLowerCase()).filter(Boolean));
    const existingPhones = new Set(existingLeads.map(l => l.phone).filter(Boolean));

    // Check each incoming lead for duplicates
    const results = leads.map((lead, index) => {
        const matchReasons: string[] = [];
        let duplicateOf: string | null = null;

        // Check company name
        if (lead.company_name && existingCompanies.has(lead.company_name.toLowerCase())) {
            const match = existingLeads.find(e => e.company_name?.toLowerCase() === lead.company_name?.toLowerCase());
            const suffix = match?.deletedAt ? ' (está na lixeira)' : '';
            matchReasons.push('Nome da empresa já existe' + suffix);
            if (match) duplicateOf = match.id;
        }

        // Check email
        const leadEmails = [lead.email, ...(lead.contacts?.map((c: any) => c.email) || [])].filter(Boolean);
        for (const email of leadEmails) {
            if (existingEmails.has(email.toLowerCase())) {
                const match = existingLeads.find(e => e.email?.toLowerCase() === email.toLowerCase());
                const suffix = match?.deletedAt ? ' (está na lixeira)' : '';
                matchReasons.push(`Email ${email} já cadastrado` + suffix);
                if (match && !duplicateOf) duplicateOf = match.id;
            }
        }

        // Check phone
        const leadPhones = [lead.phone, ...(lead.contacts?.map((c: any) => c.phone) || [])].filter(Boolean);
        for (const phone of leadPhones) {
            // Normalize phone for comparison (remove non-digits)
            const normalizedPhone = phone.replace(/\D/g, '');
            const matchingPhone = existingLeads.find(e => e.phone?.replace(/\D/g, '') === normalizedPhone);
            if (matchingPhone) {
                const suffix = matchingPhone.deletedAt ? ' (está na lixeira)' : '';
                matchReasons.push(`Telefone ${phone} já cadastrado` + suffix);
                if (!duplicateOf) duplicateOf = matchingPhone.id;
            }
        }

        return {
            index,
            lead,
            isDuplicate: matchReasons.length > 0,
            matchReasons,
            duplicateOf
        };
    });

    const duplicateCount = results.filter(r => r.isDuplicate).length;

    return NextResponse.json({
        total: leads.length,
        duplicates: duplicateCount,
        unique: leads.length - duplicateCount,
        results
    });
});
