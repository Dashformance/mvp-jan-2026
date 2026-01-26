# 🔄 Sprint 10: Kanban V2 + Revenue Metrics

> **Status:** 🔴 Pendente  
> **Prioridade:** Alta  
> **Dependências:** Sprint 03 (Design System atualizado)

---

## 🎯 Objetivo

Refatorar completamente o Kanban para o novo Design System (Dark Void + Neon) e adicionar o campo de **Valor do Contrato** para habilitar métricas financeiras no SuperDash.

---

## 📊 Parte 1: Campo "Valor do Contrato"

### Backend (Prisma)
- [ ] Adicionar campo `contract_value` (Decimal) no model `Lead`.
- [ ] Criar migration e aplicar.
- [ ] Atualizar API `/api/leads` para aceitar e retornar o novo campo.

### Frontend (Lead Sheet)
- [ ] Adicionar input monetário no formulário de edição do lead.
- [ ] Formatação BRL (R$ 1.000,00).
- [ ] Validação: aceitar apenas valores positivos.

---

## 🎨 Parte 2: Refatoração Visual do Kanban

### KanbanCard.tsx
- [ ] Migrar cores de `#222222` para `var(--color-bg-surface)`.
- [ ] Substituir border champagne por neon green em leads de alto valor.
- [ ] Adicionar glow sutil no hover (igual ao PlayerCard).
- [ ] Exibir badge com o valor do contrato (se preenchido).

### KanbanColumn.tsx
- [ ] Atualizar fundo para `var(--color-bg-deep)`.
- [ ] Adicionar somatório do valor dos leads na coluna (header).
- [ ] Indicador visual de "dinheiro na coluna".

### KanbanBoard.tsx
- [ ] Revisar espaçamentos e padding para consistência.
- [ ] Garantir que o DragOverlay mantenha o estilo do card.

---

## 📈 Parte 3: Métricas no SuperDash

### Novos KPIs
- [ ] **Vendas Realizadas:** Soma de `contract_value` onde `status = 'SOLD'`.
- [ ] **Dinheiro na Mesa:** Soma de `contract_value` onde `status IN ('NEW', 'CONTACTED', 'MEETING', 'WON')`.

### Componentes
- [ ] Criar `RevenueCard.tsx` para exibir os KPIs monetários.
- [ ] Integrar na página principal ou na Arena.

---

## 🔄 Parte 4: Sync & Cache (Opcional)

> Esta fase pode ser feita em paralelo ou postergada.

- [ ] Integrar React Query (`@tanstack/react-query`).
- [ ] Substituir `useState` + `fetch` por queries e mutations.
- [ ] Implementar cache e refetch automático.

---

## ✅ Critérios de Aceite

1. [ ] Campo `contract_value` funciona no CRUD de leads.
2. [ ] Kanban visualmente alinhado com o novo Design System.
3. [ ] SuperDash exibe os KPIs de receita corretamente.
4. [ ] Somatório de valor aparece no header das colunas.

---

## 📝 Notas Técnicas

### Formato do Valor
- Armazenar como `Decimal` no Prisma (precisão monetária).
- Exibir com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

### Performance
- A query de somatório pode ser feita client-side (para MVP) ou via endpoint dedicado.
