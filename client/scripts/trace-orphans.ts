import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Rastreando "pais" dos leads órfãos...');

    // Busca leads sem dono
    const orphans = await prisma.leads.findMany({
        where: { owner: null, owner_id: null, deletedAt: null },
        take: 100 // Aumentando o escopo
    });

    console.log(`Encontrados ${orphans.length} leads órfãos. Buscando histórico...`);

    const users = await prisma.user.findMany();
    const userMap = new Map(users.map(u => [u.id, u.name]));

    const updates = [];

    for (const lead of orphans) {
        // Busca última interação que não seja de sistema para tentar achar o dono
        const lastInteraction = await prisma.interactions.findFirst({
            where: {
                lead_id: lead.id,
                user_id: { notIn: ['system', 'import-service'] }
            },
            orderBy: { created_at: 'desc' }
        });

        if (lastInteraction && lastInteraction.user_id) {
            updates.push({
                leadId: lead.id,
                company: lead.company_name,
                suggestedOwnerId: lastInteraction.user_id,
                suggestedOwnerName: userMap.get(lastInteraction.user_id) || 'Unknown',
                reason: `Última interação por ${lastInteraction.user_id} (${lastInteraction.type})`
            });
        } else {
            // Se não tiver interação, verifique se foi criado hoje (pode ser importação do Bruno?)
            updates.push({
                leadId: lead.id,
                company: lead.company_name,
                suggestedOwnerId: null,
                reason: 'Sem interações humanas'
            });
        }
    }

    console.table(updates);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
