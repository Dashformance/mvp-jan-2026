# Sprint 4 — Performance Tracking Consistente

**Status:** ⏳ Pendente
**Objetivo:** Métricas individuais e de equipe corretas e confiáveis.
**Depende de:** Sprint 1 (dados íntegros). Pode rodar em paralelo com Sprint 3.

---

## Contexto do Problema

As métricas do SuperDash e Dashboard não batem entre si. Possíveis causas:
1. Queries usando campo legado `owner` (string) em vez de `owner_id` (UUID)
2. Leads deletados (soft delete) sendo contados em algumas queries e não em outras
3. Leads que passaram por merge contando duplamente
4. Cálculo de período (datas) inconsistente entre componentes
5. "Team Pace" e "Team Quality" usando base de dados diferente dos PlayerCards individuais

---

## Arquivos Críticos

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| `client/lib/services/analytics-service.ts` | 786 | Motor de analytics. Métodos: `getStatsOverview()`, `getConversionFunnel()`, `getPerformanceByOwner()`, `getActivityTrend()`, `getSalesForce()` |
| `client/app/api/super-dash/stats/route.ts` | ~86 | Endpoint do SuperDash. Recebe período (minDate/maxDate) e calcula métricas |
| `client/components/super-dash/PlayerCard.tsx` | ~200 | Card individual do jogador. Score, tier, métricas pessoais |
| `client/components/super-dash/DateFilterToggle.tsx` | 305 | Seletor de período: hoje, esta semana, semana passada, este mês, total, custom |
| `client/lib/utils/score-calculator.ts` | ~100 | Fórmula de score e tiers |

---

## Ações Detalhadas

### 1. Auditar `getPerformanceByOwner()`

**Arquivo:** `client/lib/services/analytics-service.ts` (~linha 332)

**Verificar:**
- Está filtrando por `owner_id` (UUID) ou pelo campo legado `owner` (string)?
- Se usa `owner`, trocar para `owner_id`
- Garantir que agrupa por `owner_id` e faz JOIN com tabela `User` para pegar o nome

```typescript
// CORRETO:
const leadsByOwner = await prisma.leads.groupBy({
  by: ['owner_id'],
  where: {
    deletedAt: null,
    owner_id: { not: null },
    // filtros de período...
  },
  _count: true,
  _sum: { contract_value: true },
});

// ERRADO:
const leadsByOwner = await prisma.leads.groupBy({
  by: ['owner'],  // ← campo legado!
  ...
});
```

**Após groupBy por `owner_id`:** Fazer lookup na tabela User para montar o objeto de resposta com nome, avatar, etc.

### 2. Auditar `getStatsOverview()`

**Arquivo:** `client/lib/services/analytics-service.ts`

**Verificar em TODAS as queries deste método:**
- Toda query deve ter `deletedAt: null` no where
- Toda query que filtra por owner deve usar `owner_id`, não `owner`
- Toda query que conta revenue deve usar `contract_value` com `_sum`

**Buscar no arquivo:** `deletedAt` — verificar se aparece em todas as queries. Se alguma query não filtra `deletedAt`, ela pode estar contando leads deletados.

### 3. Fix dupla contagem em merge

**Arquivo:** `client/lib/services/analytics-service.ts`

**Problema:** Se lead A foi merged em lead B, e lead A foi soft-deleted (`deletedAt` set), ele NÃO deve aparecer nas métricas. Mas se a query de interactions conta interactions do lead A (que foi merged), pode haver dupla contagem.

**Solução:**
```typescript
// Ao contar interactions para métricas, excluir leads deletados:
const interactions = await prisma.interactions.findMany({
  where: {
    date: { gte: minDate, lte: maxDate },
    leads: {
      deletedAt: null,  // ← Excluir interactions de leads deletados
    }
  }
});
```

**Alternativa:** Se as interactions já foram transferidas para o lead master durante o merge, isso não é problema. Verificar o método `mergeLeads()` em `leads-service.ts`.

### 4. PlayerCard: Verificar datas do período

**Arquivo:** `client/components/super-dash/PlayerCard.tsx`

**Verificar:**
- O componente recebe `period` ou `minDate/maxDate` como props?
- Está usando as mesmas datas que o `DateFilterToggle` selecionou?
- Ou está calculando datas próprias?

**Potencial bug:** Se o PlayerCard calcula "esta semana" internamente, pode divergir do que o `DateFilterToggle` calcula. As datas devem vir de um único ponto (o DateFilterToggle) e ser passadas como props.

```typescript
// CORRETO (datas centralizadas):
<PlayerCard user={user} stats={statsDoAPI} />
// onde statsDoAPI já vem filtrado pelo período selecionado

// ERRADO (datas duplicadas):
<PlayerCard user={user} period="thisWeek" />
// onde PlayerCard calcula suas próprias datas
```

### 5. Team Pace e Team Quality

**Arquivo:** `client/app/(protected)/super-dash/page.tsx` ou `client/app/api/super-dash/stats/route.ts`

**Definições:**
- **Team Pace:** `AVG((contacts / 20) * 100)` — onde `contacts` = número de contatos feitos no período
- **Team Quality:** `AVG(conversion_rate)` — onde `conversion_rate` = (vendas / leads adicionados) * 100

**Verificar:**
- A base de dados usada para calcular Team Pace/Quality é a MESMA dos PlayerCards individuais?
- Se não, pode haver divergência
- A fórmula deve ser: `soma dos valores individuais / número de membros ativos`

**Fix:** Calcular Team Pace e Team Quality a partir dos MESMOS dados já retornados para os PlayerCards:

```typescript
const teamPace = collaborators.reduce((sum, c) => sum + c.pace, 0) / collaborators.length;
const teamQuality = collaborators.reduce((sum, c) => sum + c.conversionRate, 0) / collaborators.length;
```

### 6. DateFilterToggle: Timezone BR

**Arquivo:** `client/components/super-dash/DateFilterToggle.tsx`

**Verificar:**
- "Essa Semana" calcula segunda a domingo?
- Está usando timezone de São Paulo (UTC-3)?
- O que acontece com "Hoje" se o servidor estiver em UTC?

**Regras de data (timezone BRT = UTC-3):**
```typescript
// Hoje:
const today = new Date();
today.setHours(0, 0, 0, 0); // Início do dia local
const endOfDay = new Date(today);
endOfDay.setHours(23, 59, 59, 999);

// Esta semana (seg-dom):
const now = new Date();
const dayOfWeek = now.getDay(); // 0=dom, 1=seg, ..., 6=sab
const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
const monday = new Date(now);
monday.setDate(now.getDate() + diffToMonday);
monday.setHours(0, 0, 0, 0);
const sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6);
sunday.setHours(23, 59, 59, 999);
```

**IMPORTANTE:** Se o DateFilterToggle envia datas como ISO strings para a API, garantir que são em UTC mas representam o dia correto em BRT.

### 7. Indicadores visuais "sem dados"

**Arquivos:** `client/components/super-dash/PlayerCard.tsx`, `TrendChart.tsx`, `ActionTrendChart.tsx`

Quando um período não tem atividade (ex: "Semana Passada" mas ninguém fez nada):

```tsx
// Em vez de mostrar gráfico vazio ou zeros sem contexto:
{stats.totalActivities === 0 ? (
  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
    <span className="text-sm">Sem atividades neste período</span>
    <span className="text-xs">Selecione outro período ou comece a prospectar!</span>
  </div>
) : (
  <Chart data={stats} />
)}
```

---

## Critério de Conclusão

- [ ] Todas as queries de analytics usam `owner_id` (não `owner`)
- [ ] Todas as queries filtram `deletedAt: null`
- [ ] Soma de métricas individuais = total do time (verificar manualmente)
- [ ] Team Pace e Team Quality calculados a partir dos mesmos dados dos PlayerCards
- [ ] "Esta Semana" = segunda 00:00 a domingo 23:59 em timezone BR
- [ ] Períodos sem atividade mostram mensagem clara em vez de gráfico vazio
- [ ] PlayerCard usa datas do DateFilterToggle (não calcula próprias)
