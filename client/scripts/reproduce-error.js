
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reproduceUpdateError() {
    console.log('🚀 Iniciando Script de Reprodução de Erro (Fase 0)');

    // Assunção: O usuário está tentando atualizar um lead existente.
    // Vamos buscar o primeiro lead disponível para teste.
    const lead = await prisma.lead.findFirst({
        where: { deletedAt: null },
        include: { segment: true } // Simula o fetch que o frontend faz
    });

    if (!lead) {
        console.error('❌ Nenhum lead encontrado para teste. Crie um lead primeiro.');
        process.exit(1);
    }

    console.log(`\n📦 Lead selecionado para teste: ${lead.id} (${lead.company_name})`);

    // Simulação do payload "sujo" que o frontend envia atualmente:
    // 1. Inclui o objeto 'segment' inteiro (causa erro de argumento desconhecido)
    // 2. Inclui o campo 'id' (causa erro de campo de identidade)
    const dirtyPayload = {
        ...lead,
        trade_name: lead.trade_name + ' (TEST-PATCH)',
        notes: 'Reproduction test at ' + new Date().toISOString()
    };

    console.log('\n⚠️ Tentando atualizar com payload "sujo" (contendo ID e objeto segment)...');

    try {
        // Nota: Aqui estamos testando diretamente o PRISMA primeiro
        // para provar o que quebra o banco.
        await prisma.lead.update({
            where: { id: lead.id },
            data: dirtyPayload
        });
        console.log('✅ Inesperado: O Prisma aceitou o payload sujo diretamente.');
    } catch (error) {
        console.log('\n❌ ERRO CAPTURADO (Esperado):');
        console.error(error.message || error);
    } finally {
        await prisma.$disconnect();
    }
}

reproduceUpdateError();
