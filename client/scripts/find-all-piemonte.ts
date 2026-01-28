
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const searchTerm = 'Piemonte';
    console.log(`Searching for ALL leads (including deleted) matching: ${searchTerm}...`);

    const leads = await prisma.leads.findMany({
        where: {
            OR: [
                { company_name: { contains: searchTerm, mode: 'insensitive' } },
                { trade_name: { contains: searchTerm, mode: 'insensitive' } }
            ]
        },
        include: {
            interactions: {
                orderBy: { created_at: 'desc' }
            }
        }
    });

    leads.forEach(lead => {
        console.log(`\nLead: ${lead.company_name} (ID: ${lead.id})`);
        console.log(`Status: ${lead.status}`);
        console.log(`DeletedAt: ${lead.deletedAt}`);
        console.log(`Owner ID: ${lead.owner_id}`);
        console.log(`Owner Label: ${lead.owner}`);
        console.log(`Interactions: ${lead.interactions.length}`);
        lead.interactions.forEach(i => {
            console.log(`- [${i.created_at.toISOString()}] ${i.type}: ${i.content} (User ID: ${i.user_id})`);
        });
    });

    await prisma.$disconnect();
}

main();
