
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const today = new Date('2026-01-27T00:00:00Z');
    console.log('Searching for leads with anonymous interactions today...');

    const leads = await prisma.leads.findMany({
        where: {
            interactions: {
                some: {
                    user_id: null,
                    created_at: { gte: today }
                }
            }
        },
        include: {
            interactions: {
                orderBy: { created_at: 'desc' }
            }
        }
    });

    console.log(`Found ${leads.length} leads with anonymous work today.`);

    leads.forEach(lead => {
        const anonToday = lead.interactions.filter(i => i.user_id === null && i.created_at >= today);
        if (anonToday.length > 0) {
            console.log(`\nLead: ${lead.company_name} (ID: ${lead.id})`);
            console.log(`Current Owner: ${lead.owner} (${lead.owner_id})`);
            console.log(`Status: ${lead.status}`);
            console.log(`Anonymous interactions today: ${anonToday.length}`);
            anonToday.forEach(i => {
                console.log(`- [${i.created_at.toISOString()}] ${i.type}: ${i.content}`);
            });
        }
    });

    await prisma.$disconnect();
}

main();
