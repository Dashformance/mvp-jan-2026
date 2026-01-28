
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- STAGE CONFIGURATION ---');
    const stages = await prisma.stages.findMany({
        orderBy: { position: 'asc' }
    });

    stages.forEach(s => {
        console.log(`[${s.position}] Internal: ${s.name} | Display: ${s.phase} | ID: ${s.id}`);
    });

    const userEmails = ['joao@visualizen.com', 'bruno@visualizen.com', 'vitor@visualizen.com'];

    console.log('\n--- LEAD COUNTS PER STAGE ---');
    for (const email of userEmails) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(`User ${email} not found.`);
            continue;
        }

        console.log(`\nUser: ${user.name} (${user.id})`);

        for (const stage of stages) {
            const count = await prisma.leads.count({
                where: {
                    owner_id: user.id,
                    status: stage.name,
                    deletedAt: null
                }
            });
            console.log(`  ${stage.phase} (${stage.name}): ${count}`);
        }
    }

    await prisma.$disconnect();
}

main();
