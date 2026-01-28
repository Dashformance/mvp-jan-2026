
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const brunoId = '0184fc53-a696-4ed6-b5e4-2391fd21b902';
    const brunoName = 'bruno';
    const today = new Date('2026-01-27T00:00:00Z');

    console.log('--- RECOVERY START: Bruno\'s Anonymous Work (V2) ---');

    // 1. Find leads with anonymous interactions today OR interactions misattributed due to the owner-fallback bug
    // We'll look for WHATSAPP interactions with user_id: null
    const leadsWithAnonWhatsApp = await prisma.leads.findMany({
        where: {
            interactions: {
                some: {
                    user_id: null,
                    type: 'WHATSAPP',
                    created_at: { gte: today }
                }
            }
        },
        include: {
            interactions: {
                orderBy: { created_at: 'desc' }
            }
        }
    });

    console.log(`Found ${leadsWithAnonWhatsApp.length} leads with anonymous WHATSAPP work today.`);

    let recoveredCount = 0;
    for (const lead of leadsWithAnonWhatsApp) {
        console.log(`RECOVERING: ${lead.company_name} (ID: ${lead.id})`);
        console.log(`  Current Owner: ${lead.owner} (${lead.owner_id})`);

        await prisma.leads.update({
            where: { id: lead.id },
            data: {
                owner_id: brunoId,
                owner: brunoName
            }
        });

        // Update interactions to belong to Bruno
        // Also update any STATUS_CHANGE interactions from today that might have been misattributed to the owner
        await prisma.interactions.updateMany({
            where: {
                lead_id: lead.id,
                created_at: { gte: today },
                OR: [
                    { user_id: null },
                    { type: 'STATUS_CHANGE' } // These were likely misattributed
                ]
            },
            data: {
                user_id: brunoId
            }
        });

        recoveredCount++;
    }

    // 2. Specific case: Any unassigned lead with ANY interaction today is likely Bruno's (since João's usually come assigned)
    const unassignedWithWork = await prisma.leads.findMany({
        where: {
            owner_id: null,
            deletedAt: null,
            interactions: {
                some: { created_at: { gte: today } }
            }
        }
    });

    console.log(`Found ${unassignedWithWork.length} unassigned leads with work today.`);
    for (const lead of unassignedWithWork) {
        if (!leadsWithAnonWhatsApp.some(l => l.id === lead.id)) {
            console.log(`RECOVERING UNASSIGNED: ${lead.company_name} (ID: ${lead.id})`);
            await prisma.leads.update({
                where: { id: lead.id },
                data: { owner_id: brunoId, owner: brunoName }
            });
            await prisma.interactions.updateMany({
                where: {
                    lead_id: lead.id,
                    created_at: { gte: today }
                },
                data: { user_id: brunoId }
            });
            recoveredCount++;
        }
    }

    console.log(`--- RECOVERY FINISHED: ${recoveredCount} leads recovered for Bruno ---`);

    await prisma.$disconnect();
}

main();
