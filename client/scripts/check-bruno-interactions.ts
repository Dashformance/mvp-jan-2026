
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const brunoEmail = 'bruno@visualizen.com';
    const user = await prisma.user.findUnique({
        where: { email: brunoEmail }
    });

    if (!user) {
        console.log(`User ${brunoEmail} not found.`);
        return;
    }

    const yesterday = new Date('2026-01-26T00:00:00Z');
    const today = new Date('2026-01-27T00:00:00Z');

    console.log(`Checking interactions by Bruno (${user.id}) created yesterday...`);

    const interactions = await prisma.interactions.findMany({
        where: {
            user_id: user.id,
            created_at: {
                gte: yesterday,
                lt: today
            }
        },
        include: {
            leads: {
                select: { company_name: true, owner_id: true }
            }
        }
    });

    console.log(`Total interactions by Bruno yesterday: ${interactions.length}`);

    const interactionTypes: Record<string, number> = {};
    interactions.forEach(i => {
        if (!interactionTypes[i.type]) interactionTypes[i.type] = 0;
        interactionTypes[i.type]++;
    });

    console.log('Interaction types:');
    console.log(JSON.stringify(interactionTypes, null, 2));

    const leadsInteracted = new Set(interactions.map(i => i.lead_id).filter(Boolean));
    console.log(`Total unique leads interacted by Bruno yesterday: ${leadsInteracted.size}`);

    // Check if some of these leads are NOT owned by Bruno
    const leadsNotOwnedByBruno = interactions.filter(i => i.leads && i.leads.owner_id !== user.id);
    console.log(`Interactions on leads NOT owned by Bruno: ${leadsNotOwnedByBruno.length}`);

    if (leadsNotOwnedByBruno.length > 0) {
        console.log('Sample leads not owned by Bruno but interacted with (first 5):');
        leadsNotOwnedByBruno.slice(0, 5).forEach(i => {
            console.log(`- ${i.leads?.company_name} (Lead ID: ${i.lead_id}, Owner ID: ${i.leads?.owner_id})`);
        });
    }

    await prisma.$disconnect();
}

main();
