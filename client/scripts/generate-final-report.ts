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

    console.log(`Generating HYPER-ACCURATE KANBAN-ALIGNED report.`);

    const getUsers = async () => {
        const dbUsers = await prisma.user.findMany();
        return dbUsers.map(u => ({
            id: u.id,
            name: u.name,
            xp: u.xp,
            level: u.level
        }));
    };

    const getUserPerformance = async (userId: string, start: Date, end: Date) => {
        // --- SNAPSHOT (ESTADO ATUAL NO KANBAN) ---
        const snapshot = await prisma.leads.groupBy({
            by: ['status'],
            where: { owner_id: userId, deletedAt: null },
            _count: { id: true }
        });

        const counts: Record<string, number> = {};
        snapshot.forEach(s => counts[s.status] = s._count.id);

        // --- FLOW (O QUE ACONTECEU NA SEMANA) ---
        const leadsAdded = await prisma.leads.count({
            where: { owner_id: userId, date_added: { gte: start, lte: end }, deletedAt: null }
        });

        const interactions = await prisma.interactions.findMany({
            where: { user_id: userId, date: { gte: start, lte: end } }
        });

        const msgSentFlow = interactions.filter(i => ['WHATSAPP', 'EMAIL', 'MESSAGE'].includes(i.type)).length;

        // Status Changes in the period
        const movedToContacted = interactions.filter(i => i.type === 'STATUS_CHANGE' && i.content.includes('CONTACTED')).length;
        const movedToMeeting = interactions.filter(i => i.type === 'STATUS_CHANGE' && i.content.includes('MEETING')).length;
        const movedToWon = interactions.filter(i => i.type === 'STATUS_CHANGE' && i.content.includes('WON')).length;

        return {
            snapshot: {
                qualificados: counts['NEW'] || 0,
                msgEnviada: counts['ATTEMPTED'] || 0,
                msgRespondida: counts['CONTACTED'] || 0,
                reuniao: counts['MEETING'] || 0,
                fechamento: counts['WON'] || 0,
                inbox: counts['INBOX'] || 0,
                totalAtivos: (counts['NEW'] || 0) + (counts['ATTEMPTED'] || 0) + (counts['CONTACTED'] || 0) + (counts['MEETING'] || 0) + (counts['WON'] || 0)
            },
            flow: {
                leadsAdded,
                msgSent: msgSentFlow,
                newResponses: movedToContacted,
                newMeetings: movedToMeeting,
                newClosings: movedToWon
            }
        };
    };

    const users = await getUsers();
    const reports = [];

    for (const user of users) {
        const perf = await getUserPerformance(user.id, sevenDaysAgo, today);
        const prevPerf = await getUserPerformance(user.id, prevSevenDays, sevenDaysAgo);
        reports.push({ user, perf, prevPerf });
    }

    // --- GLOBAL STATS ---
    const totalLeads = await prisma.leads.count({ where: { deletedAt: null } });
    const activeGlobal = await prisma.leads.count({
        where: { status: { in: ['NEW', 'ATTEMPTED', 'CONTACTED', 'MEETING', 'WON'] }, deletedAt: null }
    });

    // --- MARKDOWN ---
    let md = `# 📈 Relatório de Performance Semanal (V3 - Alinhado ao Kanban)
**Período:** ${sevenDaysAgo.toLocaleDateString('pt-BR')} a ${today.toLocaleDateString('pt-BR')}

## 1. Visão Geral da Plataforma (Totais)
| Métrica | Valor Atual | Descrição |
| :--- | :--- | :--- |
| **Total de Leads na Base** | ${totalLeads} | Todos os leads ativos (incluindo Inbox e não atribuídos). |
| **Leads em Movimentação** | ${activeGlobal} | Leads que já saíram do Inbox. |
| **Novos Leads (Semana)** | ${reports.reduce((acc, r) => acc + r.perf.flow.leadsAdded, 0)} | Leads adicionados e atribuídos esta semana. |

---

## 2. Estatísticas por Colaborador (EP Individual)
*Nota: 'Snapshot' reflete o estado atual que você vê no Kanban. 'Atividade' reflete o que foi feito na semana.*

`;

    for (const r of reports) {
        md += `### 👤 ${r.user.name}
**[SNAPSHOT ATUAL NO KANBAN]**
- **Qualificado (Lead Novo):** ${r.perf.snapshot.qualificados}
- **Mensagem Enviada:** ${r.perf.snapshot.msgEnviada}
- **Mensagem Respondida:** ${r.perf.snapshot.msgRespondida}
- **Reunião:** ${r.perf.snapshot.reuniao}
- **Em Fechamento:** ${r.perf.snapshot.fechamento}
- *Total no Board:* **${r.perf.snapshot.totalAtivos} leads** | *No Inbox:* ${r.perf.snapshot.inbox}

**[ATIVIDADE DA ÚLTIMA SEMANA]**
- **Leads Adicionados:** ${r.perf.flow.leadsAdded} (${getVariation(r.perf.flow.leadsAdded, r.prevPerf.flow.leadsAdded)})
- **Ações Realizadas (Msgs/Calls):** ${r.perf.flow.msgSent}
- **Leads que Responderam:** ${r.perf.flow.newResponses}
- **Novas Reuniões Marcadas:** ${r.perf.flow.newMeetings}
- **Novos Fechamentos:** ${r.perf.flow.newClosings}
\n`;
    }

    md += `
---

## 3. Insights Gerais & Padrões
- **Gargalo no Funil:** ${activeGlobal > 0 ? "Atualmente existem " + reports[0].perf.snapshot.inbox + " leads parados no Inbox de " + reports[0].user.name + ". Recomenda-se triagem imediata." : "Fluxo limpo."}
- **Taxa de Resposta Semanal:** O time conseguiu resposta de **${reports.reduce((acc, r) => acc + r.perf.flow.newResponses, 0)} leads** novos ou antigos nesta semana.

---

## 4. Próxima Semana: Foco e Sugestões 🔥
${reports.map(r => {
        let focus = "";
        if (r.perf.snapshot.msgEnviada > r.perf.snapshot.msgRespondida * 2) focus = "Focar em follow-up dos leads que ainda não responderam.";
        else if (r.perf.snapshot.qualificados > 10) focus = "Limpar o estoque de 'Qualificados' disparando mensagens iniciais.";
        else focus = "Aumentar volume de prospecção para preencher o topo do funil.";

        return `**${r.user.name}**: ${focus}`;
    }).join('\n\n')}

---
### 🤖 Dados Brutos para Avaliação de IA
\`\`\`json
${JSON.stringify({
        timestamp: today.toISOString(),
        global: { totalLeads, activeGlobal },
        individual: reports.map(r => ({
            user: r.user.name,
            snapshot: r.perf.snapshot,
            flow: r.perf.flow
        }))
    }, null, 2)}
\`\`\`
`;

    const reportDir = path.join(__dirname, '../relatorios');
    const fileName = `relatorio-kanban-aligned-${today.toISOString().split('T')[0]}.md`;
    const filePath = path.join(reportDir, fileName);

    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(filePath, md);

    console.log(`Report generated: ${filePath}`);
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
