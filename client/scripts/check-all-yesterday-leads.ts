
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const yesterday = new Date('2026-01-26T00:00:00Z');
    const today = new Date('2026-01-27T00:00:00Z');

    console.log(`Checking leads created between ${yesterday.toISOString()} and ${today.toISOString()}`);

    const leads = await prisma.leads.findMany({
        where: {
            date_added: {
                gte: yesterday,
                lt: today
            }
        },
        include: {
            User: {
                select: { email: true, name: true }
            }
        }
    });

    console.log(`Total leads created yesterday: ${leads.length}`);

    const ownerStats: Record<string, number> = {};
    leads.forEach(l => {
        const ownerEmail = l.User?.email || l.owner || 'UNASSIGNED';
        if (!ownerStats[ownerEmail]) ownerStats[ownerEmail] = 0;
        ownerStats[ownerEmail]++;
    });

    console.log('Leads by owner:');
    console.log(JSON.stringify(ownerStats, null, 2));

    const unassignedLeads = leads.filter(l => !l.owner_id && (!l.owner || l.owner === ''));
    console.log(`Unassigned leads: ${unassignedLeads.length}`);
    if (unassignedLeads.length > 0) {
        console.log('Sample unassigned leads (first 5):');
        unassignedLeads.slice(0, 5).forEach(l => {
            console.log(`- ${l.company_name} (Status: ${l.status}, Source: ${l.source})`);
        });
    }

    // Also check for 'bruno' in the 'owner' (string) field
    const brunoStringOwner = await prisma.leads.count({
        where: { owner: { contains: 'bruno', mode: 'insensitive' } }
    });
    console.log(`Leads with string owner 'bruno': ${brunoStringOwner}`);

    await prisma.$disconnect();
}

main();
