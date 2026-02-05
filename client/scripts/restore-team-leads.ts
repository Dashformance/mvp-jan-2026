import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚑 Iniciando restauração MASSIVA de leads da equipe...');

    const BRUNO_ID = '0184fc53-a696-4ed6-b5e4-2391fd21b902';
    const VITOR_ID = '0eabdccd-e490-4e2c-a862-7f61fa576906';
    const JOAO_ID = '21d216a4-e8c9-464d-b486-0b4db827f5ba';

    const USER_MAP = new Map([
        [BRUNO_ID, 'bruno'],
        [VITOR_ID, 'vitor'],
        [JOAO_ID, 'joao']
    ]);

    // 1. Corrigir discrepância LEGADO (String vs ID)
    console.log('1️⃣ Corrigindo leads com nome legado mas sem ID...');

    const vitorFix = await prisma.leads.updateMany({
        where: { owner: 'vitor', owner_id: null },
        data: { owner_id: VITOR_ID }
    });
    console.log(`✅ Vitor: ${vitorFix.count} leads corrigidos.`);

    const brunoFix = await prisma.leads.updateMany({
        where: { owner: 'bruno', owner_id: null },
        data: { owner_id: BRUNO_ID }
    });
    console.log(`✅ Bruno: ${brunoFix.count} leads corrigidos.`);


    // 2. Restaurar Órfãos baseado em interações
    console.log('\n2️⃣ Restaurando órfãos baseado no histórico de interações...');

    const orphans = await prisma.leads.findMany({
        where: { owner_id: null, owner: null, deletedAt: null }
    });

    console.log(`Encontrados ${orphans.length} leads totalmente sem dono.`);

    let restoredCount = 0;

    for (const lead of orphans) {
        // Pega a última interação feita por um destes usuários
        const lastInteraction = await prisma.interactions.findFirst({
            where: {
                lead_id: lead.id,
                user_id: { in: [BRUNO_ID, VITOR_ID, JOAO_ID] }
            },
            orderBy: { created_at: 'desc' }
        });

        if (lastInteraction && lastInteraction.user_id) {
            const ownerId = lastInteraction.user_id;
            const ownerName = USER_MAP.get(ownerId);

            process.stdout.write(`Restaurando '${lead.company_name}' para ${ownerName}... `);

            await prisma.leads.update({
                where: { id: lead.id },
                data: {
                    owner_id: ownerId,
                    owner: ownerName
                }
            });
            console.log('OK');
            restoredCount++;
        } else {
            console.log(`⚠️ '${lead.company_name}' não tem histórico conclusivo. Verificando criação...`);
        }
    }

    console.log(`\n🎉 Total de órfãos restaurados: ${restoredCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
