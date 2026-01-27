
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const interactions = await prisma.interactions.findMany({
        where: {
            date: { gte: today },
            OR: [
                { user_id: 'system' },
                { user_id: null as any }
            ]
        },
        include: { leads: true }
    });

    console.log(`Found ${interactions.length} interactions with system/null user today.`);
    interactions.forEach(i => console.log(` - ${i.type} | Lead: ${i.leads?.company_name} | Owner: ${i.leads?.owner_id}`));
}

main().finally(() => prisma.$disconnect());
