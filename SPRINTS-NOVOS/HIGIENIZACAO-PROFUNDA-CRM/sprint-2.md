# Sprint 2 — Kanban: Arquitetura de Stages + Bugs Críticos

**Status:** ✅ Concluído
**Objetivo:** Corrigir bugs críticos e tornar colunas dinâmicas/editáveis com identificadores estáveis.
**Data:** 2026-03-10

---

## Diagnóstico dos Bugs (Raiz Confirmada)

### Bug 1 — Lead vai para coluna errada ao criar

**Arquivo:** `client/components/kanban/hooks/use-kanban-state.ts` (~linha 538)

**Causa raiz:** A função que abre o LeadSheet para novo lead hardcoda `status: "NEW"` independente de qual coluna o usuário clicou.

```typescript
// BUGADO ATUAL:
setSelectedLeadForSheet({
    id: "new",
    company_name: "",
    status: "NEW",  // ← sempre NEW, ignora a coluna clicada
    source: "Manual",
    checklist: { hasInstagram: false, hasRender: false }
});
```

**Cadeia do bug:**
1. Usuário clica "+" na coluna "Em Fechamento" (WON)
2. `onAddLead("WON")` é chamado em `ConnectedKanbanBoard.tsx:46`
3. Mas `openLeadSheet()` é chamado SEM passar o parâmetro `status`
4. Lead é criado com `status = "NEW"` → aparece em "Qualificado"

### Bug 2 — Drag-and-drop falha

**Arquivo:** `client/components/kanban/hooks/use-kanban-dnd.ts`

**Causa raiz:** `handleDragEnd` usa `over.id` como novo status. Quando o lead é dropado sobre OUTRO LEAD (não sobre a coluna vazia), usa `overLead.status` do estado local, que pode estar desatualizado se o estado sofreu update recente.

```typescript
// BUGADO ATUAL:
let newStatus = over.id as string;
const overLead = leads.find(l => l.id === over.id);
if (overLead) {
    newStatus = overLead.status;  // ← status do lead alvo, pode estar stale
}
```

**Fix correto:** Usar `over.data.current?.sortable?.containerId` do dnd-kit para obter o ID da coluna diretamente, ignorando o lead alvo.

---

## Arquitetura Atual vs. Desejada

### Problema Arquitetural

**Atual:**
- `stages.name` = identificador fixo ("NEW", "ATTEMPTED", "WON") — não editável sem quebrar dados
- `stages.phase` = nome de exibição ("✅ Qualificado", "📞 Tentativa") — duplicata redundante
- `leads.status` = string legada ("NEW") — se a stage for renomeada, todos os leads precisam de migração
- `PIPELINE_COLUMNS` em `KanbanBoard.tsx` = array HARDCODED no frontend

**Desejado:**
- `stages.id` = UUID estável — é o identificador permanente (nunca muda)
- `stages.name` = nome editável pelo usuário ("Qualificado", "Em Fechamento")
- `leads.status` = `stages.id` (UUID) — estável, renomear a coluna não afeta os leads
- Colunas 100% dinâmicas — vêm do banco, nenhuma hardcoded no frontend

---

## Arquivos Críticos

| Arquivo | Ação |
|---------|------|
| `client/prisma/schema.prisma` | MODIFICAR — remover `phase`, `name` vira display |
| `client/app/api/stages/route.ts` | MODIFICAR — PATCH por `id`, adicionar DELETE |
| `client/app/api/stages/[id]/route.ts` | CRIAR — DELETE endpoint |
| `client/components/kanban/KanbanBoard.tsx` | MODIFICAR — remover PIPELINE_COLUMNS hardcoded |
| `client/components/kanban/hooks/use-kanban-state.ts` | MODIFICAR — bug criação, colunas dinâmicas |
| `client/components/kanban/hooks/use-kanban-dnd.ts` | MODIFICAR — fix drag-and-drop + rollback |
| `client/components/kanban/KanbanColumn.tsx` | MODIFICAR — botão delete |
| `client/components/kanban/KanbanView.tsx` | MODIFICAR — simplificar FilterBar |
| `client/lib/services/leads-service.ts` | MODIFICAR — queries filtram por status UUID |
| `client/app/api/leads/route.ts` | MODIFICAR — status filter aceita UUID |

---

## Ações Detalhadas

### PARTE A — Arquitetura de Stages (executar primeiro — pré-requisito)

#### A1. Schema: unificar `name` e `phase`

**Ler:** `client/prisma/schema.prisma` antes de editar.

Modificar o modelo `stages`: remover campo `phase`, o campo `name` passa a ser o nome de exibição editável.

```prisma
model stages {
  id            String   @id
  name          String   // Nome de exibição editável. Ex: "Qualificado", "Em Fechamento"
  // phase removido — era redundante com name
  color         String?
  icon          String?
  position      Int      @default(0)
  is_win_stage  Boolean  @default(false)
  is_lost_stage Boolean  @default(false)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
}
```

Criar migração com SQL que preserva dados (popular `name` a partir de `phase`):
```bash
cd client && npx prisma migrate dev --name "stages-name-is-display-drop-phase"
```

No arquivo de migration gerado, adicionar ANTES do DROP COLUMN:
```sql
UPDATE stages SET name = phase WHERE phase IS NOT NULL AND phase != '';
```

#### A2. Script de migração: `leads.status` → UUID

**Criar:** `client/scripts/migrate-status-to-uuid.ts`

Lógica:
1. Buscar todas as stages do banco
2. Para cada status legado ("NEW", "ATTEMPTED", etc.), encontrar a stage correspondente pelo nome ou pelo mapeamento fixo
3. `UPDATE leads SET status = stage.id WHERE status = legacyString`
4. Leads com status não mapeado → recebem o UUID da primeira stage (position 0)
5. Logar resultado: `"NEW → UUID-xxx (47 leads)"`

Mapeamento fixo a usar (status legado → trecho do nome da stage):
```typescript
const LEGACY_MAP: Record<string, string> = {
  'INBOX':        'fria',        // "Lista Fria"
  'NEW':          'qualificado', // "Qualificado"
  'ATTEMPTED':    'tentativa',   // "Tentativa"
  'CONTACTED':    'contatado',   // "Contatado"
  'MEETING':      'reuni',       // "Reunião"
  'WON':          'fechamento',  // "Em Fechamento"
  'SOLD':         'fechado',     // "Negócio Fechado"
  'LOST':         'perdido',     // "Perdido"
  'DISQUALIFIED': 'desqualificado',
};
```

Match: `stage.name.toLowerCase().includes(substring)`.

**Executar:** `cd client && npx tsx scripts/migrate-status-to-uuid.ts`

**Verificar após:** `SELECT DISTINCT status FROM leads` deve retornar apenas UUIDs.

#### A3. Atualizar `LeadsService.findAll()` e queries de status

**Arquivo:** `client/lib/services/leads-service.ts`

Buscar todas as ocorrências de filtro por status. O status agora é UUID — nenhuma mudança de lógica de filtragem é necessária (já filtra por string, UUID é string). Remover qualquer validação que cheque se status está em lista fixa de strings legadas.

**Arquivo:** `client/app/api/leads/route.ts`

O parâmetro `?status=UUID,UUID` já funciona como string. Garantir que não há validação bloqueando valores que não sejam strings legadas.

#### A4. Remover `STATUS_MAP` e `PIPELINE_COLUMNS` hardcoded

**Arquivo:** `client/components/kanban/hooks/use-kanban-state.ts`

Remover o `STATUS_MAP` (linhas ~13-23). As cores e labels agora vêm das stages da API.

**Arquivo:** `client/components/kanban/KanbanBoard.tsx`

Remover o array `PIPELINE_COLUMNS` hardcoded. As colunas são exclusivamente as retornadas pela API `/api/stages`, já gerenciadas pelo state hook. Verificar que o componente recebe `columns` como prop e usa apenas esses.

#### A5. Atualizar `PATCH /api/stages`

**Arquivo:** `client/app/api/stages/route.ts`

O PATCH atual atualiza `phase` buscando por `name` (identificador). Com a nova arquitetura, deve atualizar `name` buscando por `id`:

```typescript
// ANTES (errado — name era identificador):
await prisma.stages.updateMany({ where: { name }, data: { phase } });

// DEPOIS (correto — id é identificador, name é display):
await prisma.stages.update({ where: { id: stageId }, data: { name: newName } });
```

---

### PARTE B — Fix Bug: Criação de Lead na Coluna Correta

#### B1. Passar `columnId` ao abrir LeadSheet

**Ler:** O arquivo que define `onAddLead` (provavelmente `ConnectedKanbanBoard.tsx` ou `KanbanView.tsx`).

Garantir que o UUID da coluna clicada é passado para a função que abre o LeadSheet:

```typescript
// ANTES:
onAddLead={(status) => {
    openLeadSheet(); // ignora parâmetro
}}

// DEPOIS:
onAddLead={(columnId) => {
    openLeadSheet(columnId); // passa UUID da coluna
}}
```

#### B2. Usar `columnId` ao inicializar novo lead

**Arquivo:** `client/components/kanban/hooks/use-kanban-state.ts` (~linha 533)

```typescript
// ANTES:
const openLeadSheet = () => {
  setSelectedLeadForSheet({
    id: "new",
    status: "NEW",  // hardcoded
    ...
  });
};

// DEPOIS:
const openLeadSheet = (columnId?: string) => {
  const defaultStatus = columnId || columns[0]?.id || '';
  setSelectedLeadForSheet({
    id: "new",
    status: defaultStatus,  // UUID da coluna clicada
    ...
  });
};
```

---

### PARTE C — Fix Drag-and-Drop

#### C1. Usar `containerId` do dnd-kit

**Arquivo:** `client/components/kanban/hooks/use-kanban-dnd.ts`

Ler o arquivo completo. Modificar `handleDragEnd`:

```typescript
const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);
    if (!over) return;

    const leadId = active.id as string;

    // CORRETO: sempre usar o ID da coluna (containerId), nunca o ID do lead alvo
    const targetColumnId =
        (over.data.current?.sortable?.containerId as string) || // dropped em card
        (over.id as string);                                     // dropped em coluna vazia

    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.status === targetColumnId) return;

    const previousStatus = lead.status;
    onLeadUpdate(leadId, targetColumnId, previousStatus);
};
```

#### C2. Rollback se API falhar

**Arquivo:** `client/components/kanban/hooks/use-kanban-state.ts`

A função `updateLeadStatus` (ou `onLeadUpdate`) deve receber `previousStatus` e reverter se o PATCH falhar:

```typescript
const updateLeadStatus = async (leadId: string, newStatus: string, previousStatus: string) => {
    // Optimistic update
    mutateLeads((prev) => prev?.map(page => ({
        ...page,
        data: page.data.map((l: any) =>
            l.id === leadId ? { ...l, status: newStatus } : l
        )
    })), false);

    try {
        const res = await fetch(`/api/leads/${leadId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error('API error');
        mutateLeads(); // revalidar
    } catch {
        // ROLLBACK
        mutateLeads((prev) => prev?.map(page => ({
            ...page,
            data: page.data.map((l: any) =>
                l.id === leadId ? { ...l, status: previousStatus } : l
            )
        })), false);
        toast.error('Erro ao mover lead. Posição restaurada.');
    }
};
```

---

### PARTE D — Delete de Coluna

#### D1. Criar `DELETE /api/stages/[id]`

**Criar:** `client/app/api/stages/[id]/route.ts`

```typescript
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verificar leads vivos nesta coluna
    const leadCount = await prisma.leads.count({
        where: { status: params.id, deletedAt: null }
    });

    if (leadCount > 0) {
        return NextResponse.json({
            error: 'HAS_LEADS',
            count: leadCount,
            message: `Esta coluna tem ${leadCount} lead${leadCount > 1 ? 's' : ''}. Mova-os para outra coluna antes de excluir.`
        }, { status: 400 });
    }

    await prisma.stages.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
}
```

#### D2. Botão de delete no KanbanColumn

**Arquivo:** `client/components/kanban/KanbanColumn.tsx`

Ler o arquivo. Adicionar ícone `Trash2` no header da coluna, visível apenas no hover:

```tsx
// Visível apenas quando coluna tem `is_win_stage=false` e `is_lost_stage=false`
// (não deletar colunas de sistema como "Vendido" ou "Perdido")
{!column.is_win_stage && !column.is_lost_stage && (
    <button
        onClick={handleDeleteColumn}
        title="Excluir coluna"
        className="opacity-0 group-hover:opacity-100 transition-opacity
                   text-zinc-600 hover:text-red-400 p-1 rounded ml-1"
    >
        <Trash2 className="h-3 w-3" />
    </button>
)}
```

```typescript
const handleDeleteColumn = async () => {
    const res = await fetch(`/api/stages/${column.id}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) {
        toast.error(data.message || 'Erro ao excluir coluna');
        return;
    }

    onDeleteColumn(column.id); // remove do estado local
    toast.success(`Coluna "${column.title}" excluída`);
};
```

Adicionar prop `onDeleteColumn: (columnId: string) => void` ao componente.

#### D3. Implementar `deleteColumn` no state

**Arquivo:** `client/components/kanban/hooks/use-kanban-state.ts`

```typescript
const deleteColumn = useCallback((columnId: string) => {
    setColumns(prev => prev.filter(c => c.id !== columnId));
}, []);
```

Passar `deleteColumn` como `onDeleteColumn` para `KanbanColumn` via `KanbanBoard`.

#### D4. Simplificar FilterBar

**Arquivo:** `client/components/kanban/FilterBar.tsx`

Ler o arquivo. Manter visíveis: **search + status + view (Meus/Todos)**. Todos os outros filtros (source, cidade, score, quality) → ocultar com `hidden` ou condicionar a um botão "Mais filtros" colapsado.

---

## Critério de Conclusão

- [ ] `npx prisma migrate dev` executa sem erros
- [ ] `SELECT DISTINCT status FROM leads` retorna apenas UUIDs de stages
- [ ] `SELECT * FROM stages WHERE phase IS NOT NULL` retorna 0 (campo removido)
- [ ] Criar lead clicando "+" em "Em Fechamento" → lead aparece em "Em Fechamento"
- [ ] Arrastar lead entre colunas → status correto salvo no banco
- [ ] Arrastar e API falhar → lead volta à coluna original com toast de erro
- [ ] Renomear coluna → `stages.name` muda, leads permanecem na mesma coluna (UUID inalterado)
- [ ] Excluir coluna VAZIA → coluna desaparece do kanban
- [ ] Excluir coluna COM LEADS → toast `"Esta coluna tem X leads..."`, coluna permanece
- [ ] Nenhum `PIPELINE_COLUMNS` ou `STATUS_MAP` hardcoded restante no frontend
- [ ] FilterBar exibe apenas: search, status, view

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
