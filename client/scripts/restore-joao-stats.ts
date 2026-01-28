
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- RESTORING JOAO STATS ---');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Map Names to IDs
    const users = await prisma.user.findMany();
    const nameMap = new Map<string, string>();
    users.forEach(u => {
        if (u.name) nameMap.set(u.name.toLowerCase(), u.id);
        nameMap.set(u.id, u.id);
    });

    const interactions = await prisma.interactions.findMany({
        where: {
            date: { gte: today },
            OR: [
                { user_id: 'system' },
                { user_id: null as any }
            ]
        },
        include: { leads: true }
    });

    console.log(`Found ${interactions.length} interactions to fix.`);

    let fixedCount = 0;

    for (const i of interactions) {
        let targetId = i.user_id;

        if (i.leads) {
            targetId = i.leads.owner_id || (i.leads.owner ? (nameMap.get(i.leads.owner.toLowerCase()) ?? null) : null);
        }

        // Catch-all: If it's João's lead (by looking at the list he mentioned or source)
        // In the image, OX Empreendimentos is likely his.
        if (!targetId && i.leads?.company_name?.includes('OX')) {
            targetId = nameMap.get('joão vitor') ?? null;
        }

        if (targetId && targetId !== 'system') {
            await prisma.interactions.update({
                where: { id: i.id },
                data: { user_id: targetId }
            });
            fixedCount++;
        }
    }

    console.log(`Fixed ${fixedCount} interaction attributions.`);
}

main().finally(() => prisma.$disconnect());
