
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backdateLeads() {
    console.log('⏳ Starting Backdate Operation...');

    // Target Date: Last Thursday (Jan 8, 2026)
    // Current Sim Time: Jan 12, 2026 (Monday)
    const targetDate = new Date('2026-01-08T14:00:00.000Z'); // Thursday afternoon

    // Today's start to filter out new leads
    const today = new Date('2026-01-12T00:00:00.000Z');

    const leads = await prisma.lead.findMany({
        where: {
            date_added: {
                lt: today // "Tirando os que foram adicionados hoje"
            },
            // Optional: Only update leads that don't have a recent contact date?
            // User said: "you can't add a movement date to them, right?" implying they are empty or old.
            // I'll update all of them as requested.
        }
    });

    console.log(`Found ${leads.length} leads to backdate.`);
    let updated = 0;

    for (const lead of leads) {
        // Update lead
        await prisma.lead.update({
            where: { id: lead.id },
            data: {
                last_contact_date: targetDate
            }
        });
        updated++;
    }

    console.log(`\n✅ Finished! Backdated ${updated} leads to ${targetDate.toLocaleDateString()}.`);
}

backdateLeads()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
