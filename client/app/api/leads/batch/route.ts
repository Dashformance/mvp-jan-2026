import { NextRequest, NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/leads-service';
import { createClient } from '@/lib/supabase/server';
import { UserService } from '@/lib/services/user-service';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        if (!supabase) return NextResponse.json({ error: "Supabase not initialized" }, { status: 500 });
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dbUser = await UserService.getOrCreateUser(user);
        if (!dbUser) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        const body = await req.json();
        const result = await LeadsService.createMany(body, dbUser.id);
        return NextResponse.json(result);
    } catch (error) {
        console.error("[BATCH IMPORT ERROR]", error);
        return NextResponse.json({ error: 'Failed to import leads' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { ids, data } = body;
        if (!ids || !Array.isArray(ids) || !data) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
        const result = await LeadsService.updateMany(ids, data);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update leads' }, { status: 500 });
    }
}
