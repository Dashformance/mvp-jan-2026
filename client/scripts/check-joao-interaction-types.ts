
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const userId = "21d216a4-e8c9-464d-b486-0b4db827f5ba";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const interactions = await prisma.interactions.findMany({
        where: { user_id: userId, date: { gte: today } },
        orderBy: { date: 'desc' }
    });

    console.log(`João Interactions Today: ${interactions.length}`);
    interactions.forEach(i => console.log(` - ${i.type} | ${i.content}`));
}

main().finally(() => prisma.$disconnect());
