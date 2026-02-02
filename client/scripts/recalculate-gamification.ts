import { PrismaClient } from '@prisma/client';
import { ACTION_POINTS, LEVEL_CONFIG } from '../lib/gamification/config';
import { calculateLevel } from '../lib/gamification/level';

// Remove AnalyticsService import to avoid alias resolution issues in standalone script
// import { AnalyticsService } from '../lib/services/analytics-service';

function getInteractionXP(int: any): number {
    let xp = 0;
    if (int.type === 'STATUS_CHANGE' || int.type === 'MOVETO') {
        if (int.content.includes('WON') || int.content.includes('SOLD')) xp = ACTION_POINTS.LEAD_CONVERTED;
        else if (int.content.includes('MEETING') || int.content.includes('AGENDADA')) xp = ACTION_POINTS.LEAD_QUALIFIED;
        else if (int.content.includes('CONTACTED')) xp = ACTION_POINTS.LEAD_CONTACTED;
        else xp = 10;
    }
    else if (int.type === 'MEETING' || int.type === 'QUALIFY') xp = ACTION_POINTS.LEAD_QUALIFIED;
    else if (['CALL', 'WHATSAPP', 'EMAIL', 'CONTACT'].includes(int.type)) xp = ACTION_POINTS.LEAD_CONTACTED;
    else if (int.type === 'CREATE') xp = ACTION_POINTS.LEAD_CREATED;
    else if (int.type === 'IMPORT') {
        const count = parseInt(int.content.split(':')[1]) || 1;
        xp = count * ACTION_POINTS.BULK_IMPORT;
    }
    else if (int.type === 'NOTE') xp = 10;
    return xp;
}

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando Recálculo de Gamificação (XP e Nível)...');

    // 1. Mapeamento de Usuários para resolver IDs legados
    const allUsers = await prisma.user.findMany();
    const userMap = new Map<string, string>();

    allUsers.forEach(u => {
        // Mapeia ID real, Nome e Email
        userMap.set(u.id, u.id);
        userMap.set(u.email.toLowerCase(), u.id);
        if (u.name) {
            userMap.set(u.name.toLowerCase(), u.id);
            // Também mapear sem espaços se necessário
            userMap.set(u.name.toLowerCase().replace(/\s+/g, ''), u.id);
        }
        if (u.supabase_uid) {
            userMap.set(u.supabase_uid, u.id);
        }
    });

    console.log(`✅ Usuários carregados: ${allUsers.length}`);

    // 2. Buscar TODAS as interações
    const interactions = await prisma.interactions.findMany({
        orderBy: { date: 'asc' }
    });

    console.log(`✅ Interações encontradas: ${interactions.length}`);

    // 3. Processar interações e somar XP + Contar Totais
    let matchedInts = 0;
    let unmatchedInts = 0;

    // Estrutura para totais
    type UserStats = {
        xp: number;
        leads: number;
        responses: number;
        meetings: number;
        sales: number;
    };

    const userStatsStore = new Map<string, UserStats>();

    // Inicializar
    allUsers.forEach(u => {
        userStatsStore.set(u.id, { xp: 0, leads: 0, responses: 0, meetings: 0, sales: 0 });
    });

    for (const interaction of interactions) {
        if (!interaction.user_id || interaction.user_id === 'system') continue;

        const userId = userMap.get(interaction.user_id.toLowerCase()) ||
            userMap.get(interaction.user_id.toLowerCase().replace(/\s+/g, ''));

        if (!userId) {
            unmatchedInts++;
            continue;
        }

        matchedInts++;
        const stats = userStatsStore.get(userId)!;

        // XP
        const xp = getInteractionXP(interaction);
        stats.xp += xp;

        // Stats Totals
        const type = interaction.type;
        const content = interaction.content || '';

        // Leads (Owned/Added) - Proxy: 'CREATE' or 'IMPORT'
        // Note: Better to count from Leads table for "Owned Leads", but for "Activity" we can count Creates.
        // Let's stick to Activity for now as it's what interactions track. 
        // ACTUALLY: PlayerCard "Leads" usually means "Active Leads" or "Total Leads Owned".
        // Let's refine this: We will query the Leads table separately for "Total Leads" count.
        // Here we count "Actions".

        if (['CALL', 'EMAIL', 'WHATSAPP', 'CONTACT'].includes(type)) {
            stats.responses++;
        }
        else if (type === 'MEETING') {
            stats.meetings++;
        }
        else if (type === 'STATUS_CHANGE' && (content.includes('WON') || content.includes('SOLD'))) {
            stats.sales++;
        }
    }

    // 3.1 Contar Leads Reais (Owner) da tabela Leads
    const leadsCount = await prisma.leads.groupBy({
        by: ['owner_id'],
        where: { deletedAt: null },
        _count: { _all: true }
    });

    leadsCount.forEach(g => {
        if (g.owner_id && userStatsStore.has(g.owner_id)) {
            userStatsStore.get(g.owner_id)!.leads = g._count._all;
        }
    });

    // 3.2 Contar Vendas e Reuniões Históricas da tabela Leads (pra garantir precisão se interações faltarem)
    // Opcional, mas vamos confiar nas interações para FLUXO e leads para ESTADO ATUAL.
    // Mas o card pede "VENDAS" (Total Lifetime). Vamos checar leads com status WON/SOLD.
    const salesCount = await prisma.leads.groupBy({
        by: ['owner_id'],
        where: { deletedAt: null, status: { in: ['WON', 'SOLD'] } },
        _count: { _all: true }
    });

    salesCount.forEach(g => {
        if (g.owner_id && userStatsStore.has(g.owner_id)) {
            // Overwrite sales with "Real Sales" from leads table instead of interactions if desired
            // Often more accurate for "Total Sales Made"
            userStatsStore.get(g.owner_id)!.sales = g._count._all;
        }
    });


    console.log(`📊 Processamento concluído:`);
    console.log(`   - Interações atribuídas: ${matchedInts}`);
    console.log(`   - Interações ignoradas (user não encontrado): ${unmatchedInts}`);

    // 4. Atualizar o Banco de Dados
    console.log('\n📝 Aplicando novos valores ao banco...');

    for (const [userId, stats] of userStatsStore) {
        const user = allUsers.find(u => u.id === userId);
        if (!user) continue;

        const oldXP = user.xp || 0;
        const oldLevel = user.level || 1;
        const newLevel = calculateLevel(stats.xp);

        // Prepare Gamification JSON
        const gamificationData = (user.gamification as any) || {};
        gamificationData.lifetime = {
            leads: stats.leads,
            sales: stats.sales,
            meetings: stats.meetings,
            responses: stats.responses
        };

        console.log(`👤 ${user.name}:`);
        console.log(`   XP: ${oldXP} -> ${stats.xp}`);
        console.log(`   LVL: ${oldLevel} -> ${newLevel}`);
        console.log(`   STATS: Leads=${stats.leads}, Sales=${stats.sales}, Meet=${stats.meetings}, Resp=${stats.responses}`);

        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: stats.xp,
                level: newLevel,
                gamification: gamificationData
            }
        });
    }

    console.log('\n✅ Recálculo finalizado com sucesso!');
}

main()
    .catch(e => {
        console.error('❌ Erro no recálculo:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
