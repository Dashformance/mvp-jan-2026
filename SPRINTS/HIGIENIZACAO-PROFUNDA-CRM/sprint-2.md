# Sprint 2 — Estabilização do Kanban

**Status:** ⏳ Pendente
**Objetivo:** Drag-and-drop confiável, filtros previsíveis, paginação correta.
**Depende de:** Sprint 1 (dados íntegros)

---

## Contexto do Problema

O Kanban é a interface principal dos usuários. Tem 3 categorias de bugs:

1. **Optimistic updates sem rollback** — Se a API falha ao mover um lead, o card fica na coluna errada
2. **Filtros resetam paginação** — Trocar filtro limpa leads de páginas anteriores do cache SWR
3. **Contagem inconsistente** — Após deletar, o total não atualiza imediatamente

---

## Arquivos Críticos

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| `client/components/kanban/hooks/use-kanban-state.ts` | 578 | Estado central: SWR Infinite para paginação, filtros, ordenação, optimistic updates |
| `client/components/kanban/hooks/use-kanban-dnd.ts` | ~150 | Lógica de drag-and-drop com @dnd-kit. `handleDragEnd` atualiza status |
| `client/components/kanban/KanbanBoard.tsx` | ~200 | Renderiza colunas + cards. Usa DndContext |
| `client/components/kanban/KanbanView.tsx` | 390 | Container principal. Orquestra view mode, filtros, ações bulk |
| `client/components/kanban/FilterBar.tsx` | ~150 | Barra de filtros: search, status, view (mine/all), source |
| `client/components/kanban/KanbanColumn.tsx` | ~100 | Coluna individual. Droppable zone. Métricas (score, valor, count) |
| `client/components/kanban/KanbanCard.tsx` | ~220 | Card individual. Draggable. Exibe info do lead |

---

## Ações Detalhadas

### 1. Fix rollback em optimistic updates

**Arquivo:** `client/components/kanban/hooks/use-kanban-state.ts`

**Problema:** Quando o usuário arrasta um lead para outra coluna, o UI atualiza imediatamente (optimistic). Se a API falhar, o lead fica na coluna errada.

**Solução:** Salvar estado anterior antes do update. Se API falhar, reverter ao estado anterior.

```typescript
const updateLeadStatus = useCallback(async (id: string, newStatus: string) => {
  // 1. Salvar snapshot do estado atual (para rollback)
  const previousData = data; // data = páginas do SWR

  // 2. Optimistic update
  mutateLeads(
    (prevPages) => prevPages?.map(page => ({
      ...page,
      data: page.data.map((l: any) =>
        l.id === id ? { ...l, status: newStatus } : l
      )
    })),
    false // não revalidar ainda
  );

  try {
    // 3. Chamar API
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) throw new Error('Failed to update');

    // 4. Revalidar com dados do servidor
    mutateLeads();
  } catch (error) {
    // 5. ROLLBACK: restaurar estado anterior
    mutateLeads(previousData, false);
    // 6. Notificar usuário
    toast.error('Erro ao mover lead. Tente novamente.');
  }
}, [data, mutateLeads]);
```

**Buscar no código:** O método que atualiza status após drag-end. Verificar se já existe `try/catch`. Se existir, verificar se faz rollback ou apenas refetch.

### 2. Fix filtro + paginação (SWR cache)

**Arquivo:** `client/components/kanban/hooks/use-kanban-state.ts` (~linha 227)

**Problema:** Quando `filterBarState` muda, o `useEffect` chama `setSize(1)`, que reseta para a primeira página. Mas o cache SWR das páginas anteriores fica inconsistente.

**Solução:**

```typescript
useEffect(() => {
  // Ao mudar filtros, resetar paginação E limpar cache SWR
  setSize(1);
  // Forçar revalidação completa para limpar dados stale
  mutateLeads(undefined, true); // true = revalidate
}, [filterBarStateKey, sortBy]);
```

**Alternativa:** Usar `mutateLeads(undefined, { revalidate: true })` para forçar refetch limpo.

### 3. Fix "view mine/all" após bulk ownership change

**Arquivo:** `client/components/kanban/hooks/use-kanban-state.ts` + `BulkActionBar.tsx`

**Problema:** Após trocar owner de vários leads em bulk, o SWR não revalida. Leads que eram "meus" podem ter mudado de dono, mas continuam aparecendo no "Meus Leads".

**Solução:** Após qualquer operação de bulk update que altere `owner_id`, forçar `mutateLeads()`:

```typescript
// Em BulkActionBar ou onde handleBulkOwnerChange é chamado:
const handleBulkOwnerChange = async (ownerId: string, ownerName: string) => {
  const ids = Array.from(selectedLeads);
  await bulkUpdateLeads(ids, { owner: ownerName, owner_id: ownerId });

  // Limpar seleção
  setSelectedLeads(new Set());

  // Forçar revalidação completa
  mutateLeads(undefined, true);

  toast.success(`${ids.length} leads transferidos para ${ownerName}`);
};
```

### 4. Fix contagem na paginação após soft delete

**Arquivo:** `client/components/kanban/hooks/use-kanban-state.ts`

**Problema:** Após deletar um lead, o `meta.total_count` do SWR não atualiza imediatamente. A paginação mostra "10 de 50" mas na verdade são 49.

**Solução:** No optimistic update de delete, decrementar o total:

```typescript
const deleteLead = useCallback(async (id: string) => {
  // Optimistic: remover lead do cache E decrementar total
  mutateLeads(
    (prevPages) => prevPages?.map(page => ({
      ...page,
      data: page.data.filter((l: any) => l.id !== id),
      meta: {
        ...page.meta,
        total_count: Math.max(0, (page.meta?.total_count || 0) - 1)
      }
    })),
    false
  );

  try {
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    mutateLeads(); // Revalidar
  } catch {
    mutateLeads(); // Refetch on error
    toast.error('Erro ao deletar lead');
  }
}, [mutateLeads]);
```

### 5. Revisar collision detection do dnd-kit

**Arquivo:** `client/components/kanban/hooks/use-kanban-dnd.ts`

**Problema potencial:** O algoritmo `closestCorners` pode fazer leads "pularem" para colunas erradas quando arrastados rapidamente.

**Verificar:**
- Qual collision detection está sendo usado (deve ser `closestCorners` ou `closestCenter`)
- Se tem `activationConstraint` configurado (distância mínima antes de ativar drag)
- Se os sensores têm delay adequado:
  ```typescript
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );
  ```

**Se leads pulam:** Trocar `closestCorners` por `closestCenter` ou adicionar lógica no `handleDragOver` para ignorar mudanças de coluna durante o drag (só aplicar no `handleDragEnd`).

### 6. Preservar owner_id ao arrastar

**Arquivo:** `client/components/kanban/hooks/use-kanban-dnd.ts` ou `use-kanban-state.ts`

**Verificar:** Quando o `handleDragEnd` chama `PATCH /api/leads/{id}`, o payload DEVE conter APENAS `{ status: newStatus }`. NÃO deve incluir outros campos que possam sobrescrever `owner_id`.

```typescript
// CORRETO:
body: JSON.stringify({ status: newStatus })

// ERRADO (pode limpar owner_id):
body: JSON.stringify({ ...lead, status: newStatus })
```

### 7. Simplificar FilterBar

**Arquivo:** `client/components/kanban/FilterBar.tsx`

**Para 2 usuários, manter apenas:**
1. **Search** (busca por nome/CNPJ)
2. **Status** (filtro por estágio do funil)
3. **View** (Meus Leads / Todos)

**Remover ou esconder (se existirem):**
- Filtro por source (origem)
- Filtro por cidade
- Filtro por score range
- Qualquer outro filtro que não seja usado diariamente

**Abordagem:** Não deletar o código dos filtros — apenas esconder com `{false && ...}` ou um flag `showAdvancedFilters`. Assim podem ser reativados quando novos comerciais entrarem.

---

## Critério de Conclusão

- [ ] Arrastar lead entre colunas: se API falhar, lead volta para coluna original
- [ ] Trocar filtro não faz leads sumirem (cache SWR limpo corretamente)
- [ ] Após bulk ownership change, lista revalida automaticamente
- [ ] Contagem de leads na paginação é precisa após delete
- [ ] Drag-and-drop não envia `owner_id` no payload (apenas `status`)
- [ ] FilterBar tem apenas 3 filtros visíveis: search, status, view
