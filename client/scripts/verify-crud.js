
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando Teste de CRUD Isolado...');

    try {
        // 1. CREATE
        const cnpj = `TEST-${Date.now()}`;
        console.log(`\n1. Tentando CRIAR lead com CNPJ: ${cnpj}`);
        const newLead = await prisma.lead.create({
            data: {
                company_name: "Empresa Teste CRUD",
                cnpj: cnpj,
                status: "NEW",
                owner: "joao"
            }
        });
        console.log('✅ Lead criado com sucesso:', newLead.id);

        // 2. READ
        console.log(`\n2. Buscando lead ${newLead.id}...`);
        const found = await prisma.lead.findUnique({ where: { id: newLead.id } });
        if (!found) throw new Error("Lead criado não foi encontrado!");
        console.log('✅ Lead encontrado.');

        // 3. UPDATE
        console.log(`\n3. Atualizando lead...`);
        const updated = await prisma.lead.update({
            where: { id: newLead.id },
            data: {
                trade_name: "Nome Fantasia Atualizado",
                // Testando envio de nulos que costumam quebrar
                notes: "Nota de teste"
            }
        });
        console.log('✅ Lead atualizado:', updated.trade_name);

        // 4. DELETE
        console.log(`\n4. Deletando lead (Soft Delete)...`);
        const deleted = await prisma.lead.update({
            where: { id: newLead.id },
            data: { deletedAt: new Date() }
        });
        console.log('✅ Lead deletado (soft).');

        // 5. HARD DELETE (Limpeza)
        console.log(`\n5. Limpeza final (Hard Delete)...`);
        await prisma.lead.delete({ where: { id: newLead.id } });
        console.log('✅ Lead removido fisicamente.');

        console.log('\n🎉 TESTE DE CRUD CONCLUÍDO COM SUCESSO! O problema não é o banco.');

    } catch (error) {
        console.error('\n❌ ERRO CRÍTICO NO CRUD:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
