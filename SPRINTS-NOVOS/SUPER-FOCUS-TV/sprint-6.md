# Sprint 6 — Navegação + QA End-to-End

**Status:** ⏳ Pendente
**Objetivo:** Amarrar o sistema com navegação e validar todos os fluxos ponta-a-ponta.
**Depende de:** Sprints 1-5

---

## Arquivos

| Arquivo | Ação |
|---------|------|
| `client/app/(protected)/layout.tsx` | MODIFICAR — adicionar links |

---

## Ações Detalhadas

### 1. Adicionar links de navegação

**OBRIGATÓRIO:** Ler `client/app/(protected)/layout.tsx` antes de editar.

**Identificar:** Onde ficam os links do sidebar/navbar existentes.

**Adicionar dois links:**
```tsx
// Link 1: Foco
{ href: '/focus', label: 'Foco', icon: Target }

// Link 2: Prospectar
{ href: '/prospecting', label: 'Prospectar', icon: Zap }
```

**Posicionamento:** Foco logo após o Dashboard/Kanban. Prospectar antes ou após o SuperDash.

### 2. Checklist de QA — executar manualmente

Testar cada item abaixo. Se falhar, abrir issue no sprint correspondente.

#### Sprint 1 — Schema
- [ ] `SELECT count(*) FROM cadence_rules` retorna 4
- [ ] `SELECT cadence_step, cadence_paused FROM leads LIMIT 1` — colunas existem
- [ ] `SELECT * FROM "LeadCollaborator" LIMIT 1` — tabela existe

#### Sprint 2 — CadenceService
- [ ] `GET /api/focus/tasks` retorna 200 (mesmo que lista vazia)
- [ ] `POST /api/focus/actions` com `{ leadId: X, action: 'done' }` retorna `{ success: true }`
- [ ] `POST /api/whatsapp/generate` com rawText retorna phone + message + url

#### Sprint 3 — SuperDash TV
- [ ] `/super-dash` abre sem erro de JavaScript
- [ ] Layout ocupa 100% da tela sem scroll
- [ ] Aguardar 31 segundos → dados atualizam sem recarregar
- [ ] Leaderboard exibe usuários com score
- [ ] BigMetrics exibem números do dia

#### Sprint 4 — Modo Foco
- [ ] `/focus` abre sem erro
- [ ] TaskHorizon renderiza (mesmo que zeros)
- [ ] Se há leads na cadência → TaskCards aparecem
- [ ] Clicar WhatsApp em TaskCard → abre URL correta no browser
- [ ] Após clicar Done → card desaparece da lista
- [ ] ProgressRing incrementa corretamente
- [ ] Estado vazio ("Tudo em dia!") aparece quando não há tarefas

#### Sprint 5 — WPP + Prospecting
- [ ] KanbanCard: hover → botão WhatsApp abre com mensagem
- [ ] KanbanCard: lead com colaborador exibe avatar(s) sobreposto(s)
- [ ] LeadSheet: botão verde "WhatsApp" visível e funcional
- [ ] LeadSheet: dropdown "Convidar" adiciona usuário à lista de colaboradores
- [ ] Após convidar: colaborador aparece no card do Kanban
- [ ] `/prospecting`: colar texto com empresa + telefone → clicar Gerar → preview correto
- [ ] `/prospecting`: "Enviar WhatsApp" abre URL, item vai para histórico
- [ ] `/prospecting`: "Salvar como Lead" cria lead visível no Kanban

#### Filtro Multi-colaborador no Kanban
- [ ] Filtro "Meus Leads" mostra apenas leads onde sou owner
- [ ] Filtro "Colaborações" mostra leads onde sou colaborador
- [ ] Filtro "Todos" mostra todos os leads
- [ ] Trocar entre filtros não some leads (SWR revalida corretamente)

#### Regras gerais
- [ ] Nenhum `console.log` visível no console do browser (apenas errors esperados)
- [ ] Nenhum erro de TypeScript no build (`npx tsc --noEmit`)
- [ ] `owner_id` de nenhum lead foi alterado durante os sprints

---

## Criação do DONE.md

Após QA aprovado, criar `SPRINTS/SUPER-FOCUS-TV/DONE.md` com o relatório final.

---

## Log (preencher após execução)

**Status:** ⏳
**Data:**

### Entregue
-

### Arquivos tocados
-

### Decisões tomadas
| Decisão | Motivo |
|---------|--------|
| | |

### Erros encontrados
| Erro | Tentativa | Resolução |
|------|-----------|-----------|
| | | |
