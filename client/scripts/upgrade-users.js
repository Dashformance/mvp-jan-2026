const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upgradeUsers() {
    const emails = ['vitor@visualizen.com', 'bruno@visualizen.com'];
    console.log('--- Upgrading Users to Admin ---');
    try {
        const result = await prisma.user.updateMany({
            where: {
                email: { in: emails }
            },
            data: {
                role: 'admin'
            }
        });
        console.log(`Updated ${result.count} users.`);

        // Final check
        const updated = await prisma.user.findMany({
            where: { email: { in: emails } },
            select: { email: true, role: true }
        });
        console.log('Result:', updated);
    } catch (error) {
        console.error('❌ Upgrade failed!');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

upgradeUsers();
