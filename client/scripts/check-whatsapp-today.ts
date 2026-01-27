
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- CHECK WHATSAPP INTERACTIONS TODAY ---');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const interactions = await prisma.interactions.findMany({
        where: {
            type: { in: ['WHATSAPP', 'CALL', 'EMAIL'] },
            date: { gte: today }
        },
        include: { leads: true }
    });

    console.log(`Found ${interactions.length} contact interactions today.`);
    interactions.forEach(i => {
        console.log(` - ${i.type} | User: ${i.user_id} | Lead: ${i.leads?.company_name} | Date: ${i.date.toISOString()}`);
    });
}

main().finally(() => prisma.$disconnect());
