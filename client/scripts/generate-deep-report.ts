import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const prevSevenDays = new Date(sevenDaysAgo);
    prevSevenDays.setDate(sevenDaysAgo.getDate() - 7);
    prevSevenDays.setHours(0, 0, 0, 0);

    console.log(`Generating HYPER-DETAILED report for period: ${sevenDaysAgo.toISOString()} to ${today.toISOString()}`);

    const getFullStats = async (start: Date, end: Date, userId?: string) => {
        const baseWhereInteractions: any = userId ? { user_id: userId } : {};
        const baseWhereLeads: any = { deletedAt: null, ...(userId ? { owner_id: userId } : {}) };

        // --- QUANTITY METRICS ---
        const leadsAdded = await prisma.leads.count({
            where: { ...baseWhereLeads, date_added: { gte: start, lte: end } },
        });

        const interactions = await prisma.interactions.findMany({
            where: { ...baseWhereInteractions, date: { gte: start, lte: end } },
        });

        const msgSent = interactions.filter(i => ['WHATSAPP', 'EMAIL', 'MESSAGE'].includes(i.type)).length;
        const calls = interactions.filter(i => i.type === 'CALL').length;
        const notes = interactions.filter(i => i.type === 'NOTE').length;

        const responded = interactions.filter(i => i.type === 'STATUS_CHANGE' && i.content.includes('CONTACTED')).length;
        const meetings = interactions.filter(i => i.type === 'MEETING' || (i.type === 'STATUS_CHANGE' && i.content.includes('MEETING'))).length;
        const won = interactions.filter(i => i.type === 'STATUS_CHANGE' && i.content.includes('WON')).length;

        // --- REVENUE METRICS ---
        const wonValue = await prisma.leads.aggregate({
            where: { ...baseWhereLeads, status: 'WON', updated_at: { gte: start, lte: end } },
            _sum: { contract_value: true }
        });

        const pipelineValue = await prisma.leads.aggregate({
            where: { ...baseWhereLeads, status: { in: ['NEW', 'ATTEMPTED', 'CONTACTED', 'MEETING', 'WON'] } },
            _sum: { contract_value: true }
        });

        return {
            leadsAdded, msgSent, calls, notes, responded, meetings, won,
            wonRevenue: Number(wonValue._sum.contract_value || 0),
            pipelineRevenue: Number(pipelineValue._sum.contract_value || 0)
        };
    };

    const currentStats = await getFullStats(sevenDaysAgo, today);
    const previousStats = await getFullStats(prevSevenDays, sevenDaysAgo);

    // --- USER DATA ---
    const users = await prisma.user.findMany({ orderBy: { xp: 'desc' } });
    const userReports = [];
    for (const user of users) {
        const stats = await getFullStats(sevenDaysAgo, today, user.id);
        userReports.push({
            ...user,
            stats,
            conversionRate: stats.msgSent > 0 ? (stats.responded / stats.msgSent * 100).toFixed(1) : 0
        });
    }

    // --- SEGMENT ANALYSIS ---
    const segments = await prisma.leads.groupBy({
        by: ['segment_id'],
        where: { deletedAt: null },
        _count: { id: true },
        _sum: { contract_value: true }
    });

    // --- STATUS DISTRIBUTION ---
    const statusDist = await prisma.leads.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { id: true }
    });

    // --- MARKDOWN GENERATION ---
    let md = `# 📊 RELATÓRIO DE PERFORMANCE DEEP-DIVE (AI READY)
**Período de Análise:** ${sevenDaysAgo.toLocaleDateString('pt-BR')} até ${today.toLocaleDateString('pt-BR')}
**Data de Geração:** ${today.toLocaleString('pt-BR')}

---

## 1. MÉTRICAS EXECUTIVAS (KPIs)
| Métrica | Valor Atual | Var. Semanal | Impacto Financeiro (BRL) |
| :--- | :--- | :--- | :--- |
| **Novos Leads (Inbound/Manual)** | ${currentStats.leadsAdded} | ${getVariation(currentStats.leadsAdded, previousStats.leadsAdded)} | -- |
| **Volume de Atividade (Mensagens)** | ${currentStats.msgSent} | ${getVariation(currentStats.msgSent, previousStats.msgSent)} | -- |
| **Sucesso em Abordagem (Respostas)** | ${currentStats.responded} | ${getVariation(currentStats.responded, previousStats.responded)} | -- |
| **Qualificação (Reuniões)** | ${currentStats.meetings} | ${getVariation(currentStats.meetings, previousStats.meetings)} | -- |
| **Conversão Final (Fechamentos)** | ${currentStats.won} | ${getVariation(currentStats.won, previousStats.won)} | R$ ${currentStats.wonRevenue.toLocaleString('pt-BR')} |
| **Pipeline Total Ativo** | ${statusDist.filter(s => ['NEW', 'ATTEMPTED', 'CONTACTED', 'MEETING', 'WON'].includes(s.status)).reduce((acc, s) => acc + s._count.id, 0)} | -- | R$ ${currentStats.pipelineRevenue.toLocaleString('pt-BR')} |

---

## 2. FUNIL DE CONVERSÃO UNITÁRIO (EFICIÊNCIA)
- **Taxa de Resposta (Sent -> Resp):** ${currentStats.msgSent > 0 ? (currentStats.responded / currentStats.msgSent * 100).toFixed(1) : 0}%
- **Taxa de Agendamento (Resp -> Meet):** ${currentStats.responded > 0 ? (currentStats.meetings / currentStats.responded * 100).toFixed(1) : 0}%
- **Taxa de Fechamento (Meet -> Won):** ${currentStats.meetings > 0 ? (currentStats.won / currentStats.meetings * 100).toFixed(1) : 0}%
- **Mensagens p/ fechar 1 venda:** ${currentStats.won > 0 ? (currentStats.msgSent / currentStats.won).toFixed(1) : '∞'}

---

## 3. DESEMPENHO INDIVIDUAL & GAMIFICAÇÃO
| Colaborador | XP Total | Nível | Leads Add | Msgs | Reuniões | Fech. | Conv. % |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${userReports.map(u => `| ${u.name} | ${u.xp} | ${u.level} | ${u.stats.leadsAdded} | ${u.stats.msgSent} | ${u.stats.meetings} | ${u.stats.won} | ${u.conversionRate}% |`).join('\n')}

---

## 4. ANÁLISE DE ESTOQUE E PIPELINE (SNAPSHOT)
| Status do Lead | Quantidade | Percentual |
| :--- | :--- | :--- |
${statusDist.map(s => {
        const total = statusDist.reduce((acc, curr) => acc + curr._count.id, 0);
        return `| ${s.status} | ${s._count.id} | ${(s._count.id / total * 100).toFixed(1)}% |`;
    }).join('\n')}

---

## 5. DISTRIBUIÇÃO POR SEGMENTO (VALOR POTENCIAL)
| ID Segmento | Qtd Leads | Valor Estimado (BRL) |
| :--- | :--- | :--- |
${segments.map(s => `| ${s.segment_id || 'Indefinido'} | ${s._count.id} | R$ ${Number(s._sum.contract_value || 0).toLocaleString('pt-BR')} |`).join('\n')}

---

## 6. INSIGHTS PARA IA (SUMMARY PARA AVALIAÇÃO)
1. **Velocidade de Resposta:** O volume de leads adicionados (${currentStats.leadsAdded}) comparado à taxa de resposta (${(currentStats.responded / (currentStats.leadsAdded || 1) * 100).toFixed(1)}%) indica que a primeira abordagem está com eficiência de conversão para "Contato Realizado" de ${(currentStats.msgSent > 0 ? (currentStats.responded / currentStats.msgSent * 100).toFixed(1) : 0)}%.
2. **Equilíbrio de Carga:** A distribuição de leads entre colaboradores está ${Math.max(...userReports.map(u => u.stats.leadsAdded)) - Math.min(...userReports.map(u => u.stats.leadsAdded)) > 10 ? 'DESEQUILIBRADA' : 'EQUILIBRADA'}.
3. **Monetização:** O pipeline possui R$ ${currentStats.pipelineRevenue.toLocaleString('pt-BR')} em potencial, com uma taxa de conversão de reunião para fechamento de ${currentStats.meetings > 0 ? (currentStats.won / currentStats.meetings * 100).toFixed(1) : 0}% esta semana.

---
## DATA DUMP (JSON FOR MACHINE PARSING)
\`\`\`json
${JSON.stringify({
        period: { start: sevenDaysAgo, end: today },
        global: currentStats,
        users: userReports.map(u => ({ id: u.id, name: u.name, stats: u.stats })),
        pipeline: statusDist,
        segments: segments
    }, null, 2)}
\`\`\`

---
*Gerado por Antigravity v3.0 - Dashformance Ecosystem*
`;

    // Save File
    const reportDir = path.join(__dirname, '../relatorios');
    const fileName = `deep-performance-ai-ready-${today.toISOString().split('T')[0]}.md`;
    const filePath = path.join(reportDir, fileName);

    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(filePath, md);

    console.log(`Deep report saved to: ${filePath}`);
}

function getVariation(current: number, previous: number) {
    if (previous === 0) return current > 0 ? "+100% 🚀" : "0%";
    const diff = ((current - previous) / previous) * 100;
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)}%`;
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
