import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Buscando TODOS os leads favoritados no banco...');

    const leads = await prisma.leads.findMany({
        where: {
            is_starred: true
        },
        select: {
            id: true,
            trade_name: true,
            company_name: true,
            owner_id: true,
            owner: true,
            status: true,
            deletedAt: true,
            email: true
        }
    });

    console.log(`Encontrados ${leads.length} leads favoritados.`);

    if (leads.length > 0) {
        console.table(leads);
    } else {
        console.log('Nenhum lead favoritado encontrado em todo o banco.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
