import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Diagnosticando leads do Bruno e Vitor...');

    const BRUNO_ID = '0184fc53-a696-4ed6-b5e4-2391fd21b902';
    const VITOR_ID = '0eabdccd-e490-4e2c-a862-7f61fa576906';

    // 1. Leads com string legado mas sem ID (Ocultos)
    const brunoLegacy = await prisma.leads.count({
        where: { owner: 'bruno', owner_id: null }
    });
    const vitorLegacy = await prisma.leads.count({
        where: { owner: 'vitor', owner_id: null }
    });

    console.log(`\n📋 LEADS LEGADOS (SEM ID) - INVISÍVEIS:`);
    console.log(`- Bruno: ${brunoLegacy}`);
    console.log(`- Vitor: ${vitorLegacy}`);


    // 2. Leads que estão com ID correto (Visíveis)
    const brunoCorrect = await prisma.leads.count({
        where: { owner_id: BRUNO_ID }
    });
    const vitorCorrect = await prisma.leads.count({
        where: { owner_id: VITOR_ID }
    });

    console.log(`\n✅ LEADS CORRETOS (VISÍVEIS):`);
    console.log(`- Bruno: ${brunoCorrect}`);
    console.log(`- Vitor: ${vitorCorrect}`);

    // 3. Leads totalmente órfãos (Sem owner e sem ID)
    const orphans = await prisma.leads.findMany({
        where: { owner: null, owner_id: null, deletedAt: null },
        take: 20
    });
    console.log(`\n⚠️ LEADS ÓRFÃOS (Totalmente sem dono): ${orphans.length} (Exibindo primeiros 20)`);
    if (orphans.length > 0) {
        console.table(orphans.map(l => ({ id: l.id, company: l.company_name, trade: l.trade_name, created: l.date_added })));
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
