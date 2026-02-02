
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Updating Win Stage configuration...');

    // Unmark all as win stages first
    await prisma.stages.updateMany({
        data: { is_win_stage: false }
    });

    // The user said "Fechamento" (WON) currently ISNT a sale. 
    // If they have another stage for sales, they can mark it.
    // For now, let's keep all unmarked so João's score drops to reflect "No sales".

    console.log('✅ All stages unmarked as "Win". Score should now reflect only leads and meetings.');
}

main().finally(() => prisma.$disconnect());
