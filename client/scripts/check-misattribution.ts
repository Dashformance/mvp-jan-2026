
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const joaoId = '21d216a4-e8c9-464d-b486-0b4db827f5ba';
    const brunoId = '0184fc53-a696-4ed6-b5e4-2391fd21b902';

    console.log('--- Checking Bruno\'s ATTEMPTED leads for João\'s interactions ---');

    const brunoAttempted = await prisma.leads.findMany({
        where: {
            owner_id: brunoId,
            status: 'ATTEMPTED',
            deletedAt: null
        },
        include: {
            interactions: {
                orderBy: { created_at: 'desc' }
            }
        }
    });

    console.log(`Bruno has ${brunoAttempted.length} leads in ATTEMPTED.`);

    brunoAttempted.forEach(lead => {
        const joaoInteractions = lead.interactions.filter(i => i.user_id === joaoId);
        if (joaoInteractions.length > 0) {
            console.log(`\nLead: ${lead.company_name} (ID: ${lead.id})`);
            console.log(`  Bruno is owner, but João has ${joaoInteractions.length} interactions.`);
            joaoInteractions.forEach(i => {
                console.log(`  - [${i.created_at.toISOString()}] ${i.type}: ${i.content}`);
            });
        }
    });

    console.log('\n--- Checking for UNASSIGNED leads in ATTEMPTED ---');
    const unassignedAttempted = await prisma.leads.findMany({
        where: {
            owner_id: null,
            status: 'ATTEMPTED',
            deletedAt: null
        }
    });
    console.log(`Found ${unassignedAttempted.length} unassigned leads in ATTEMPTED.`);

    await prisma.$disconnect();
}

main();
