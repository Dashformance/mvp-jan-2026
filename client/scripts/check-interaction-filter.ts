
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const joaoIds = ['21d216a4-e8c9-464d-b486-0b4db827f5ba', '72a71638-cbea-4836-ba9f-f87d9d794f95'];
    const joaoNames = ['João Vitor', 'joao@visualizen.com', 'joão vitor'];

    const where: any = {
        OR: [
            { user_id: { in: joaoIds } },
            ...joaoNames.map(name => ({ user_id: { equals: name, mode: 'insensitive' as const } }))
        ],
    };

    const count = await prisma.interactions.count({ where });
    console.log(`João Interactions Count: ${count}`);

    const allCount = await prisma.interactions.count();
    console.log(`Total Interactions Count: ${allCount}`);

    const samples = await prisma.interactions.findMany({ where, take: 5 });
    console.log('Samples:', samples.map(s => s.user_id));
}

main().finally(() => prisma.$disconnect());
