const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sanitizeUsers() {
    const keptEmails = [
        'vitor@visualizen.com',
        'joao@visualizen.com',
        'bruno@visualizen.com'
    ];

    console.log('--- Sanitizing Users ---');
    console.log('Keeping only:', keptEmails);

    try {
        // 1. Find users to delete
        const allUsers = await prisma.user.findMany();
        const usersToDelete = allUsers.filter(u => !keptEmails.includes(u.email));

        if (usersToDelete.length === 0) {
            console.log('No users to delete.');
            return;
        }

        console.log('Users to delete:', usersToDelete.map(u => u.email));

        const idsToDelete = usersToDelete.map(u => u.id);

        // 2. Reassign leads to null to avoid foreign key violations
        const reassignedLeads = await prisma.lead.updateMany({
            where: {
                owner_id: { in: idsToDelete }
            },
            data: {
                owner_id: null,
                owner: null // Also clear the legacy string field
            }
        });
        console.log(`Reassigned ${reassignedLeads.count} leads to null owner.`);

        // 3. Delete the users
        const deletedResult = await prisma.user.deleteMany({
            where: {
                id: { in: idsToDelete }
            }
        });

        console.log(`Successfully deleted ${deletedResult.count} users.`);

        // 4. Final verification
        const remaining = await prisma.user.findMany({
            select: { email: true, name: true, role: true }
        });
        console.log('Current user list:', remaining);

    } catch (error) {
        console.error('❌ Sanitization failed!');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

sanitizeUsers();
