
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const joaoId = '21d216a4-e8c9-464d-b486-0b4db827f5ba';
    const brunoId = '0184fc53-a696-4ed6-b5e4-2391fd21b902';
    const vitorId = '0eabdccd-e490-4e2c-a862-7f61fa576906';

    console.log('--- ANALYSIS OF ATTEMPTED LEADS ---');

    const attemptedLeads = await prisma.leads.findMany({
        where: {
            status: 'ATTEMPTED',
            deletedAt: null
        },
        include: {
            interactions: true
        }
    });

    console.log(`Total leads in ATTEMPTED: ${attemptedLeads.length}`);

    for (const lead of attemptedLeads) {
        const counts = {
            joao: lead.interactions.filter(i => i.user_id === joaoId).length,
            bruno: lead.interactions.filter(i => i.user_id === brunoId).length,
            vitor: lead.interactions.filter(i => i.user_id === vitorId).length,
            anon: lead.interactions.filter(i => i.user_id === null).length,
            system: lead.interactions.filter(i => i.user_id === 'system').length
        };

        console.log(`\nLead: ${lead.company_name} (ID: ${lead.id})`);
        console.log(`  Current Owner: ${lead.owner} (${lead.owner_id})`);
        console.log(`  Interactions: João: ${counts.joao} | Bruno: ${counts.bruno} | Vitor: ${counts.vitor} | Anon: ${counts.anon}`);

        if (counts.joao > counts.bruno && lead.owner_id !== joaoId) {
            console.log(`  >>> POTENTIAL MISATTRIBUTION: Joao has more interactions but Bruno owns it.`);
        }

        const lastInteraction = lead.interactions.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0];
        if (lastInteraction) {
            console.log(`  Last Interaction: [${lastInteraction.created_at.toISOString()}] ${lastInteraction.type} (User: ${lastInteraction.user_id})`);
        }
    }

    await prisma.$disconnect();
}

main();
