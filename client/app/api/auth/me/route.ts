import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user-service';

export async function GET() {
    try {
        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Supabase not initialized' }, { status: 500 });
        }
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch Internal User ID (using UserService for auto-provisioning/healing)
        const dbUser = await UserService.getOrCreateUser(user);

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
        }

        return NextResponse.json(dbUser);
    } catch (error) {
        console.error('[API/AUTH/ME] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
