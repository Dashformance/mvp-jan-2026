
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reproduceUpdateError() {
    console.log('🚀 Iniciando Script de Reprodução de Erro (Fase 0 - Offline Mode)');

    // 1. Simular um lead existente (Bypass DB connection for reproduction)
    const lead = {
        id: 'repro-id-123',
        company_name: 'Repro Company',
        trade_name: 'Repro Trade',
        cnpj: '00000000000000',
        segment: { id: 'seg-1', name: 'Test Segment' }, // Simulating the included relation
        // ... other fields irrelevant for the error trigger
    };

    console.log(`\n📦 Lead Mockado: ${lead.id}`);

    // 2. Payload sujo (exatamente o que o frontend manda e o Next.js repassa)
    const dirtyPayload = {
        ...lead, // Espalha TUDO (incluindo id, segment object, etc)
        trade_name: lead.trade_name + ' (REPRO)',
    };

    try {
        console.log('\n🔄 Tentando update direto no Prisma...');
        // A validação de argumentos do Prisma roda ANTES do banco.
        await prisma.leads.update({
            where: { id: lead.id },
            data: dirtyPayload
        });
        console.log('✅ SUCESSO INESPERADO: O Prisma aceitou o payload sujo?');
    } catch (error) {
        if (error.message.includes('Unknown argument')) {
            console.log('\n🎯 SUCESSO: Bug reproduzido! O Prisma rejeitou o payload sujo.');
            console.log('---------------------------------------------------');
            console.log(error.message.split('\n').slice(0, 3).join('\n')); // Logar apenas o inicio
            console.log('---------------------------------------------------');
        } else if (error.message.includes('Can\'t reach database server')) {
            console.log('\n❌ FALHA: Prisma tentou conectar ao banco.');
            console.log('Isso significa que o payload PASSOU pela validação inicial?');
            console.log('Ou o Prisma conecta antes de validar?');
        } else {
            console.log('\n❌ ERRO DIFERENTE:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

reproduceUpdateError();
