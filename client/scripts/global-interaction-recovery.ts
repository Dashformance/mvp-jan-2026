
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- GLOBAL INTERACTION RECOVERY ---');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Build a robust User Map
    const users = await prisma.user.findMany();
    const idMap = new Map<string, string>(); // Any known variant -> Primary UUID
    users.forEach(u => {
        idMap.set(u.id, u.id);
        if (u.supabase_uid) idMap.set(u.supabase_uid, u.id);
        if (u.name) idMap.set(u.name.toLowerCase(), u.id);
        if (u.email) idMap.set(u.email.toLowerCase(), u.id);
        idMap.set(u.email.split('@')[0].toLowerCase(), u.id); // 'vitor', 'joao'
    });

    // 2. Find interactions with missing/unresolved users
    const interactions = await prisma.interactions.findMany({
        where: { date: { gte: today } },
        include: { leads: true }
    });

    console.log(`Analyzing ${interactions.length} interactions from today...`);

    let recovered = 0;
    for (const i of interactions) {
        let currentUserId = i.user_id;
        let resolvedId = currentUserId ? idMap.get(currentUserId.toLowerCase()) : null;

        if (!resolvedId) {
            // Try to infer from lead
            if (i.leads) {
                const ownerId = i.leads.owner_id;
                const ownerName = i.leads.owner;

                if (ownerId && idMap.has(ownerId)) {
                    resolvedId = idMap.get(ownerId);
                } else if (ownerName && idMap.has(ownerName.toLowerCase())) {
                    resolvedId = idMap.get(ownerName.toLowerCase());
                }
            }
        }

        if (resolvedId && resolvedId !== currentUserId) {
            // console.log(`Recovering: ${i.type} for lead ${i.leads?.company_name} -> ${resolvedId}`);
            await prisma.interactions.update({
                where: { id: i.id },
                data: { user_id: resolvedId }
            });
            recovered++;
        }
    }

    console.log(`Success: Recovered ${recovered} interaction attributions.`);

    // 3. Final Check on Vitor
    const vitor = Array.from(users).find(u => u.name?.toLowerCase().includes('vitor'));
    if (vitor) {
        const vitorCount = await prisma.interactions.count({
            where: { user_id: vitor.id, date: { gte: today } }
        });
        console.log(`Vitor now has ${vitorCount} attributed actions today.`);
    }
}

main().finally(() => prisma.$disconnect());
