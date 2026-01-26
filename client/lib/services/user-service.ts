import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';

export class UserService {
    /**
     * Finds a user by Supabase ID or Email.
     * If found by email but missing UID, it auto-heals the record.
     * If not found at all, it auto-provisions a new user record.
     */
    static async getOrCreateUser(supabaseUser: any): Promise<User | null> {
        const { id: uid, email, user_metadata } = supabaseUser;
        if (!email) return null;

        // 1. Try to find by Supabase UID
        let user = await prisma.user.findUnique({
            where: { supabase_uid: uid }
        });

        // 2. Auto-heal: Try to find by Email if UID mismatch/missing
        if (!user) {
            console.log(`[USER-SERVICE] User not found by UID ${uid}, searching by email ${email}`);
            user = await prisma.user.findUnique({
                where: { email }
            });

            if (user) {
                console.log(`[USER-SERVICE] Auto-healing: Linking user ${email} to Supabase UID ${uid}`);
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { supabase_uid: uid }
                });
            }
        }

        // 3. Auto-provision: Create user if not found at all
        if (!user) {
            console.log(`[USER-SERVICE] Auto-provisioning new user: ${email}`);
            user = await prisma.user.create({
                data: {
                    email,
                    supabase_uid: uid,
                    name: user_metadata?.name || email.split('@')[0],
                    role: 'seller', // Default role
                    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user_metadata?.name || email)}&background=random`
                }
            });
        }

        return user;
    }
}
