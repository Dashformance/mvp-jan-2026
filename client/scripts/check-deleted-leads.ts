
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const brunoId = '0184fc53-a696-4ed6-b5e4-2391fd21b902';

    console.log('Searching for soft-deleted leads that belonged to Bruno...');

    const deletedLeads = await prisma.leads.findMany({
        where: {
            deletedAt: { not: null },
            owner_id: brunoId
        },
        include: {
            interactions: true
        }
    });

    console.log(`Found ${deletedLeads.length} deleted leads for Bruno.`);
    deletedLeads.forEach(l => {
        console.log(`- ${l.company_name} (ID: ${l.id}, Deleted at: ${l.deletedAt})`);
    });

    console.log('\nSearching for ALL soft-deleted leads interacted by ANYONE today...');
    const today = new Date('2026-01-27T00:00:00Z');
    const deletedToday = await prisma.leads.findMany({
        where: {
            deletedAt: { gte: today }
        },
        include: {
            interactions: {
                where: { created_at: { gte: today } }
            }
        }
    });

    console.log(`Found ${deletedToday.length} leads deleted today.`);
    deletedToday.forEach(l => {
        console.log(`- ${l.company_name} (ID: ${l.id}, Owner: ${l.owner_id}, Interactions: ${l.interactions.length})`);
    });

    await prisma.$disconnect();
}

main();
