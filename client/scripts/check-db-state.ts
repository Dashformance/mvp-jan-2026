import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    console.log('--- Checking Leads for "Trisul" ---');
    const leads = await prisma.leads.findMany({
        where: {
            OR: [
                { company_name: { contains: 'Trisul', mode: 'insensitive' } },
                { email: { contains: 'trisul', mode: 'insensitive' } }
            ]
        },
        include: { contacts: true }
    });
    console.log(JSON.stringify(leads, null, 2));

    console.log('\n--- Checking User "joao" ---');
    const users = await prisma.user.findMany({
        where: { email: 'joao@visualizen.com' }
    });
    console.log(JSON.stringify(users, null, 2));

    console.log('\n--- Checking Statistics of Leads ---');
    const stats = await prisma.leads.groupBy({
        by: ['status'],
        _count: { _all: true }
    });
    console.log(JSON.stringify(stats, null, 2));

    await prisma.$disconnect();
}

check();
