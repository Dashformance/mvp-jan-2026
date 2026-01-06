const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    console.log('--- Data Check ---');
    try {
        const totalLeads = await prisma.lead.count();
        const activeLeads = await prisma.lead.count({ where: { deletedAt: null } });
        const deletedLeads = await prisma.lead.count({ where: { NOT: { deletedAt: null } } });

        console.log(`Total Leads in DB: ${totalLeads}`);
        console.log(`Active Leads (deletedAt is null): ${activeLeads}`);
        console.log(`Deleted Leads (deletedAt is not null): ${deletedLeads}`);

        if (totalLeads > 0 && activeLeads === 0) {
            console.log('\n💡 Tip: All leads seem to be marked as deleted.');
        } else if (totalLeads === 0) {
            console.log('\n💡 Tip: The leads table is completely empty.');
        }

        // Check segments too
        const segments = await prisma.segment.findMany({ take: 5 });
        console.log('\nSegments found:', segments.length);

    } catch (error) {
        console.error('❌ Data check failed!');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
