
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const interactions = await prisma.interactions.findMany({
        orderBy: { date: 'desc' },
        take: 30
    });

    console.log('Recent Interactions (System Wide):');
    interactions.forEach(i => console.log(` - ${i.date.toISOString()} | ${i.type} | ${i.user_id} | ${i.content}`));
}

main().finally(() => prisma.$disconnect());
