
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- DEBUG VITOR ACTIONS TODAY ---');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Find User
    const user = await prisma.user.findFirst({
        where: { name: { contains: 'vitor', mode: 'insensitive' } }
    });

    if (!user) {
        console.log('User Vitor not found');
        return;
    }

    console.log(`User ID: ${user.id}, Name: ${user.name}`);

    // 2. Leads added today
    const leadsAdded = await prisma.leads.findMany({
        where: {
            owner_id: user.id,
            date_added: { gte: today }
        },
        select: { id: true, company_name: true, date_added: true }
    });

    console.log(`Leads added today: ${leadsAdded.length}`);

    // 3. Interactions today
    const interactions = await prisma.interactions.findMany({
        where: {
            user_id: user.id,
            date: { gte: today }
        }
    });

    console.log(`Interactions today: ${interactions.length}`);
    interactions.forEach(i => console.log(` - ${i.type}: ${i.content} (${i.date.toISOString()})`));
}

main().finally(() => prisma.$disconnect());
