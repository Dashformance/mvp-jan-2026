
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = [
        { id: '0184fc53-a696-4ed6-b5e4-2391fd21b902', name: 'Bruno' },
        { id: '0eabdccd-e490-4e2c-a862-7f61fa576906', name: 'Vitor' }
    ];

    const stages = await prisma.stages.findMany();
    const stageMap = Object.fromEntries(stages.map(s => [s.name, s.phase]));

    for (const user of users) {
        console.log(`\n### Leads do ${user.name}`);
        const leads = await prisma.leads.findMany({
            where: { owner_id: user.id, deletedAt: null },
            orderBy: [{ status: 'asc' }, { company_name: 'asc' }]
        });

        if (leads.length === 0) {
            console.log("Nenhum lead encontrado.");
            continue;
        }

        console.log("| Empresa | Status Kanban |");
        console.log("| :--- | :--- |");
        leads.forEach(l => {
            const statusLabel = stageMap[l.status] || l.status;
            console.log(`| ${l.company_name || l.trade_name || 'Sem nome'} | ${statusLabel} |`);
        });
    }

    await prisma.$disconnect();
}

main();
