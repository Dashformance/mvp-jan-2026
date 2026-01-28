
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const brunoId = '0184fc53-a696-4ed6-b5e4-2391fd21b902';

    // Find all leads that Bruno interacted with in the last 48 hours
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const interactions = await prisma.interactions.findMany({
        where: {
            user_id: brunoId,
            created_at: { gte: twoDaysAgo }
        },
        include: {
            leads: {
                select: {
                    id: true,
                    company_name: true,
                    owner_id: true,
                    owner: true
                }
            }
        },
        orderBy: { created_at: 'desc' }
    });

    console.log(`Bruno has ${interactions.length} interactions in the last 48 hours.`);

    const leadMap = new Map<string, any>();
    interactions.forEach(i => {
        if (i.leads) {
            if (!leadMap.has(i.lead_id!)) {
                leadMap.set(i.lead_id!, {
                    name: i.leads.company_name,
                    ownerId: i.leads.owner_id,
                    ownerLabel: i.leads.owner,
                    interactionCount: 0,
                    lastInteraction: i.created_at
                });
            }
            leadMap.get(i.lead_id!).interactionCount++;
        }
    });

    console.log(`Bruno interacted with ${leadMap.size} unique leads.`);

    console.log('\nLeads interacted by Bruno that ARE NOT owned by him:');
    let count = 0;
    leadMap.forEach((data, id) => {
        if (data.ownerId !== brunoId) {
            count++;
            console.log(`- ${data.name} (ID: ${id})`);
            console.log(`  Current Owner: ${data.ownerLabel} (${data.ownerId})`);
            console.log(`  Bruno's interactions: ${data.interactionCount}`);
            console.log(`  Last one: ${data.lastInteraction.toISOString()}`);
        }
    });

    if (count === 0) {
        console.log('None found. All leads Bruno interacted with are currently owned by him.');
    }

    await prisma.$disconnect();
}

main();
