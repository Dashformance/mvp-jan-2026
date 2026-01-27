
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ALL LEADS ADDED TODAY ---');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leads = await prisma.leads.findMany({
        where: {
            date_added: { gte: today }
        },
        select: {
            id: true,
            company_name: true,
            owner: true,
            owner_id: true,
            date_added: true,
            source: true
        },
        orderBy: { date_added: 'desc' }
    });

    console.log(`Total leads added today: ${leads.length}`);

    // Group by owner
    const byOwner = new Map<string, number>();
    leads.forEach(l => {
        const key = l.owner_id || l.owner || 'unknown';
        byOwner.set(key, (byOwner.get(key) || 0) + 1);
    });

    console.log('Groups by Owner:');
    for (const [owner, count] of byOwner) {
        console.log(` - ${owner}: ${count}`);
    }

    console.log('\nLast 20 Leads:');
    leads.slice(0, 20).forEach(l => {
        console.log(` - ${l.company_name} | Owner: ${l.owner} | ID: ${l.owner_id} | Source: ${l.source} | Date: ${l.date_added.toISOString()}`);
    });
}

main().finally(() => prisma.$disconnect());
