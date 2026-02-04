import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const leadId = 'c8dc6c52-b473-43e6-8bf6-ab65cddd99eb';
    console.log(`🔍 Buscando histórico para o lead ${leadId}...`);

    const interactions = await prisma.interactions.findMany({
        where: { lead_id: leadId },
        orderBy: { updated_at: 'desc' }
    });

    console.table(interactions);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
