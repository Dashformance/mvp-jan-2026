
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const dbUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseKey || !dbUrl) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function main() {
    const email = 'joao@dashformance.com';
    const password = '@@senhaJOAO123';
    const name = 'João Vitor';

    console.log(`Creating user ${email}...`);

    // 1. Create Auth User
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name,
            }
        }
    });

    if (error) {
        console.error('Error creating auth user:', error.message);
        // If user already exists, we might still want to try creating the public user profile if missing
        if (!error.message.includes('already registered')) {
            return;
        }
        console.log('User might already exist in Auth, attempting to find or sync public profile...');
        // We can't get the UID from signIn with just anon key if we don't know the password... 
        // BUT we DO know the password!
        const login = await supabase.auth.signInWithPassword({ email, password });
        if (login.error) {
            console.error('Could not login with provided credentials:', login.error.message);
            return;
        }
        if (login.data.user) {
            await syncPublicUser(login.data.user.id, email, name);
        }
        return;
    }

    if (data.user) {
        console.log('Auth user created with ID:', data.user.id);
        await syncPublicUser(data.user.id, email, name);
    } else {
        console.log('Auth user creation returned no user data. Maybe email confirmation is required?');
    }
}

async function syncPublicUser(uid: string, email: string, name: string) {
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log('Public user already exists. Updating UID...');
            await prisma.user.update({
                where: { email },
                data: { supabase_uid: uid }
            });
            console.log('Updated existing user with Supabase UID.');
        } else {
            console.log('Creating public user profile...');
            await prisma.user.create({
                data: {
                    id: (globalThis as any).crypto?.randomUUID?.() || require('crypto').randomUUID(),
                    supabase_uid: uid,
                    email,
                    name,
                    role: 'admin'
                }
            });
            console.log('Public user profile created.');
        }
    } catch (err: any) {
        console.error('Error syncing public user:', err.message);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
