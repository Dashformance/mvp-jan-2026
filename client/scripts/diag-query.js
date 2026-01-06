const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuery() {
    console.log('--- Query Test ---');
    try {
        const counts = await Promise.all([
            prisma.lead.count({ where: { deletedAt: null } }),
            prisma.lead.count({ where: { OR: [{ owner: 'joao' }, { owner: null }, { owner: '' }], deletedAt: null } }),
            prisma.lead.count({ where: { owner: 'vitor', deletedAt: null } }),
            prisma.lead.count({ where: { OR: [{ owner: null }, { owner: '' }], deletedAt: null } }),
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
