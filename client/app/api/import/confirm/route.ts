import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiErrorHandling } from '@/lib/api-handler';
import { createClient } from '@/lib/supabase/server';
import { UserService } from '@/lib/services/user-service';

interface ContactInput {
    name: string;
    role?: string;
    phone?: string;
    email?: string;
    is_primary?: boolean;
}

interface LeadInput {
    company_name?: string;
    trade_name?: string;
    website_url?: string;
    instagram_url?: string;
    city?: string;
    uf?: string;
    address?: string;
    notes?: string;
    contacts?: ContactInput[];
}

export const POST = withApiErrorHandling(async (req: NextRequest) => {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not initialized" }, { status: 500 });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Support both legacy CSV mapping AND new direct lead array
    const { leads, mapping } = body;

    if (!leads || !Array.isArray(leads)) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    let successCount = 0;
    let errorCount = 0;
    const errorDetails: any[] = [];

    // Fetch internal DB user (using UserService for auto-provisioning/healing)
    const dbUser = await UserService.getOrCreateUser(user);

    if (!dbUser) {
        return NextResponse.json({ error: "User profile not found in database" }, { status: 404 });
    }

    for (const [index, leadData] of leads.entries()) {
        try {
            // Determine owner_id: explicit > internal user id
            let targetOwnerId: string | null = dbUser.id;

            if (leadData.owner_id !== undefined && leadData.owner_id !== null && leadData.owner_id !== "") {
                targetOwnerId = leadData.owner_id;
            } else if (leadData.owner_id === "" || leadData.owner_id === null) {
                // If explicitly cleared in UI, keep it as currentUser unless we want to force user attribution
                targetOwnerId = dbUser.id;
            }

            // Log stage assignment
            console.log(`[IMPORT] Lead #${index}: stage_id="${leadData.stage_id}", source="${leadData.source}"`);

            // Validate stage exists if provided
            let validatedStatus = leadData.stage_id || 'NEW';
            if (leadData.stage_id && leadData.stage_id !== 'NEW') {
                const stageExists = await prisma.stages.findFirst({
                    where: { name: leadData.stage_id }
                });
                if (!stageExists) {
                    console.warn(`[IMPORT] Unknown stage "${leadData.stage_id}", falling back to NEW`);
                    validatedStatus = 'NEW';
                }
            }

            // Determine if this is from CSV (has mapping) or Text Import (direct structure)
            let finalLead: any = {
                owner_id: targetOwnerId,
                status: validatedStatus,
                source: leadData.source || 'Import'
            };

            if (mapping && Object.keys(mapping).length > 0) {
                // ... (CSV logic remains similar, but ensure we respect global overrides if passed in leadData?)
                // Actually, for CSV, leadData might be raw. The parsing logic in frontend should have already structured it?
                // If mapping is present, leadData is likely raw CSV row.
                // But the user sets global fields in frontend which updates parsedLeads.
                // If we are in "MAPPING" step (file), we usually send `fullData` and `mapping`.
                // If we are in "TEXT_REVIEW", we send `parsedLeads` (already structured).

                // If "mapping" is present, we are likely in File mode.
                // But wait, in File mode, do we apply global fields?
                // The frontend implementation for File Import Global Fields is NOT yet implemented in "handleConfirmFileImport".
                // We should fix frontend to send structured data for File mode too, OR handle it here.

                // Current implementation:
                Object.entries(mapping).forEach(([targetField, sourceHeader]) => {
                    if (targetField && sourceHeader) {
                        finalLead[targetField] = leadData[sourceHeader as string];
                    }
                });
            } else {
                // Text Import: Direct structure (already includes updates from UI)
                finalLead = {
                    ...finalLead,
                    company_name: leadData.company_name || leadData.trade_name || 'Lead Sem Nome',
                    trade_name: leadData.trade_name,
                    website_url: leadData.website_url,
                    instagram_url: leadData.instagram_url,
                    city: leadData.city,
                    uf: leadData.uf,
                    notes: leadData.notes,
                    // Ensure we preserve provided fields if they exist in leadData
                    owner_id: leadData.owner_id || finalLead.owner_id,
                    status: leadData.stage_id || finalLead.status,
                    source: leadData.source || finalLead.source
                };

                // Set phone/email from primary contact if lead doesn't have direct ones
                if (leadData.contacts && leadData.contacts.length > 0) {
                    const primary = leadData.contacts.find((c: any) => c.is_primary) || leadData.contacts[0];
                    finalLead.phone = primary.phone;
                    finalLead.email = primary.email;
                    finalLead.decision_maker = primary.name;
                }
            }

            // Fallback for company_name
            if (!finalLead.company_name) {
                finalLead.company_name = finalLead.decision_maker || finalLead.trade_name || finalLead.email || 'Lead Importado';
            }

            // Create Lead with nested Contacts
            const createdLead = await prisma.leads.create({
                data: {
                    ...finalLead,
                    id: crypto.randomUUID(),
                    contacts: leadData.contacts && leadData.contacts.length > 0 ? {
                        create: leadData.contacts.map((c: ContactInput, idx: number) => ({
                            id: crypto.randomUUID(),
                            name: c.name || 'Contato ' + (idx + 1),
                            role: c.role,
                            phone: c.phone,
                            whatsapp: c.phone, // Often same as phone in BR
                            email: c.email,
                            is_primary: c.is_primary ?? idx === 0,
                            updated_at: new Date()
                        }))
                    } : undefined
                }
            });

            // Log interaction for Gamification
            await prisma.interactions.create({
                data: {
                    id: crypto.randomUUID(),
                    lead_id: createdLead.id,
                    type: 'CREATE',
                    content: `Imported from ${finalLead.source || 'Import'}`,
                    user_id: createdLead.owner_id || 'system',
                    updated_at: new Date()
                }
            });

            // XP Reward
            if (createdLead.owner_id) {
                const { GamificationService } = await import('@/lib/gamification/server');
                await GamificationService.addXP(createdLead.owner_id, 'LEAD_CREATED');
            }

            successCount++;
        } catch (error: any) {
            console.error("Lead creation error:", error);
            errorCount++;
            errorDetails.push({
                index,
                name: leadData.company_name || leadData.trade_name || `Lead #${index + 1}`,
                error: error.message || "Erro desconhecido ao salvar no banco."
            });
        }
    }

    return NextResponse.json({
        imported: successCount,
        errors: errorCount,
        errorDetails
    });
});
