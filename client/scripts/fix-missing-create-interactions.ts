
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { GamificationService } from '../lib/gamification/server';

const prisma = new PrismaClient();

async function main() {
    console.log('--- FIX MISSING CREATE INTERACTIONS ---');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Find all leads added today
    const leads = await prisma.leads.findMany({
        where: {
            date_added: { gte: today }
        },
        include: {
            interactions: {
                where: { type: 'CREATE' }
            }
        }
    });

    console.log(`Found ${leads.length} leads added today.`);

    let fixedCount = 0;

    for (const lead of leads) {
        if (lead.interactions.length === 0) {
            console.log(`Fixing lead: ${lead.company_name} (Owner: ${lead.owner_id || lead.owner})`);

            // Log interaction
            await prisma.interactions.create({
                data: {
                    id: randomUUID(),
                    lead_id: lead.id,
                    type: 'CREATE',
                    content: 'Recalculated: Lead criado (Import ou Manual)',
                    user_id: lead.owner_id || lead.owner || 'system',
                    date: lead.date_added, // Use original date
                    updated_at: new Date()
                }
            });

            // Reward XP if owner is known and is UUID
            if (lead.owner_id && lead.owner_id.length > 20) {
                await GamificationService.addXP(lead.owner_id, 'LEAD_CREATED');
            }

            fixedCount++;
        }
    }

    console.log(`Fixed ${fixedCount} leads.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
