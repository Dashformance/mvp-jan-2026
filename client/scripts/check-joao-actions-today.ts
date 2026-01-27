
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- DEBUG JOAO ACTIONS TODAY ---');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Find User
    const user = await prisma.user.findFirst({
        where: { name: { contains: 'João', mode: 'insensitive' } }
    });

    if (!user) {
        console.log('User Joao not found');
        return;
    }

    console.log(`User ID: ${user.id}, Name: ${user.name}`);

    // 2. Leads added today
    const leadsAdded = await prisma.leads.findMany({
        where: {
            OR: [
                { owner_id: user.id },
                { owner: { equals: user.name, mode: 'insensitive' } }
            ],
            date_added: { gte: today }
        },
        select: { id: true, company_name: true, date_added: true, owner: true, owner_id: true }
    });

    console.log(`Leads added today: ${leadsAdded.length}`);
    leadsAdded.forEach(l => console.log(` - ${l.company_name} (ID: ${l.id}, Owner: ${l.owner}, OwnerID: ${l.owner_id}, Date: ${l.date_added.toISOString()})`));

    // 3. Interactions today
    const interactions = await prisma.interactions.findMany({
        where: {
            OR: [
                { user_id: user.id },
                { user_id: user.name }
            ],
            date: { gte: today }
        }
    });

    console.log(`Interactions today: ${interactions.length}`);
    interactions.forEach(i => console.log(` - ${i.type}: ${i.content} (User: ${i.user_id}, Date: ${i.date.toISOString()})`));

    // 4. Check global leads for Joao to see if they are missing date_added or have different owner
    const totalLeads = await prisma.leads.count({
        where: {
            OR: [
                { owner_id: user.id },
                { owner: { equals: user.name, mode: 'insensitive' } }
            ]
        }
    });
    console.log(`Total Leads in CRM: ${totalLeads}`);

    // 5. Look for recent leads (any owner) to see if Joao's name is in 'owner' but not matched
    const recentLeads = await prisma.leads.findMany({
        orderBy: { date_added: 'desc' },
        take: 10
    });
    console.log('Recent Leads in System:');
    recentLeads.forEach(l => console.log(` - ${l.company_name} | Owner: ${l.owner} | OwnerID: ${l.owner_id} | Date: ${l.date_added.toISOString()}`));
}

main().finally(() => prisma.$disconnect());
