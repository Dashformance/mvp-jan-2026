import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { AnalyticsService } from '../lib/services/analytics-service';
import { InsightEngine } from '../lib/services/insight-engine';

const prisma = new PrismaClient();

async function main() {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    console.log(`--- INICIANDO GERAÇÃO DE RELATÓRIO ROBUSTO (ANALYTICS V4) ---`);

    const users = await prisma.user.findMany();
    const globalData = await AnalyticsService.getPerformanceReport(undefined, sevenDaysAgo, today);
    const globalInsights = await InsightEngine.generateInsights();

    // Mapping for readable steps in table
    const steps = Object.values(globalData.mapping).sort((a, b) => a.step - b.step);

    let md = `# 🛡️ Relatório Consolidado de Performance & Observabilidade
**Período:** ${sevenDaysAgo.toLocaleDateString('pt-BR')} a ${today.toLocaleDateString('pt-BR')}
**Status do Sistema:** Operacional | **Score de Saúde:** ${globalInsights.score}/100

---

## 1. VISÃO GERAL (SNAPSHOT DINÂMICO)
*Este painel mapeia o seu Kanban atual para uma estrutura de 'Steps' auditável.*

| Step | Nome da Coluna (Kanban) | Qtd Leads | Valor Estimado |
| :--- | :--- | :--- | :--- |
${steps.map(s => `| **Step ${s.step}** | ${s.label} | ${globalData.snapshot[s.step]?.count || 0} | R$ ${(globalData.snapshot[s.step]?.value || 0).toLocaleString('pt-BR')} |`).join('\n')}

---

## 2. PERFORMANCE POR COLABORADOR (ATIVIDADES & FLOW)
| Colaborador | Atividade Semanal (Auda) | Movimentações Realizadas | Leads Adicionados |
| :--- | :--- | :--- | :--- |
${await Promise.all(users.map(async u => {
        const uData = await AnalyticsService.getPerformanceReport(u.id, sevenDaysAgo, today);
        const leadsAdded = await prisma.leads.count({ where: { owner_id: u.id, date_added: { gte: sevenDaysAgo }, deletedAt: null } });
        return `| ${u.name} | ${uData.activities} interações | ${uData.flow.conversions} moves | ${leadsAdded} novos |`;
    })).then(rows => rows.join('\n'))}

---

## 3. DIAGNÓSTICO E INSIGHTS (CIÊNCIA DE DADOS)
${globalInsights.summary.length > 0 ? globalInsights.summary.map(s => `- ${s}`).join('\n') : "- Não foram detectadas anomalias críticas no fluxo esta semana. O pipeline segue o ritmo padrão."}

### Recomendações Estratégicas:
- **Observabilidade**: O colaborador com maior volume de leads no Step 0/1 deve receber suporte para triagem.
- **Performance**: Focar na conversão de Step 3 -> Step 4 (Reunião) para garantir previsibilidade de receita.

---

## 4. DETALHAMENTO TÉCNICO PARA IA
\`\`\`json
${JSON.stringify({
        architecture: "Step-Based Dynamic Mapping",
        mapping: globalData.mapping,
        global_kpis: {
            total_activities: globalData.activities,
            total_moves: globalData.flow.conversions,
            health_score: globalInsights.score
        },
        collaborator_deep_dive: await Promise.all(users.map(async u => ({
            user: u.name,
            data: await AnalyticsService.getPerformanceReport(u.id, sevenDaysAgo, today)
        })))
    }, null, 2)}
\`\`\`

---
*Relatório de Missão Crítica - Gerado por Antigravity*
`;

    const reportDir = path.join(__dirname, '../relatorios');
    const fileName = `relatorio-observabilidade-v4-${today.toISOString().split('T')[0]}.md`;
    const filePath = path.join(reportDir, fileName);

    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(filePath, md);

    console.log(`\n✅ RELATÓRIO GERADO COM SUCESSO!`);
    console.log(`Caminho: ${filePath}`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
