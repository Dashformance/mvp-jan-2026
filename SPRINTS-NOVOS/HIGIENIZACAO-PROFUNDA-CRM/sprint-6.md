# Sprint 6 — Simplificação da Gamificação + Limpeza + QA

**Status:** ⏳ Pendente
**Objetivo:** Simplificar gamificação para pontuação básica. Polimento final. QA end-to-end.
**Depende de:** Sprints 1-5

---

## Contexto do Problema

A gamificação atual tem XP, níveis, tiers (Gold/Diamond/Platinum/Emerald/Bronze), combos, e uma economia complexa. Para 2 usuários, isso é overengineering. Manter apenas um score simples baseado em atividade real.

Além disso, há debris técnico acumulado: console.logs em produção, scripts de diagnóstico obsoletos, e mini-bugs que afetam a experiência.

---

## Arquivos Críticos

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| `client/lib/gamification/config.ts` | 259 | Configuração de XP, níveis, tiers, combos |
| `client/lib/gamification/server.ts` | ~200 | Engine de gamificação server-side. `addXP()`, `checkLevelUp()`, etc. |
| `client/lib/utils/score-calculator.ts` | ~100 | Fórmula de score (0-99) e mapeamento de tiers |
| `client/app/api/gamification/action/route.ts` | ~50 | Endpoint de ação de gamificação |
| `client/components/super-dash/PlayerCard.tsx` | ~200 | Exibe score, tier, métricas |
| `client/components/import/ImportWizard.tsx` | ~300 | Bug: não refresca lista após importação |
| `client/components/TrashSheet.tsx` | ~150 | Bug: restore pode não recolocar na coluna correta |

---

## Ações Detalhadas

### 1. Simplificar gamificação

**Manter:**
- Score simples baseado em atividade (contatos + reuniões + vendas)
- Ranking entre usuários (quem tem mais score)

**Remover:**
- XP economy (20 XP por lead, 30 por contato, etc.)
- Níveis (Level 1, 2, 3...)
- Tiers (Gold, Diamond, Platinum, Emerald, Bronze)
- Combos
- `xp` e `level` fields na tabela User (não deletar do schema, apenas parar de usar)

**Score simplificado:**

```typescript
// client/lib/utils/score-calculator.ts
// Nova fórmula simples:
export function calculateScore(stats: {
  contacts: number;    // Contatos feitos no período
  meetings: number;    // Reuniões agendadas no período
  sales: number;       // Vendas no período
}): number {
  // Pontuação direta:
  // 1 ponto por contato
  // 5 pontos por reunião
  // 20 pontos por venda
  return stats.contacts + (stats.meetings * 5) + (stats.sales * 20);
}

// Sem tiers. Sem níveis. Apenas o número.
```

**PlayerCard:** Exibir apenas o score numérico e o ranking (#1, #2). Remover badge de tier, barra de XP, level indicator.

### 2. Remover console.logs de produção

**Buscar em TODOS os arquivos:**

```bash
# Padrão de busca:
grep -rn "console.log\|console.warn\|console.error\|console.debug" client/app/api/ client/lib/services/
```

**Regra:**
- Remover TODOS os `console.log` de API routes e services
- Manter `console.error` APENAS para erros inesperados (catch blocks)
- Substituir logs de debug por nada (remover a linha)

**Arquivos com maior probabilidade de ter logs:**
- `client/app/api/leads/route.ts`
- `client/app/api/leads/[id]/route.ts`
- `client/lib/services/leads-service.ts`
- `client/lib/services/analytics-service.ts`
- `client/app/api/super-dash/stats/route.ts`
- `client/app/api/gamification/action/route.ts`

### 3. Remover scripts obsoletos

**Pasta:** `client/scripts/`

**Verificar quais scripts existem.** Remover os que foram criados para diagnóstico/restauração pontual:
- `diagnose-team-leads.ts` (se existe)
- `restore-team-leads.ts` (se existe)
- `trace-orphans.ts` (se existe)
- `generate-deep-report.ts`
- `generate-final-report.ts`
- `generate-robust-report.ts`
- Qualquer script de "fix" ou "migration" pontual

**Manter:** Scripts úteis para operação contínua (se houver).

### 4. Fix: ImportWizard não refresca lista

**Arquivo:** `client/components/import/ImportWizard.tsx`

**Problema:** Após importar leads, a lista do Kanban/Table não atualiza automaticamente. Usuário precisa dar refresh manual.

**Solução:** Após importação bem-sucedida, chamar `mutateLeads()` do contexto Kanban:

```typescript
// No callback de sucesso da importação:
const handleImportSuccess = () => {
  // Revalidar cache SWR
  mutate('/api/leads'); // ou mutateLeads() se disponível no contexto

  // Fechar wizard
  onClose();

  // Notificar
  toast.success(`${importedCount} leads importados com sucesso`);
};
```

**Se o ImportWizard não tem acesso ao `mutateLeads()`:** Usar `useSWRConfig().mutate` para invalidar o cache globalmente:

```typescript
import { useSWRConfig } from 'swr';
const { mutate } = useSWRConfig();

// Após importação:
mutate((key) => typeof key === 'string' && key.startsWith('/api/leads'), undefined, { revalidate: true });
```

### 5. Fix: TrashSheet restore

**Arquivo:** `client/components/TrashSheet.tsx`

**Problema:** Ao restaurar um lead da lixeira, ele pode não aparecer na coluna correta do Kanban.

**Verificar:**
1. O endpoint `POST /api/leads/{id}/restore` seta `deletedAt = null`. Correto.
2. Mas qual `status` o lead tem? Se foi deletado com status `MEETING`, ao restaurar deve voltar para coluna `MEETING`.
3. Verificar se o restore não reseta o status para `NEW`.

**Solução:** O restore deve APENAS limpar `deletedAt`, sem alterar nenhum outro campo:

```typescript
// leads-service.ts → restore():
async restore(id: string) {
  return await prisma.leads.update({
    where: { id },
    data: { deletedAt: null }  // APENAS isso. Nada mais.
  });
}
```

Após restore, chamar `mutateLeads()` para o lead aparecer no Kanban.

### 6. Error handling: toasts informativos

**Em todos os catch blocks de API calls no frontend:**

```typescript
// RUIM:
catch (error) {
  toast.error('Erro');
}

// BOM:
catch (error) {
  toast.error('Não foi possível mover o lead. Tente novamente.');
}

// MELHOR (com contexto):
catch (error) {
  const message = error instanceof Error ? error.message : 'Erro desconhecido';
  toast.error(`Falha ao atualizar lead: ${message}`);
}
```

**Locais para verificar:**
- `use-kanban-state.ts` — operações de CRUD
- `use-kanban-dnd.ts` — drag-and-drop
- `LeadSheet.tsx` — salvar edições
- `ImportWizard.tsx` — importação
- `BulkActionBar.tsx` — ações em massa

### 7. Teste end-to-end manual

**Fluxo completo a validar (checklist):**

1. **Criar lead** → Lead aparece no Kanban na coluna correta? Com owner correto?
2. **Editar lead** → Edição inline na tabela funciona? LeadSheet salva corretamente?
3. **Mover no kanban** → Drag-and-drop atualiza status? Owner preservado?
4. **Filtrar** → "Meus Leads" mostra só os meus? "Todos" mostra todos? Busca funciona?
5. **Importar** → CSV importa? Lista refresca? Owner atribuído corretamente?
6. **Exportar** → CSV baixa? Dados corretos? Filtros aplicados?
7. **Deletar** → Soft delete funciona? Lead some da lista? Aparece na lixeira?
8. **Restaurar** → Lead volta da lixeira? Mesmo status? Mesmo owner? Aparece no kanban?
9. **SuperDash** → Métricas batem? Score individual correto? Team total = soma individuais?
10. **Mudar período** → Hoje/Semana/Mês mudam os números? Sem dados mostra mensagem?

---

## Critério de Conclusão

- [ ] Gamificação simplificada: apenas score numérico (sem XP, níveis, tiers)
- [ ] Zero `console.log` em produção (apenas `console.error` em catch blocks)
- [ ] Scripts obsoletos removidos da pasta `scripts/`
- [ ] ImportWizard refresca lista após importação
- [ ] Restore da lixeira preserva status e owner originais
- [ ] Toasts de erro são informativos (não genéricos)
- [ ] Fluxo completo (10 etapas) funciona sem erros
