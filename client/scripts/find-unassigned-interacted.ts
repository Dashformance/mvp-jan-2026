
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Searching for unassigned leads with interactions...');

    const unassignedLeads = await prisma.leads.findMany({
        where: {
            owner_id: null
        },
        include: {
            interactions: {
                orderBy: { created_at: 'desc' }
            }
        }
    });

    console.log(`Found ${unassignedLeads.length} unassigned leads.`);

    let countWithInteractions = 0;
    unassignedLeads.forEach(lead => {
        if (lead.interactions.length > 0) {
            countWithInteractions++;
            console.log(`\nLead: ${lead.company_name} (ID: ${lead.id})`);
            console.log('Interactions:');
            lead.interactions.forEach(i => {
                console.log(`- [${i.created_at.toISOString()}] ${i.type}: ${i.content} (User ID: ${i.user_id})`);
            });
        }
    });

    console.log(`\nSummary: ${countWithInteractions} unassigned leads have interactions.`);

    await prisma.$disconnect();
}

main();
