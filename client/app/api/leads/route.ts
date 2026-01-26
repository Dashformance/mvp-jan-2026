import { NextRequest, NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';
import { withApiErrorHandling } from '@/lib/api-handler';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export const GET = withApiErrorHandling(async (req: NextRequest) => {
    console.log("[DEBUG] GET /api/leads hit");
    try {
        const supabase = await createClient();
        if (!supabase) return NextResponse.json({ error: "Supabase not initialized" }, { status: 500 });
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch Internal User ID (Try SupabaseUID first, then Email fallback)
        let dbUser = await prisma.user.findUnique({
            where: { supabase_uid: user.id }
        });

        // Fallback: Link by email if UID mismatch
        if (!dbUser && user.email) {
            console.log(`[API] DB User not found by UID ${user.id}, trying email ${user.email}`);
            dbUser = await prisma.user.findUnique({
                where: { email: user.email }
            });

            // Auto-heal: Update UID if found by email
            if (dbUser && !dbUser.supabase_uid) {
                await prisma.user.update({
                    where: { id: dbUser.id },
                    data: { supabase_uid: user.id }
                });
            }
        }

        if (!dbUser) {
            console.error(`[API] User profile not found for email: ${user.email}`);
            return NextResponse.json({ error: "User profile not found in DB" }, { status: 404 });
        }

        console.log(`[API] DB User: ${dbUser.email} (${dbUser.id}) | Role: ${dbUser.role}`);

        const searchParams = req.nextUrl.searchParams;

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        const search = searchParams.get('search') || undefined;
        const status = searchParams.get('status')?.split(',') || undefined;
        const source = searchParams.get('source')?.split(',') || undefined;

        const city = searchParams.get('city') || undefined;
        const sortBy = searchParams.get('sortBy') || undefined;
        const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

        const scoreMinParam = searchParams.get('scoreMin');
        const scoreMaxParam = searchParams.get('scoreMax');
        const scoreMin = scoreMinParam ? parseInt(scoreMinParam) : undefined;
        const scoreMax = scoreMaxParam ? parseInt(scoreMaxParam) : undefined;

        const view = searchParams.get('view') || 'mine';

        // If Admin, show ALL leads (ownerId = undefined)
        // If Seller, show only THEIR leads (unless view=all)
        const ownerId = view === 'all' ? undefined : dbUser.id;

        console.log(`[API] Filtering leads for ownerId: ${ownerId || 'ALL (Admin)'}`);

        const leads = await LeadsService.findAll(page, limit, {
            search,
            status,
            ownerId,
            source,
            city,
            sortBy,
            sortOrder,
            scoreMin,
            scoreMax
        });

        console.log(`[DEBUG] LeadsService returned ${leads?.data?.length} leads`);

        return NextResponse.json(leads);
    } catch (error) {
        console.error("[DEBUG] Error inside GET /api/leads:", error);
        throw error;
    }
});

export const POST = withApiErrorHandling(async (req: NextRequest) => {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not initialized" }, { status: 500 });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("[ROUTE] Creating lead with body keys:", Object.keys(body));

    // Fetch Internal User ID to link correctly
    const dbUser = await prisma.user.findUnique({
        where: { supabase_uid: user.id }
    });

    if (!dbUser) {
        return NextResponse.json({ error: "User profile not found in DB" }, { status: 404 });
    }

    // Force owner assignment to logged user (INTERNAL ID)
    const leadData = {
        ...body,
        owner_id: dbUser.id
    };

    const lead = await LeadsService.create(leadData);
    return NextResponse.json(lead);
});
