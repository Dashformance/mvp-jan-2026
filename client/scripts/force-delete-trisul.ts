import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function forceDelete() {
    console.log('--- Force Deleting Trisul Leads ---');

    // Find them first to log IDs
    const leads = await prisma.leads.findMany({
        where: {
            OR: [
                { company_name: { contains: 'Trisul', mode: 'insensitive' } },
                { trade_name: { contains: 'Trisul', mode: 'insensitive' } },
                { email: { contains: 'trisul', mode: 'insensitive' } }
            ]
        }
    });

    if (leads.length === 0) {
        console.log('No Trisul leads found.');
        return;
    }

    console.log(`Found ${leads.length} leads to delete:`);
    leads.forEach(l => console.log(`- ${l.company_name} (${l.id}) [Status: ${l.status}]`));

    const { count } = await prisma.leads.deleteMany({
        where: {
            id: { in: leads.map(l => l.id) }
        }
    });

    console.log(`\nSuccessfully hard deleted ${count} leads.`);
}

forceDelete()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
