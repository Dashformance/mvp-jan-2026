const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuery() {
    console.log('--- Query Test ---');
    try {
        const counts = await Promise.all([
            prisma.leads.count({ where: { deletedAt: null } }),
            prisma.leads.count({ where: { OR: [{ owner: 'joao' }, { owner: null }, { owner: '' }], deletedAt: null } }),
            prisma.leads.count({ where: { owner: 'vitor', deletedAt: null } }),
            prisma.leads.count({ where: { OR: [{ owner: null }, { owner: '' }], deletedAt: null } }),
        ]);
        console.log('Counts:', counts);
    } catch (error) {
        console.error('❌ Query failed!');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

testQuery();
