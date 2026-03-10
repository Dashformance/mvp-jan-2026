# Plano de Execução — Higienização Profunda do CRM

**Tarefa:** Refatorar o CRM DASHFORMANCE para eliminar bugs, simplificar UX e garantir integridade de dados
**Complexidade:** Alta
**Total de Sprints:** 6
**Data:** 2026-03-09

---

## Contexto

O CRM DASHFORMANCE (Next.js 16 + Prisma + Supabase + SWR) está com problemas críticos que afastaram os usuários. Os sintomas:

1. **Leads somem** — mismatch entre campo legado `owner` (string) e `owner_id` (UUID), soft deletes silenciosos, filtros que escondem leads
2. **UX complexa** — usuários vindos do Excel não conseguem operar com fluidez
3. **Performance tracking inconsistente** — métricas individuais e de equipe com cálculos divergentes
4. **Mini-bugs acumulados** — console.logs, race conditions, estados inconsistentes
5. **Sem clareza diária/semanal** — falta visão gerencial prática
6. **Sem relatórios exportáveis** — bibliotecas instaladas (papaparse, xlsx) mas sem UI
7. **Kanban bugado** — drag-and-drop com rollback fraco, filtros que resetam paginação

**Usuários:** João e Vitor (sócios). Bruno saiu, mas estrutura deve suportar novos comerciais.
**Interface preferida:** Kanban (drag-and-drop). Tabela é secundária.
**Gamificação:** Simplificar — manter só pontuação básica, remover XP/níveis/tiers/combos.

---

## Arquitetura Atual (Referência Rápida)

```
Tech Stack:
- Next.js 16.1.1 (App Router) + React 19 + TypeScript
- PostgreSQL via Supabase + Prisma 6.19.1 (ORM)
- SWR 2.4.0 (data fetching) + Zustand (state)
- @dnd-kit (drag-and-drop) + Radix UI (components)
- Recharts + ApexCharts (visualização)
- papaparse + xlsx (export — instalados mas sem UI)

Pasta principal: client/
├── app/api/leads/          → CRUD de leads (route.ts, [id]/route.ts, batch/, trashed/, stats/)
├── app/(protected)/        → Páginas autenticadas (kanban, super-dash)
├── app/dashboard/          → Dashboard analytics (page.tsx = 53.5KB!)
├── components/kanban/      → KanbanBoard, KanbanCard, KanbanColumn, FilterBar, hooks/
├── components/table/       → LeadsTable.tsx
├── components/lead/        → LeadSheet.tsx (modal de edição)
├── components/super-dash/  → PlayerCard, TrendChart, DateFilterToggle, etc.
├── lib/services/           → leads-service.ts (693 linhas), analytics-service.ts (786 linhas)
├── lib/gamification/       → config.ts, server.ts
├── context/                → auth-context.tsx
├── prisma/schema.prisma    → Schema do banco
```

**Campos críticos do lead:**
- `owner_id` (UUID) — referência ao User. CAMPO MAIS IMPORTANTE. Nunca pode ser null se lead tem dono.
- `owner` (string) — campo LEGADO ("joão", "vitor", "bruno"). Causa de leads invisíveis.
- `deletedAt` (DateTime?) — soft delete. null = visível, com data = deletado.
- `status` (string) — estágio no funil (NEW, ATTEMPTED, CONTACTED, MEETING, WON, SOLD, LOST, DISQUALIFIED)

**IDs dos usuários no banco:**
- João: `21d216a4-e8c9-464d-b486-0b4db827f5ba`
- Vitor: `0eabdccd-e490-4e2c-a862-7f61fa576906`
- Bruno (inativo): `0184fc53-a696-4ed6-b5e4-2391fd21b902`

---

## Sprints

### Sprint 1 — Integridade de Dados (Fundação)
- **Objetivo:** Garantir que NENHUM lead suma. Zero tolerância.
- **Arquivos:** `client/lib/services/leads-service.ts`, `client/app/api/leads/route.ts`, `client/app/api/leads/[id]/route.ts`, `client/prisma/schema.prisma`
- **Pronto quando:** Zero leads com `owner` preenchido mas `owner_id` null. Proteções ativas em toda operação CRUD.

### Sprint 2 — Estabilização do Kanban
- **Objetivo:** Drag-and-drop confiável, filtros previsíveis, paginação correta.
- **Arquivos:** `client/components/kanban/hooks/use-kanban-state.ts`, `client/components/kanban/hooks/use-kanban-dnd.ts`, `client/components/kanban/KanbanBoard.tsx`, `client/components/kanban/KanbanView.tsx`, `client/components/kanban/FilterBar.tsx`
- **Pronto quando:** Arrastar lead entre colunas funciona 100%. Filtrar não some leads. Paginação correta.
- **Depende de:** Sprint 1

### Sprint 3 — UX "Excel-Like" (Simplicidade)
- **Objetivo:** Interface tão simples quanto uma planilha para operações do dia-a-dia.
- **Arquivos:** `client/components/table/LeadsTable.tsx`, `client/components/lead/LeadSheet.tsx`, `client/components/kanban/KanbanCard.tsx`, `client/components/import/ImportWizard.tsx`
- **Pronto quando:** Operações básicas (ligar, mudar status, editar) em 1-2 cliques.
- **Depende de:** Sprint 2

### Sprint 4 — Performance Tracking Consistente
- **Objetivo:** Métricas individuais e de equipe corretas e confiáveis.
- **Arquivos:** `client/lib/services/analytics-service.ts`, `client/app/api/super-dash/stats/route.ts`, `client/components/super-dash/PlayerCard.tsx`, `client/components/super-dash/DateFilterToggle.tsx`, `client/lib/utils/score-calculator.ts`
- **Pronto quando:** Soma dos individuais = total do time. Métricas consistentes entre SuperDash e Dashboard.
- **Depende de:** Sprint 1 (pode rodar em paralelo com Sprint 3)

### Sprint 5 — Visão Gerencial + Relatórios
- **Objetivo:** Clareza diária/semanal para gestão + exportação de dados.
- **Arquivos:** `client/app/dashboard/page.tsx`, `client/app/(protected)/super-dash/page.tsx`, `client/app/api/leads/stats/`, novo endpoint de export
- **Pronto quando:** Resumo diário/semanal em 1 tela. Export CSV/Excel funcional.
- **Depende de:** Sprint 4

### Sprint 6 — Simplificação da Gamificação + Limpeza + QA
- **Objetivo:** Gamificação simplificada para pontuação básica. Polimento final.
- **Arquivos:** `client/lib/gamification/config.ts`, `client/lib/gamification/server.ts`, `client/lib/utils/score-calculator.ts`, `client/app/api/gamification/action/route.ts`, todos os anteriores
- **Pronto quando:** Gamificação simples. Zero console.logs. Fluxo completo sem erros.
- **Depende de:** Sprints 1-5

---

## Mapa de Dependências

```
Sprint 1 (Dados) ──→ Sprint 2 (Kanban) ──→ Sprint 3 (UX)
                                              ↓
Sprint 4 (Métricas) ──→ Sprint 5 (Relatórios)
                                              ↓
                                        Sprint 6 (QA)
```

---

## Verificação Final (Após Sprint 6)

1. `npx prisma db pull` para verificar schema
2. Query: `SELECT count(*) FROM leads WHERE owner IS NOT NULL AND owner_id IS NULL` → deve retornar 0
3. Testar com ambos usuários logados simultaneamente
4. Verificar que leads não somem ao trocar entre "Meus Leads" e "Todos"
5. Arrastar 10 leads entre colunas do kanban, verificar persistência
6. Exportar CSV, verificar que todos os campos estão corretos
7. Comparar métricas do SuperDash com query SQL direta no banco

---

## Regras para Execução

- **Sempre leia o arquivo antes de editar.** Nunca assuma o conteúdo.
- **Preserve `owner_id` em toda operação.** Este é o campo mais crítico do sistema.
- **Teste cada sprint isoladamente** antes de avançar.
- **Não crie arquivos novos desnecessariamente.** Prefira editar os existentes.
- **O banco é PostgreSQL via Supabase.** Use Prisma para todas as queries.
- **O estado do frontend é SWR + Zustand.** Após mutações, sempre chame `mutateLeads()`.
- **Soft delete = `deletedAt` timestamp.** Nunca use hard delete exceto na lixeira.
- **Após cada sprint**, crie o arquivo `sprint-N.md` nesta pasta com o log do que foi feito.
- **Se o plano mudar**, atualize este PLAN.md e documente o motivo.
