
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leads = await prisma.leads.findMany({
        where: { owner_id: '0184fc53-a696-4ed6-b5e4-2391fd21b902' },
        select: { company_name: true, date_added: true }
    });

    console.log(`Bruno leads count: ${leads.length}`);
    leads.forEach(l => {
        console.log(`- ${l.company_name} | ${l.date_added.toISOString()} | >= Today: ${l.date_added >= today}`);
    });
}

main().finally(() => prisma.$disconnect());
