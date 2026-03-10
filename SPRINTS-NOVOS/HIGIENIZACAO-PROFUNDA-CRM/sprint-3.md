# Sprint 3 — UX "Excel-Like" (Simplicidade)

**Status:** ⏳ Pendente
**Objetivo:** Interface tão simples quanto uma planilha para operações do dia-a-dia.
**Depende de:** Sprint 2 (kanban estável)

---

## Contexto do Problema

Os usuários (João e Vitor) estão acostumados com a simplicidade do Excel. O CRM tem muitas funcionalidades, mas as operações básicas do dia-a-dia exigem muitos cliques. Para o funil de WhatsApp, o fluxo principal é:

1. Ver lead → 2. Copiar telefone → 3. Abrir WhatsApp → 4. Marcar contato → 5. Mudar status

Isso deve ser possível em 1-2 cliques, não em 5+ cliques com modais.

---

## Arquivos Críticos

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| `client/components/table/LeadsTable.tsx` | 330 | Tabela de leads. Hoje: click abre modal. Falta edição inline |
| `client/components/lead/LeadSheet.tsx` | ~400 | Modal de edição completa. Tabs: info, contatos, qualificação, timeline |
| `client/components/kanban/KanbanCard.tsx` | ~220 | Card do kanban. Mostra muita info. Precisa simplificar |
| `client/components/import/ImportWizard.tsx` | ~300 | Wizard de importação com 5 etapas. Demais para 2 usuários |

---

## Ações Detalhadas

### 1. LeadsTable: Edição inline

**Arquivo:** `client/components/table/LeadsTable.tsx`

Adicionar edição inline nos campos principais. Ao clicar em uma célula, ela vira um input editável:

```typescript
// Campos editáveis inline:
// - company_name / trade_name (texto)
// - phone (texto)
// - status (dropdown)
// - owner (dropdown com usuários)

// Pattern: useState para controlar qual célula está em edição
const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null);

// Ao clicar na célula:
// 1. setEditingCell({ id: lead.id, field: 'phone' })
// 2. Renderizar <input> no lugar do texto
// 3. Ao pressionar Enter ou blur → PATCH /api/leads/{id} com o novo valor
// 4. setEditingCell(null)
// 5. mutateLeads() para revalidar
```

**UX:** O input deve ter o mesmo tamanho da célula. Usar `autoFocus`. Escapar cancela edição.

### 2. LeadsTable: Ordenação visual clara

**Arquivo:** `client/components/table/LeadsTable.tsx`

**Verificar:** Se já existe ordenação por coluna (header clicável).

**Melhorar:**
- Setas visuais claras (↑↓) no header da coluna ativa
- Persistir estado de ordenação em `localStorage` para manter entre sessões
- Ordenação padrão: `date_added desc` (mais recentes primeiro)

### 3. LeadsTable: Ações rápidas na row

**Arquivo:** `client/components/table/LeadsTable.tsx`

Adicionar coluna de ações rápidas no final de cada row:

```tsx
<TableCell className="flex gap-1">
  {/* WhatsApp: abre wa.me com o telefone */}
  <Button size="icon" variant="ghost" onClick={() => {
    const phone = lead.phone?.replace(/\D/g, '');
    if (phone) window.open(`https://wa.me/55${phone}`, '_blank');
  }}>
    <MessageCircle className="h-4 w-4" />
  </Button>

  {/* Marcar contato hoje */}
  <Button size="icon" variant="ghost" onClick={() => {
    updateLead(lead.id, { last_contact_date: new Date().toISOString() });
  }}>
    <Phone className="h-4 w-4" />
  </Button>

  {/* Mudar status rápido (dropdown) */}
  <Select onValueChange={(status) => updateLead(lead.id, { status })}>
    <SelectTrigger className="w-24">
      <SelectValue placeholder={lead.status} />
    </SelectTrigger>
    <SelectContent>
      {stages.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
    </SelectContent>
  </Select>
</TableCell>
```

### 4. KanbanCard: Simplificar informação

**Arquivo:** `client/components/kanban/KanbanCard.tsx`

**Informação essencial no card (manter):**
1. Nome da empresa (`trade_name` ou `company_name`)
2. Telefone (clicável → WhatsApp)
3. Badge do responsável (avatar/iniciais)
4. Estrela (favorito)

**Informação secundária (esconder ou reduzir):**
- Score/XP
- Data de adição
- Fonte (source)
- CNPJ
- Cidade/UF

**Implementação:** Reduzir o card para mostrar apenas o essencial. Se o usuário quiser mais detalhes, clica para abrir o LeadSheet.

```tsx
// Card simplificado:
<div className="p-2 rounded border hover:shadow-sm cursor-grab">
  <div className="flex items-center justify-between">
    <span className="font-medium text-sm truncate">{lead.trade_name || lead.company_name}</span>
    <StarButton isStarred={lead.is_starred} onClick={...} />
  </div>
  <div className="flex items-center gap-2 mt-1">
    <a href={`https://wa.me/55${lead.phone?.replace(/\D/g, '')}`} target="_blank"
       className="text-xs text-muted-foreground hover:text-green-500">
      {lead.phone || 'Sem telefone'}
    </a>
    <OwnerBadge ownerId={lead.owner_id} />
  </div>
</div>
```

### 5. LeadSheet: Reorganizar tabs

**Arquivo:** `client/components/lead/LeadSheet.tsx`

**Ordem atual das tabs:** (verificar no código)
**Ordem ideal:**
1. **Contato** — Telefone, WhatsApp, email, decisor (o que mais se usa no dia-a-dia)
2. **Status** — Estágio, reunião, follow-up, contrato
3. **Detalhes** — CNPJ, razão social, cidade, fonte, notas
4. **Timeline** — Histórico de interações

**Ação:** Reorganizar a ordem das tabs e garantir que a tab "Contato" seja a padrão ao abrir.

### 6. ImportWizard: Simplificar para 2-3 etapas

**Arquivo:** `client/components/import/ImportWizard.tsx`

**Etapas atuais (5):**
1. UPLOAD — Upload CSV ou colar texto
2. MAPPING — Mapear colunas
3. TEXT_REVIEW — Análise AI
4. IMPORTING — Progress
5. SUCCESS — Resumo

**Etapas simplificadas (3):**
1. **UPLOAD** — Upload CSV ou colar texto (manter)
2. **REVIEW** — Ver leads detectados + selecionar quais importar (combinar MAPPING + TEXT_REVIEW)
3. **DONE** — Resumo rápido (combinar IMPORTING + SUCCESS)

**Implementação:**
- Manter o código das 5 etapas internamente
- Mas na UI, agrupar visualmente em 3 passos
- Auto-detectar mapeamento de colunas (se CSV tem headers padrão como "empresa", "telefone", "cnpj")
- Se auto-detect funcionar, pular MAPPING automaticamente

### 7. Hierarquia visual

**Em todos os componentes (LeadsTable, KanbanCard, LeadSheet):**

Garantir que a hierarquia visual seja:
1. **Nome** — `font-medium`, `text-sm` ou `text-base`
2. **Telefone** — `text-sm`, cor de link (clicável para WhatsApp)
3. **Status** — Badge colorido pequeno
4. **Responsável** — Avatar/iniciais discreto

**Informação secundária** (CNPJ, fonte, data, score) deve ser `text-xs text-muted-foreground`.

---

## Critério de Conclusão

- [ ] LeadsTable: edição inline funciona para company_name, phone, status, owner
- [ ] LeadsTable: botão WhatsApp abre `wa.me` com o telefone correto
- [ ] LeadsTable: mudar status diretamente na row sem abrir modal
- [ ] KanbanCard: mostra apenas nome, telefone, responsável, estrela
- [ ] LeadSheet: tab "Contato" é a primeira e padrão
- [ ] ImportWizard: fluxo visual de 3 etapas (upload → review → done)
- [ ] Hierarquia visual: nome > telefone > status > resto
