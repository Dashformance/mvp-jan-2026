const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const ints = await prisma.interactions.findMany({
            where: { date: { gte: startDate } },
            select: { date: true, type: true }
        });

        const summary = {};
        ints.forEach(i => {
            const key = i.date.toISOString().split('T')[0];
            const type = i.type;
            if (!summary[key]) summary[key] = {};
            if (!summary[key][type]) summary[key][type] = 0;
            summary[key][type]++;
        });

        console.log('--- INTERACTION SUMMARY (LAST 7 DAYS) ---');
        console.log(JSON.stringify(summary, null, 2));

        const leadStats = await prisma.leads.groupBy({
            by: ['status'],
            _count: { _all: true }
        });
        console.log('\n--- LEADS BY STATUS ---');
        console.log(JSON.stringify(leadStats, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
