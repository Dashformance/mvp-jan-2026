
import { PrismaClient } from '@prisma/client';
import { AnalyticsService } from '../lib/services/analytics-service';

const prisma = new PrismaClient();

async function debugScores() {
    console.log('🔍 Debugging PlayerCard Scores...');

    // Using the same logic as AnalyticsService.getPerformanceByOwner
    const stats = await AnalyticsService.getPerformanceByOwner();

    console.log('\n--- DETALHAMENTO DE SCORES ---');

    for (const [key, data] of Object.entries(stats)) {
        const d = data as any;
        console.log(`\n👤 JOGADOR: ${d.meta.name.toUpperCase()} (${key})`);

        // Quality Score: (totalSold * 150) + (totalMeet * 30) + (totalResp * 10) + (totalActive * 1)
        const qualityScore = (d.won * 150) + (d.meeting * 30) + (d.contacted * 10) + (d.total * 1);

        // Velocity Score: (velocityInts * 3) + (velocityAdded * 10)
        // We'll approximate this from the returned data
        console.log(`   - Leads Totais: ${d.total}`);
        console.log(`   - Leads Contatados: ${d.contacted}`);
        console.log(`   - Reuniões: ${d.meeting}`);
        console.log(`   - Vendas: ${d.won}`);
        console.log(`   - Receita: R$ ${d.revenue}`);

        console.log(`   \n   Calculando Componentes:`);
        console.log(`   - Componente Qualidade: ${qualityScore}`);

        // Revenue Score: (totalRevenue / 500) + (totalSold * 100)
        const revenueScore = (d.revenue / 500) + (d.won * 100);
        console.log(`   - Componente Receita: ${revenueScore.toFixed(2)}`);

        // O score final é a soma aproximada / 1000 * 100
        console.log(`   - Score Final (Bruto): ${d.score}`);
    }
}

debugScores()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
