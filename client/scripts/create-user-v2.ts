
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Force load env vars from .env.local
dotenv.config({ path: '.env.local' });

// DEBUG: Print keys to verify loading (partially obfuscated)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('URL:', url);
console.log('KEY:', key ? key.substring(0, 10) + '...' : 'MISSING');

if (!url || !key) {
    console.error("FATAL: Missing vars");
    process.exit(1);
}

const supabase = createClient(url, key);
const prisma = new PrismaClient();

async function main() {
    const email = 'joao@dashformance.com';
    const password = '@@senhaJOAO123';
    const name = 'João Vitor';

    console.log(`[Script] Attempting to create/login user: ${email}`);

    // 1. Try to Login first (maybe user exists)
    let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (!error && data.user) {
        console.log('[Script] User already exists and login successful.');
        await syncPublicUser(data.user.id, email, name);
        return;
    }

    // 2. If login failed, try SignUp
    console.log('[Script] Login failed (expected if new). Attempting SignUp...');
    const signUp = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name }
        }
    });

    if (signUp.error) {
        console.error('[Script] SignUp Error:', signUp.error.message);
        return;
    }

    if (signUp.data.user) {
        console.log('[Script] SignUp Success! UID:', signUp.data.user.id);
        await syncPublicUser(signUp.data.user.id, email, name);
    } else {
        console.log('[Script] SignUp returned no user. Check email confirmation settings.');
    }
}

async function syncPublicUser(uid: string, email: string, name: string) {
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log('[Prisma] Updating existing public user UID...');
            await prisma.user.update({
                where: { email },
                data: { supabase_uid: uid }
            });
        } else {
            console.log('[Prisma] Creating new public user...');
            await prisma.user.create({
                data: {
                    supabase_uid: uid,
                    email,
                    name,
                    role: 'admin'
                }
            });
        }
    } catch (err: any) {
        console.error('[Prisma] Sync Error:', err.message);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
