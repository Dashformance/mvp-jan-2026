import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY or URL");
    process.exit(1);
}

// Use Service Role to bypass email confirmation/limitations
const supabase = createClient(url, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
const prisma = new PrismaClient();

async function main() {
    const email = 'joao@dashformance.com';
    const password = '@@senhaJOAO123';
    const name = 'João Vitor';

    console.log(`[Admin] Creating/Syncing user: ${email}`);

    // 1. Create User in Auth (Admin)
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name }
    });

    let userId: string | undefined;

    if (error) {
        if (error.message.includes('already registered')) {
            console.log('[Admin] User already exists in Auth. Fetching ID...');
            const { data: list } = await supabase.auth.admin.listUsers();
            userId = list?.users.find(u => u.email === email)?.id;
        } else {
            console.error('[Admin] Error:', error.message);
            return;
        }
    } else {
        userId = data.user?.id;
        console.log('[Admin] User created in Auth. ID:', userId);
    }

    if (userId) {
        await syncPublicUser(userId, email, name);
    }
}

async function syncPublicUser(uid: string, email: string, name: string) {
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log('[Prisma] Updating existing user...');
            await prisma.user.update({
                where: { email },
                data: { supabase_uid: uid, name }
            });
        } else {
            console.log('[Prisma] Creating new profile...');
            await prisma.user.create({
                data: {
                    supabase_uid: uid,
                    email,
                    name,
                    role: 'admin'
                }
            });
        }
        console.log('[Success] User synced to database.');
    } catch (err: any) {
        console.error('[Prisma] Error:', err.message);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
