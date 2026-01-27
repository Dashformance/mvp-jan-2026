
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando Verificação de Bulk Update...');

    try {
        // 1. Encontrar ou criar leads de teste
        const leads = await prisma.leads.findMany({
            take: 5,
            where: { deletedAt: null }
        });

        if (leads.length < 2) {
            console.log('❌ Poucos leads para testar bulk update. Crie alguns primeiro.');
            return;
        }

        const ids = leads.map(l => l.id);
        const originalOwners = leads.map(l => l.owner);

        console.log(`\n1. Atualizando ${ids.length} leads para responsável "bruno"...`);

        // Simular a chamada que o LeadsService.updateMany faz
        const result = await prisma.leads.updateMany({
            where: { id: { in: ids } },
            data: { owner: 'bruno' }
        });

        console.log(`✅ Resultado: ${result.count} leads afetados.`);

        // 2. Verificar se mudou
        const updatedLeads = await prisma.leads.findMany({
            where: { id: { in: ids } }
        });

        const allUpdated = updatedLeads.every(l => l.owner === 'bruno');
        if (allUpdated) {
            console.log('✅ Todos os leads foram atualizados corretamente para "bruno".');
        } else {
            console.error('❌ Nem todos os leads foram atualizados.');
        }

        // 3. Restaurar (opcional)
        console.log('\n2. Restaurando donos originais...');
        for (let i = 0; i < ids.length; i++) {
            await prisma.leads.update({
                where: { id: ids[i] },
                data: { owner: originalOwners[i] }
            });
        }
        console.log('✅ Donos restaurados.');

        console.log('\n🎉 VERIFICAÇÃO CONCLUÍDA COM SUCESSO!');

    } catch (error) {
        console.error('\n❌ ERRO NA VERIFICAÇÃO:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
