
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- CHECK VITOR DATA ---');

    // 1. Find User 'vitor'
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: 'vitor', mode: 'insensitive' } },
                { email: { contains: 'vitor', mode: 'insensitive' } }
            ]
        }
    });
    console.log('Users found:', users.map(u => ({ id: u.id, name: u.name, xp: u.xp })));

    if (users.length === 0) return;

    // 2. Check Leads owned by these users
    for (const u of users) {
        const leadCount = await prisma.leads.count({
            where: { owner_id: u.id }
        });
        const leadCountByName = await prisma.leads.count({
            where: { owner: { equals: u.name, mode: 'insensitive' } }
        });

        console.log(`User ${u.name} (${u.id}):`);
        console.log(`- Leads with owner_id=${u.id}: ${leadCount}`);
        console.log(`- Leads with owner="${u.name}": ${leadCountByName}`);

        // Check interactions
        const interactionCount = await prisma.interactions.count({
            where: { user_id: u.id }
        });
        console.log(`- Interactions with user_id=${u.id}: ${interactionCount}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
