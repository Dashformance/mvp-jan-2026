
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const userId = "21d216a4-e8c9-464d-b486-0b4db827f5ba";
    const userIds = [userId, "72a71638-cbea-4836-ba9f-f87d9d794f95"];
    const userNames = ["João Vitor", "joao@visualizen.com", "joão vitor"];

    const userLeadWhere: any = {
        OR: [
            { owner_id: { in: userIds } },
            ...userNames.map(name => ({ owner: { equals: name, mode: 'insensitive' as const } }))
        ],
        deletedAt: null
    };

    const todayReset = new Date();
    todayReset.setHours(0, 0, 0, 0);

    console.log('User IDs:', userIds);
    console.log('Today Reset:', todayReset.toISOString());

    const total = await prisma.leads.count({ where: userLeadWhere });
    const addedToday = await prisma.leads.count({
        where: {
            ...userLeadWhere,
            date_added: { gte: todayReset }
        }
    });

    console.log('Total Leads:', total);
    console.log('Added Today:', addedToday);

    // If addedToday is 0, let's find one lead and see its date_added
    if (addedToday === 0) {
        const oneLead = await prisma.leads.findFirst({
            where: userLeadWhere,
            orderBy: { date_added: 'desc' }
        });
        if (oneLead) {
            console.log('Sample Lead:', oneLead.company_name);
            console.log('Lead Date Added:', oneLead.date_added.toISOString());
            console.log('Is >= Today Reset?', oneLead.date_added >= todayReset);
        }
    }
}

main().finally(() => prisma.$disconnect());
