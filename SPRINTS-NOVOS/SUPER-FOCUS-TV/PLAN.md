# Plano de Execução — SuperDash TV + Modo Foco + WPP + Multi-Colaborador

**Tarefa:** Redesign do SuperDash para TV, motor de cadência diária, integração WhatsApp e suporte a múltiplos colaboradores por lead
**Complexidade:** Alta
**Total de Sprints:** 6
**Data:** 2026-03-10
**Referência técnica:** [BLUEPRINT.md](BLUEPRINT.md)

---

## Contexto

Três entregas independentes, uma fundação compartilhada:

1. **SuperDash TV** — layout 3 colunas (leaderboard | métricas + feed | agenda + pendências), auto-refresh 30s, sem charts/gauges, modo dark puro
2. **Modo Foco** (`/focus`) — fila diária de follow-ups com cadência automática, botões de ação rápida (WhatsApp, Done, Snooze, Skip) + Task Horizon semanal
3. **WPP Integrado** — mensagem pré-preenchida no KanbanCard/LeadSheet + página `/prospecting` standalone
4. **Multi-Colaborador** — lead pode ter múltiplos responsáveis (owner_id = dono principal, LeadCollaborator = co-responsáveis)

### Cadência funciona assim:
| Status do Lead | Condição | Delay | Max |
|----------------|----------|-------|-----|
| ATTEMPTED | Sem resposta | 1 dia | 3x |
| CONTACTED | Respondeu mas silenciou | 1 dia | 5x |
| CONTACTED | Interesse em reunião | 1 dia | 7x |
| MEETING | Reunião confirmada | 1 dia | 10x |

### Multi-Colaborador — regras de negócio:
- `owner_id` = dono principal (responsável primário, campo atual — nunca alterar)
- `LeadCollaborator` = tabela de co-responsáveis (many-to-many)
- Um colaborador vê o lead na sua fila de foco mas não altera o dono
- Filtro Kanban: "Meus Leads" (owner) | "Colaborações" (collaborator) | "Tudo"
- KanbanCard exibe avatares dos colaboradores se houver

---

### Sprint 1 — Schema & Multi-Colaborador
- **Objetivo:** Preparar banco para cadências e múltiplos donos. Zero breaking changes.
- **Arquivos:**
  - `client/prisma/schema.prisma` — adicionar `cadence_rules`, campos `cadence_step`/`cadence_paused` em `leads`, tabela `LeadCollaborator`
  - `client/lib/services/leads-service.ts` — atualizar `findAll()` para incluir leads de colaboração
- **Pronto quando:** `npx prisma migrate dev` sem erro. Query de leads retorna para owner E colaboradores.

### Sprint 2 — Motor de Cadência (CadenceService + APIs)
- **Objetivo:** Lógica que define as tarefas do dia por usuário.
- **Arquivos:**
  - `client/lib/services/cadence-service.ts` [NOVO]
  - `client/app/api/focus/tasks/route.ts` [NOVO]
  - `client/app/api/focus/actions/route.ts` [NOVO]
  - `client/app/api/whatsapp/generate/route.ts` [NOVO]
- **Pronto quando:** `GET /api/focus/tasks` retorna lista ordenada por prioridade. `POST /api/focus/actions` executa done/snooze/skip. WPP gera URL com mensagem pré-preenchida.
- **Depende de:** Sprint 1

### Sprint 3 — SuperDash TV (Rewrite Visual)
- **Objetivo:** Redesign total da dashboard para exibição em TV.
- **Arquivos:**
  - `client/app/(protected)/super-dash/page.tsx` [REWRITE]
  - `client/app/api/super-dash/tv/route.ts` [NOVO]
  - `client/components/super-dash/BigMetric.tsx` [NOVO]
  - `client/components/super-dash/ActivityFeed.tsx` [NOVO]
  - `client/components/super-dash/TodayAgenda.tsx` [NOVO]
  - `client/components/super-dash/OverdueList.tsx` [NOVO]
- **Pronto quando:** Layout 3 colunas sem scroll, auto-refresh 30s, leaderboard mostra colaboradores.
- **Depende de:** Sprint 2

### Sprint 4 — Modo Foco (Página + Task Horizon)
- **Objetivo:** Interface de execução de tarefas com visão semanal de carga.
- **Arquivos:**
  - `client/app/(protected)/focus/page.tsx` [NOVO]
  - `client/components/focus/TaskCard.tsx` [NOVO]
  - `client/components/focus/TaskHorizon.tsx` [NOVO]
  - `client/components/focus/ProgressRing.tsx` [NOVO]
- **Pronto quando:** `/focus` lista tarefas do usuário logado (owner + colaborações). TaskHorizon mostra ontem/hoje/próximos 3 dias. Done/Snooze/Skip funcionam.
- **Depende de:** Sprint 2

### Sprint 5 — WPP Integrado + Página Prospecting
- **Objetivo:** Mensagem pré-preenchida em todos os pontos de contato + prospecção standalone.
- **Arquivos:**
  - `client/components/kanban/KanbanCard.tsx` — modificar handleWhatsApp + avatares de colaboradores
  - `client/components/lead/LeadSheet.tsx` — botão WhatsApp + botão "Convidar Colaborador"
  - `client/app/(protected)/prospecting/page.tsx` [NOVO]
- **Pronto quando:** WPP abre com mensagem em KanbanCard e LeadSheet. Prospecting standalone funciona. LeadSheet permite convidar colaborador.
- **Depende de:** Sprint 2

### Sprint 6 — Navegação + QA End-to-End
- **Objetivo:** Amarrar o sistema e validar todos os fluxos.
- **Arquivos:**
  - `client/app/(protected)/layout.tsx` — adicionar links Foco e Prospectar
- **Pronto quando:** Todos os 15 itens do checklist de verificação marcados.
- **Depende de:** Sprints 1-5

---

## Mapa de Dependências

```
Sprint 1 (Schema)
    ↓
Sprint 2 (CadenceService + APIs)
    ↓              ↓              ↓
Sprint 3 (TV)  Sprint 4 (Foco)  Sprint 5 (WPP)
                    ↓
              Sprint 6 (QA)
```

---

## Arquivos — Mapa Completo

| Arquivo | Ação |
|---------|------|
| `client/prisma/schema.prisma` | MODIFICAR |
| `client/lib/services/leads-service.ts` | MODIFICAR |
| `client/lib/services/cadence-service.ts` | CRIAR |
| `client/app/api/focus/tasks/route.ts` | CRIAR |
| `client/app/api/focus/actions/route.ts` | CRIAR |
| `client/app/api/whatsapp/generate/route.ts` | CRIAR |
| `client/app/api/super-dash/tv/route.ts` | CRIAR |
| `client/app/(protected)/super-dash/page.tsx` | REWRITE |
| `client/components/super-dash/BigMetric.tsx` | CRIAR |
| `client/components/super-dash/ActivityFeed.tsx` | CRIAR |
| `client/components/super-dash/TodayAgenda.tsx` | CRIAR |
| `client/components/super-dash/OverdueList.tsx` | CRIAR |
| `client/app/(protected)/focus/page.tsx` | CRIAR |
| `client/components/focus/TaskCard.tsx` | CRIAR |
| `client/components/focus/TaskHorizon.tsx` | CRIAR |
| `client/components/focus/ProgressRing.tsx` | CRIAR |
| `client/components/kanban/KanbanCard.tsx` | MODIFICAR |
| `client/components/lead/LeadSheet.tsx` | MODIFICAR |
| `client/app/(protected)/prospecting/page.tsx` | CRIAR |
| `client/app/(protected)/layout.tsx` | MODIFICAR |
| `WPP DIRECIONADOR/app.js` | REFERÊNCIA (não modificar) |

---

## Checklist de Verificação Final (Sprint 6)

- [ ] `npx prisma migrate dev` — schema sem erros
- [ ] SuperDash abre em 3 colunas sem scroll horizontal ou vertical
- [ ] Auto-refresh: dados atualizam a cada 30s sem recarregar a página
- [ ] Leaderboard exibe dono + colaboradores de cada lead
- [ ] `/focus` lista leads pendentes (owner + colaborações do usuário logado)
- [ ] TaskHorizon mostra ontem / hoje / próximos 3 dias
- [ ] Done: remove da lista, incrementa ProgressRing
- [ ] Snooze: lead some e volta amanhã
- [ ] Skip: lead some e cadência é pausada (`cadence_paused = true`)
- [ ] WhatsApp (TaskCard): abre `api.whatsapp.com/send` com mensagem pré-preenchida
- [ ] WhatsApp (KanbanCard): abre com mensagem. Avatares de colaboradores visíveis no card.
- [ ] LeadSheet: botão WhatsApp + botão "Convidar Colaborador" funcionam
- [ ] `/prospecting`: colar texto → preview → enviar. Opção de salvar como lead (status ATTEMPTED).
- [ ] Filtro Kanban: "Meus Leads" | "Colaborações" | "Tudo" — cada um retorna dados corretos
- [ ] Zero `console.log` novo introduzido

---

## Regras de Execução

- **Leia o arquivo antes de editar.** Nunca assuma o conteúdo.
- **Zero dependências npm novas.** Usar apenas o que já está instalado.
- **`owner_id` é sagrado.** Multi-colaborador não altera o owner principal.
- **Prisma para banco.** Nenhuma query SQL raw sem justificativa.
- **`mutateLeads()` após toda mutação** de estado de lead.
- **Soft delete = `deletedAt` timestamp.** Nunca hard delete no fluxo normal.
- **A cada sprint concluído:** atualizar o sprint-N.md com log real (status, arquivos tocados, decisões, erros).
- **Se o plano mudar:** atualizar este PLAN.md e avisar.
