import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Buscando leads favoritados que foram removidos...');

    const deletedStarredLeads = await prisma.leads.findMany({
        where: {
            deletedAt: { not: null },
            is_starred: true
        }
    });

    console.log(`Encontrados ${deletedStarredLeads.length} leads favoritados na lixeira.`);

    if (deletedStarredLeads.length === 0) {
        console.log('Nenhum lead para restaurar.');
        return;
    }

    const restoreOps = deletedStarredLeads.map(lead => {
        return prisma.leads.update({
            where: { id: lead.id },
            data: { deletedAt: null }
        });
    });

    await prisma.$transaction(restoreOps);

    console.log(`✅ Sucesso! ${deletedStarredLeads.length} leads foram restaurados ao Kanban.`);
}

main()
    .catch((e) => {
        console.error('Erro ao restaurar leads:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
