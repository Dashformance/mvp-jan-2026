import { NextRequest, NextResponse } from 'next/server';
import { InteractionsService } from '@/lib/services/interactions-service';
import { withApiErrorHandling } from '@/lib/api-handler';
import { createClient } from '@/lib/supabase/server';
import { UserService } from '@/lib/services/user-service';

export const GET = withApiErrorHandling(async (req: NextRequest) => {
    const leadId = req.nextUrl.searchParams.get('lead_id');

    if (!leadId) {
        return NextResponse.json(
            { error: { message: "lead_id query param is required" } },
            { status: 400 }
        );
    }

    const interactions = await InteractionsService.findByLead(leadId);
    return NextResponse.json(interactions);
});

export const POST = withApiErrorHandling(async (req: NextRequest) => {
    const body = await req.json();

    if (!body.lead_id || !body.content || !body.type) {
        return NextResponse.json(
            { error: { message: "Missing required fields: lead_id, content, type" } },
            { status: 400 }
        );
    }

    // NEW: Session-based attribution
    if (!body.user_id) {
        const supabase = await createClient();
        if (supabase) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch internal user ID
                const dbUser = await UserService.getOrCreateUser(user);
                if (dbUser) body.user_id = dbUser.id;
            }
        }
    }

    const interaction = await InteractionsService.create(body);
    return NextResponse.json(interaction);
});
