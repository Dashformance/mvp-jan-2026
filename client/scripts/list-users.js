const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    console.log('--- Database Users ---');
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                supabase_uid: true
            }
        });
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('❌ Failed to list users');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
