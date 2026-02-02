
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Altering table stages to add dynamic flags...');
    try {
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "stages" 
            ADD COLUMN IF NOT EXISTS "is_win_stage" BOOLEAN DEFAULT false;
        `);
        console.log('✅ Added is_win_stage');

        await prisma.$executeRawUnsafe(`
            ALTER TABLE "stages" 
            ADD COLUMN IF NOT EXISTS "is_lost_stage" BOOLEAN DEFAULT false;
        `);
        console.log('✅ Added is_lost_stage');

        // Mark the closing stage as a win stage
        // Based on previous list-stages: "ca545088-d455-4cce-baa5-3f4a6a5dbb3c" is "WON" (💰 Fechamento)
        await prisma.$executeRawUnsafe(`
            UPDATE "stages" SET "is_win_stage" = true 
            WHERE "name" = 'WON' OR "phase" LIKE '%Fechamento%';
        `);
        console.log('✅ Marked "Fechamento" as a win stage');

    } catch (e) {
        console.error('❌ Error altering table:', e);
    }
}

main().finally(() => prisma.$disconnect());
