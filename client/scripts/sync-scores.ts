
import { PrismaClient } from '@prisma/client';
import { calculateAdvancedScore } from '../lib/services/lead-sanitizer';

const prisma = new PrismaClient();

async function syncScores() {
    console.log('🔄 Starting Score Sync...');

    const leads = await prisma.lead.findMany({
        where: { deletedAt: null }
    });

    console.log(`Found ${leads.length} leads.`);
    let updated = 0;

    for (const lead of leads) {
        // Prepare data for calculator
        // The calculator expects data.extra_info.qualification
        // And other fields like website_url, render_quality

        // Ensure extra_info is treated as object
        const fullData = {
            ...lead,
            extra_info: lead.extra_info as any || {}
        };

        const newScore = calculateAdvancedScore(fullData);

        if (newScore !== lead.score) {
            console.log(`📝 Updating ${lead.trade_name || lead.company_name}: ${lead.score} -> ${newScore}`);
            await prisma.lead.update({
                where: { id: lead.id },
                data: { score: newScore }
            });
            updated++;
        }
    }

    console.log(`\n✅ Finished! Updated ${updated} leads.`);
}

syncScores()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
