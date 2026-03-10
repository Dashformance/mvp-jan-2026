import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
    console.log('--- STARTING DIAGNOSTIC ---');

    try {
        const results = await prisma.leads.groupBy({
            by: ['owner_id'],
            _count: {
                id: true
            },
            where: {
                deletedAt: null
            }
        });

        console.log('Leads count by owner_id:');
        console.table(results);

        const invisibleLeads = await prisma.leads.count({
            where: {
                owner: { not: null },
                owner_id: null,
                deletedAt: null
            }
        });

        const orphanLeads = await prisma.leads.count({
            where: {
                owner: null,
                owner_id: null,
                deletedAt: null
            }
        });

        console.log(`Leads INVISÍVEIS (has owner string but no owner_id): ${invisibleLeads}`);
        console.log(`Leads ÓRFÃOS (no owner and no owner_id): ${orphanLeads}`);

        if (invisibleLeads === 0 && orphanLeads === 0) {
            console.log('✅ HEALTH CHECK PASSED: Data integrity is solid.');
        } else {
            console.log('⚠️ HEALTH CHECK FAILED: Found leads without owner_id.');
        }

    } catch (error) {
        console.error('Diagnostic failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
