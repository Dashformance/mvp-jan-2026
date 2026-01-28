
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = [
        { id: '21d216a4-e8c9-464d-b486-0b4db827f5ba', name: 'João Vitor', short: 'joao', email: 'joao@visualizen.com' },
        { id: '0184fc53-a696-4ed6-b5e4-2391fd21b902', name: 'Bruno', short: 'bruno', email: 'bruno@visualizen.com' },
        { id: '0eabdccd-e490-4e2c-a862-7f61fa576906', name: 'Vitor', short: 'vitor', email: 'vitor@visualizen.com' }
    ];

    console.log('--- EXECUTING OWNERSHIP STABILITY FIX ---');

    // 1. Fix missing owner_id based on owner text label
    for (const user of users) {
        console.log(`\nValidating mapping for ${user.name}...`);

        const res = await prisma.leads.updateMany({
            where: {
                owner_id: null,
                OR: [
                    { owner: { contains: user.short, mode: 'insensitive' } },
                    { owner: { contains: user.name, mode: 'insensitive' } }
                ],
                deletedAt: null
            },
            data: {
                owner_id: user.id
            }
        });
        console.log(`  Set owner_id for ${res.count} leads previously identifying as "${user.short}/${user.name}" by label.`);
    }

    // 2. Revert Bruno's greedy recovery for leads that were Joao's
    console.log('\nReverting accidental reassignments from Bruno back to João...');

    // We target leads currently owned by Bruno that have historical João interactions 
    // AND either had João as owner_id before OR have more João interactions than Bruno.
    const candidates = await prisma.leads.findMany({
        where: {
            owner_id: users[1].id, // Bruno
            interactions: {
                some: { user_id: users[0].id } // João
            },
            deletedAt: null
        },
        include: {
            interactions: true
        }
    });

    let revertedCount = 0;
    for (const lead of candidates) {
        const joaoInts = lead.interactions.filter(i => i.user_id === users[0].id).length;
        const brunoInts = lead.interactions.filter(i => i.user_id === users[1].id).length;

        // If Joao worked on it significantly more, or it's a known "Piemonte/JL/Proedi" etc.
        if (joaoInts > 0 && (joaoInts >= brunoInts || lead.company_name?.includes('JL') || lead.company_name?.includes('Proedi') || lead.company_name?.includes('Piemonte'))) {
            console.log(`  Reverting lead ${lead.company_name} (João interactions: ${joaoInts}, Bruno: ${brunoInts})`);
            await prisma.leads.update({
                where: { id: lead.id },
                data: {
                    owner_id: users[0].id,
                    owner: users[0].short
                }
            });

            // Also fix the misattributed interactions from today
            await prisma.interactions.updateMany({
                where: {
                    lead_id: lead.id,
                    user_id: users[1].id,
                    content: { contains: 'Hoje', mode: 'insensitive' } // Common in my recovery updates
                },
                data: {
                    user_id: users[0].id
                }
            });

            revertedCount++;
        }
    }
    console.log(`Total leads reverted to João: ${revertedCount}`);

    // 3. One more check: leads with NO owner but João interactions
    console.log('\nChecking for unassigned leads worked by João...');
    const unassignedJoaoWork = await prisma.leads.findMany({
        where: {
            owner_id: null,
            interactions: { some: { user_id: users[0].id } },
            deletedAt: null
        }
    });

    for (const lead of unassignedJoaoWork) {
        console.log(`  Assigning unassigned lead ${lead.company_name} to João due to history.`);
        await prisma.leads.update({
            where: { id: lead.id },
            data: {
                owner_id: users[0].id,
                owner: users[0].short
            }
        });
    }

    await prisma.$disconnect();
    console.log('\n--- OWNERSHIP STABILITY FIX COMPLETED ---');
}

main();
