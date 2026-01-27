
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- DEEP INTERACTION RESTORATION ---');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leads = await prisma.leads.findMany({
        where: {
            updated_at: { gte: today },
            OR: [
                { status: 'CONTACTED' },
                { status: 'MEETING' },
                { status: 'SOLD' },
                { status: 'WON' }
            ]
        },
        include: {
            interactions: {
                where: { date: { gte: today } }
            }
        }
    });

    console.log(`Checking ${leads.length} leads updated today with active statuses.`);

    let fixedCount = 0;

    for (const lead of leads) {
        const hasStatusChange = lead.interactions.some(i => i.type === 'STATUS_CHANGE' || i.type === 'MEETING' || i.type === 'MOVETO');

        if (!hasStatusChange) {
            console.log(`Inferred action for ${lead.company_name}: ${lead.status}`);

            await prisma.interactions.create({
                data: {
                    id: crypto.randomUUID(),
                    lead_id: lead.id,
                    type: lead.status === 'MEETING' ? 'MEETING' : 'STATUS_CHANGE',
                    content: `Inferred: ${lead.status}`,
                    user_id: lead.owner_id || lead.owner || 'system',
                    date: lead.updated_at,
                    updated_at: new Date()
                }
            });
            fixedCount++;
        }
    }

    console.log(`Deep fixed ${fixedCount} interactions.`);
}

main().finally(() => prisma.$disconnect());
