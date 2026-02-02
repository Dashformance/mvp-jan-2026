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

    console.log(`Generating refined report for period: ${sevenDaysAgo.toISOString()} to ${today.toISOString()}`);

    const getStats = async (start: Date, end: Date, userId?: string) => {
        const baseWhere: any = userId ? { user_id: userId } : {};

        // Leads added (filtered by owner_id if userId provided)
        const leadsAdded = await prisma.leads.count({
            where: {
                date_added: { gte: start, lte: end },
                deletedAt: null,
                ...(userId ? { owner_id: userId } : {})
            },
        });

        // Messages Sent (WHATSAPP, EMAIL, CALL)
        const messagesSent = await prisma.interactions.count({
            where: {
                ...baseWhere,
                type: { in: ['WHATSAPP', 'EMAIL', 'CALL'] },
                date: { gte: start, lte: end },
            },
        });

        // Messages Responded (Proxy: Transitions to CONTACTED)
        const messagesResponded = await prisma.interactions.count({
            where: {
                ...baseWhere,
                type: 'STATUS_CHANGE',
                content: { contains: 'CONTACTED' },
                date: { gte: start, lte: end }
            }
        });

        // Reunião (Interactions of type MEETING or STATUS_CHANGE to MEETING)
        const meetings = await prisma.interactions.count({
            where: {
                ...baseWhere,
                OR: [
                    { type: 'MEETING' },
                    { type: 'STATUS_CHANGE', content: { contains: 'MEETING' } }
                ],
                date: { gte: start, lte: end },
            },
        });

        // Em Fechamento (Status WON is currently mapped to "💰 Fechamento")
        const won = await prisma.interactions.count({
            where: {
                ...baseWhere,
                type: 'STATUS_CHANGE',
                content: { contains: 'WON' },
                date: { gte: start, lte: end }
            }
        });

        return { leadsAdded, messagesSent, messagesResponded, meetings, won };
    };

    const currentStats = await getStats(sevenDaysAgo, today);
    const previousStats = await getStats(prevSevenDays, sevenDaysAgo);

    // Per User Stats
    const users = await prisma.user.findMany();
    const userStats = [];

    for (const user of users) {
        const uStats = await getStats(sevenDaysAgo, today, user.id);
        userStats.push({ name: user.name, ...uStats });
    }

    // Generate Markdown
    let markdown = `# Relatório Semanal de Performance (REVISADO)
**Período:** ${sevenDaysAgo.toLocaleDateString('pt-BR')} a ${today.toLocaleDateString('pt-BR')}

## 1. Estatísticas Totais (EP)
| Métrica | Total Semanal | Variação (vs sem. ant.) | Definição / Proxy |
| :--- | :--- | :--- | :--- |
| **Leads Adicionados** | **${currentStats.leadsAdded}** | ${getVariation(currentStats.leadsAdded, previousStats.leadsAdded)} | Novos leads que entraram no Dashformance. |
| **Mensagens Enviadas** | **${currentStats.messagesSent}** | ${getVariation(currentStats.messagesSent, previousStats.messagesSent)} | WhatsApp, E-mail ou Chamadas registradas. |
| **Mensagens Respondidas** | **${currentStats.messagesResponded}** | ${getVariation(currentStats.messagesResponded, previousStats.messagesResponded)} | Leads que avançaram para "Contato Realizado". |
| **Reunião** | **${currentStats.meetings}** | ${getVariation(currentStats.meetings, previousStats.meetings)} | Reuniões agendadas ou realizadas no período. |
| **Em Fechamento** | **${currentStats.won}** | ${getVariation(currentStats.won, previousStats.won)} | Leads que avançaram para a etapa de "Fechamento". |

## 2. Estatísticas Individuais
Explore a performance de cada colaborador.

`;

    for (const u of userStats) {
        const convRate = u.messagesSent > 0 ? ((u.messagesResponded / u.messagesSent) * 100).toFixed(1) : "0.0";
        markdown += `### ${u.name}
- **📥 Leads Adicionados:** ${u.leadsAdded}
- **📤 Mensagens Enviadas:** ${u.messagesSent}
- **💬 Mensagens Respondidas:** ${u.messagesResponded} (Conversão: ${convRate}%)
- **📅 Reuniões:** ${u.meetings}
- **💰 Em Fechamento:** ${u.won}
\n`;
    }

    markdown += `
## 3. Insights Gerais
- **Eficiência de Prospecção:** Atualmente, a taxa de resposta média é de **${currentStats.messagesSent > 0 ? ((currentStats.messagesResponded / currentStats.messagesSent) * 100).toFixed(1) : 0}%**.
- **Funil de Vendas:** Tivemos um volume de ${currentStats.meetings} reuniões, resultando em ${currentStats.won} avanços para fechamento. 
- **Gargalo:** ${currentStats.leadsAdded > currentStats.messagesSent ? "O volume de novos leads é superior ao número de contatos. Atenção ao tempo de resposta!" : "Volume de contatos está saudável em relação à entrada de leads."}
`;

    markdown += `
## 4. Estatísticas Complementares
- **Total de Leads Ativos (Estoque):** ${await prisma.leads.count({ where: { status: { notIn: ['DISQUALIFIED', 'LOST'] }, deletedAt: null } })}
- **Distribuição de Carga:** ${userStats.map(u => `${u.name}: ${u.leadsAdded}`).join(' | ')} (Leads novos/usuário)
`;

    markdown += `
## 5. Próximas Ações e Feedbacks 🚀
**Objetivo Geral:** Melhorar a conversão de "Mensagens Enviadas" -> "Mensagens Respondidas".

${userStats.map(u => {
        let feedback = "";
        if (u.messagesSent === 0) feedback = "Sem registro de prospecção ativa. Vamos iniciar os contatos com os novos leads!";
        else if (u.messagesResponded / u.messagesSent < 0.2) feedback = "Taxa de resposta abaixo da média. Sugerimos revisar o script de abordagem inicial.";
        else if (u.meetings === 0) feedback = "Bom volume de conversas, mas falta converter em reuniões. Tente ser mais direto no CTA para agendamento.";
        else feedback = "Ótimo ritmo de trabalho! Mantenha o foco em levar os leads de reunião para o fechamento.";

        return `**${u.name}**: ${feedback}`;
    }).join('\n\n')}

---
*Relatório gerado automaticamente pelo assistente Antigravity.*
`;

    // Save File
    const reportDir = path.join(__dirname, '../relatorios');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const fileName = `relatorio-semanal-${today.toISOString().split('T')[0]}.md`;
    const filePath = path.join(reportDir, fileName);

    fs.writeFileSync(filePath, markdown);
    console.log(`Report updated at: ${filePath}`);
}

function getVariation(current: number, previous: number) {
    if (previous === 0) return current > 0 ? "+100% 🚀" : "0%";
    const diff = ((current - previous) / previous) * 100;
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)}%`;
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
