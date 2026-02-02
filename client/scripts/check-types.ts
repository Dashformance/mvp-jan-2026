
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- INTERACTION TYPES ---');
    const interactionTypes = await prisma.interactions.groupBy({
        by: ['type'],
        _count: { type: true },
    });
    console.log(interactionTypes);

    console.log('\n--- LEAD STATUSES ---');
    const leadStatuses = await prisma.leads.groupBy({
        by: ['status'],
        _count: { status: true },
    });
    console.log(leadStatuses);

    console.log('\n--- USERS ---');
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
    console.log(users);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
