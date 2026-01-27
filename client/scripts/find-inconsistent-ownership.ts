
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = [
        { id: '21d216a4-e8c9-464d-b486-0b4db827f5ba', name: 'João', email: 'joao@visualizen.com' },
        { id: '0184fc53-a696-4ed6-b5e4-2391fd21b902', name: 'Bruno', email: 'bruno@visualizen.com' },
        { id: '0eabdccd-e490-4e2c-a862-7f61fa576906', name: 'Vitor', email: 'vitor@visualizen.com' }
    ];

    console.log('--- SEARCHING FOR LEADS WITH OWNER NAME BUT NO OWNER_ID ---');

    for (const user of users) {
        console.log(`\nUser: ${user.name} (${user.id})`);

        const leads = await prisma.leads.findMany({
            where: {
                owner_id: null,
                owner: {
                    contains: user.name,
                    mode: 'insensitive'
                },
                deletedAt: null
            }
        });

        console.log(`Found ${leads.length} leads with owner name containing "${user.name}" but no ID.`);
        leads.forEach(l => {
            console.log(`- ${l.company_name} (ID: ${l.id}) | Current Owner Label: ${l.owner} | Status: ${l.status}`);
        });
    }

    console.log('\n--- SEARCHING FOR BRUNO\'S LEADS THAT WERE JOÃO\'S BEFORE ---');
    const brunoLeadsWithJoaoWork = await prisma.leads.findMany({
        where: {
            owner_id: users[1].id, // Bruno
            interactions: {
                some: { user_id: users[0].id } // João
            },
            deletedAt: null
        },
        include: {
            interactions: {
                where: { user_id: { in: [users[0].id, users[1].id].filter((id): id is string => id !== null) } },
                orderBy: { created_at: 'desc' }
            }
        }
    });

    console.log(`Found ${brunoLeadsWithJoaoWork.length} leads owned by Bruno but with interactions by João.`);
    brunoLeadsWithJoaoWork.forEach(l => {
        const joaoCount = l.interactions.filter(i => i.user_id === users[0].id).length;
        const brunoCount = l.interactions.filter(i => i.user_id === users[1].id).length;
        console.log(`- ${l.company_name} (ID: ${l.id}) | João ints: ${joaoCount} | Bruno ints: ${brunoCount}`);
    });

    await prisma.$disconnect();
}

main();
