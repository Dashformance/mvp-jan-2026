import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const JOAO_UUID = '21d216a4-e8c9-464d-b486-0b4db827f5ba';

    console.log('🚀 Iniciando recuperação de leads do João...');

    // 1. Corrigir leads que estão favoritados mas sem dono
    const starredWithoutOwner = await prisma.leads.updateMany({
        where: {
            is_starred: true,
            owner_id: null
        },
        data: {
            owner_id: JOAO_UUID,
            owner: 'joao' // Sincroniza o label legado também
        }
    });
    console.log(`✅ Restaurados ${starredWithoutOwner.count} leads favoritados para o João.`);

    // 2. Corrigir leads legados do 'joao' que não têm owner_id (para evitar que sumam no futuro)
    const legacyJoaoLeads = await prisma.leads.updateMany({
        where: {
            owner: 'joao',
            owner_id: null
        },
        data: {
            owner_id: JOAO_UUID
        }
    });
    console.log(`✅ Migrados ${legacyJoaoLeads.count} leads legados ('joao') para o novo formato de ID.`);

    // 3. Opcional: Verificar se há outros usuários com o mesmo problema
    // (Podemos fazer isso de forma genérica se necessário)
}

main()
    .catch((e) => {
        console.error('Erro na migração:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
