
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const todayReset = new Date();
    todayReset.setHours(0, 0, 0, 0);

    // Replicate what LeadsService.getDashboardUsers returns
    const user = {
        ids: ['0eabdccd-e490-4e2c-a862-7f61fa576906', 'c9872b75-b48e-4827-ae25-6acd69bbb23d'],
        names: ['vitor', 'vitor@visualizen.com', 'vitor']
    };

    const userInteractionWhere: any = {
        OR: [
            { user_id: { in: user.ids } },
            ...user.names.map(name => ({ user_id: { equals: name, mode: 'insensitive' as const } }))
        ],
    };

    const todayInteractionWhere: any = {
        ...userInteractionWhere,
        date: { gte: todayReset }
    };

    console.log('Today Reset:', todayReset.toISOString());
    console.log('Query structure:', JSON.stringify(todayInteractionWhere, null, 2));

    const interactions = await prisma.interactions.findMany({
        where: todayInteractionWhere,
        select: { type: true, content: true }
    });

    console.log(`Found ${interactions.length} interactions for Vitor today.`);
}

main().finally(() => prisma.$disconnect());
