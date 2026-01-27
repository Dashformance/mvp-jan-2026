
import { PrismaClient } from '@prisma/client';
import { ACTION_POINTS, LEVEL_CONFIG } from '../lib/gamification/config';
import { calculateLevel } from '../lib/gamification/level';

const prisma = new PrismaClient();

async function main() {
    console.log('--- XP MIGRATION & RESTORE ---');

    // 0. Build User Map (Name -> ID)
    const allUsers = await prisma.user.findMany();
    const userMap = new Map<string, string>();
    allUsers.forEach(u => {
        userMap.set(u.id, u.id);
        if (u.name) userMap.set(u.name.toLowerCase(), u.id);
        if (u.email) userMap.set(u.email.toLowerCase(), u.id);
    });

    console.log('User Map built:', Array.from(userMap.keys()));

    // 1. Reset all users to 0
    await prisma.user.updateMany({
        data: { xp: 0, level: 1 }
    });
    console.log('Reset all users to 0 XP.');

    // 2. Fetch all interactions
    const interactions = await prisma.interactions.findMany({
        include: {
            leads: true
        }
    });

    console.log(`Found ${interactions.length} interactions.`);

    const userXP = new Map<string, number>();

    for (const interaction of interactions) {
        let rawUserId = interaction.user_id;

        // Try to infer user if missing
        if (!rawUserId && interaction.leads) {
            rawUserId = interaction.leads.owner_id || interaction.leads.owner;
        }

        if (!rawUserId) continue;

        // Resolve ID from Map
        const userId = userMap.get(rawUserId.toLowerCase()) || (rawUserId.length > 20 ? rawUserId : null); // Fallback to raw if UUID-like

        if (!userId) {
            // console.warn(`Could not resolve user for ${rawUserId}`);
            continue;
        }

        let points = 0;
        const lowerType = interaction.type.toLowerCase();
        const content = interaction.content || '';

        // Map Interaction Type to Points
        if (lowerType === 'lead_created' || lowerType === 'creation') points = ACTION_POINTS.LEAD_CREATED;
        else if (lowerType === 'lead_contacted' || lowerType === 'call' || lowerType === 'whatsapp' || lowerType === 'email') points = ACTION_POINTS.LEAD_CONTACTED;
        else if (lowerType === 'lead_qualified' || lowerType === 'meeting' || content.includes('MEETING')) points = ACTION_POINTS.LEAD_QUALIFIED;
        else if (lowerType === 'lead_converted' || lowerType === 'won' || lowerType === 'sales' || content.includes('SOLD') || content.includes('WON')) points = ACTION_POINTS.LEAD_CONVERTED;
        else if (lowerType === 'status_change') {
            if (content.includes('CONTACTED') || content.includes('Step 2')) points = ACTION_POINTS.LEAD_CONTACTED;
            if (content.includes('MEETING') || content.includes('Step 3')) points = ACTION_POINTS.LEAD_QUALIFIED;
            if (content.includes('SOLD') || content.includes('WON') || content.includes('Step 4')) points = ACTION_POINTS.LEAD_CONVERTED;
        }

        if (points > 0) {
            const current = userXP.get(userId) || 0;
            userXP.set(userId, current + points);
        }
    }

    // 3. Apply XP to Users
    for (const [userId, xp] of userXP) {
        const level = calculateLevel(xp);
        console.log(`Updating User ${userId}: ${xp} XP (Level ${level})`);

        try {
            await prisma.user.update({
                where: { id: userId },
                data: { xp, level }
            });
        } catch (err) {
            console.warn(`Skipping missing user ${userId}`);
        }
    }

    console.log('Migration Complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
