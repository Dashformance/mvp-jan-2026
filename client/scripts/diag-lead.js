const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLeads() {
    console.log('--- Lead Check ---');
    try {
        const leads = await prisma.leads.findMany({
            where: { deletedAt: null },
            take: 1
        });
        console.log('Sample Lead:', JSON.stringify(leads[0], null, 2));
        console.log('Count:', leads.length);
    } catch (error) {
        console.error('❌ Failed!');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLeads();
