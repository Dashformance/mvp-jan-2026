
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- USER XP DEBUG ---');
    const users = await prisma.user.findMany();
    console.log(JSON.stringify(users.map(u => ({ id: u.id, name: u.name, email: u.email, xp: u.xp, level: u.level })), null, 2));

    console.log('\n--- LEAD STATUS DEBUG ---');
    const statusGroups = await prisma.leads.groupBy({
        by: ['status'],
        _count: { status: true }
    });
    console.log(JSON.stringify(statusGroups, null, 2));

    console.log('\n--- RECENT INTERACTIONS ---');
    const recentInteractions = await prisma.interactions.findMany({
        take: 10,
        orderBy: { date: 'desc' }
    });
    console.log(JSON.stringify(recentInteractions, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
