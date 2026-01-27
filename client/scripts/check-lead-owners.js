
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const leads = await prisma.leads.findMany({
        take: 20,
        select: {
            owner: true,
            owner_id: true,
            status: true
        }
    });
    console.log('Sample Leads:', leads);

    const distinctOwners = await prisma.leads.groupBy({
        by: ['owner'],
        _count: {
            owner: true
        }
    });
    console.log('Distinct Owners:', distinctOwners);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
