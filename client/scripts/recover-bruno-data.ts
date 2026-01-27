
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const brunoEmail = 'bruno@visualizen.com';
    const user = await prisma.user.findUnique({
        where: { email: brunoEmail }
    });

    if (!user) {
        console.error(`User ${brunoEmail} not found.`);
        return;
    }

    const yesterday = new Date('2026-01-26T00:00:00Z');
    const today = new Date('2026-01-27T12:00:00Z'); // Adjusted to current time window

    console.log(`Starting data recovery for Bruno (${user.id})...`);

    // Find interactions created by Bruno yesterday for leads he doesn't own
    const interactions = await prisma.interactions.findMany({
        where: {
            user_id: user.id,
            created_at: {
                gte: yesterday,
                lt: today
            },
            type: { in: ['CREATE', 'IMPORT', 'STATUS_CHANGE'] }
        },
        include: {
            leads: true
        }
    });

    const leadIdsToFix = new Set<string>();
    interactions.forEach(i => {
        if (i.lead_id && i.leads && i.leads.owner_id !== user.id) {
            leadIdsToFix.add(i.lead_id);
        }
    });

    console.log(`Found ${leadIdsToFix.size} leads to recover.`);

    if (leadIdsToFix.size > 0) {
        const ids = Array.from(leadIdsToFix);
        const updateResult = await prisma.leads.updateMany({
            where: {
                id: { in: ids }
            },
            data: {
                owner_id: user.id,
                owner: 'bruno' // Also update string field for redundancy/legacy
            }
        });

        console.log(`Successfully updated ${updateResult.count} leads.`);

        // Sample of recovered leads
        const recoveredLeads = await prisma.leads.findMany({
            where: { id: { in: ids.slice(0, 5) } },
            select: { company_name: true }
        });
        console.log('Sample recovered leads:');
        recoveredLeads.forEach(l => console.log(`- ${l.company_name}`));
    } else {
        console.log('No leads found to recover.');
    }

    await prisma.$disconnect();
}

main();
