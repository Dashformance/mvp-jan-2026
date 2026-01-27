
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

    console.log(`Found user: ${user.name} (${user.id})`);

    const leadCount = await prisma.leads.count({
        where: { owner_id: user.id, deletedAt: null }
    });

    console.log(`Total active leads for Bruno: ${leadCount}`);

    const leadsByStatus = await prisma.leads.groupBy({
        by: ['status'],
        where: { owner_id: user.id, deletedAt: null },
        _count: { _all: true }
    });

    console.log('Leads by status:');
    console.log(JSON.stringify(leadsByStatus, null, 2));

    const meetingLeads = await prisma.leads.findMany({
        where: { owner_id: user.id, status: 'MEETING', deletedAt: null },
        select: { id: true, company_name: true, date_added: true }
    });

    console.log(`Meetings found: ${meetingLeads.length}`);
    meetingLeads.forEach(m => {
        console.log(`- ${m.company_name} (Added: ${m.date_added})`);
    });

    await prisma.$disconnect();
}

main();
