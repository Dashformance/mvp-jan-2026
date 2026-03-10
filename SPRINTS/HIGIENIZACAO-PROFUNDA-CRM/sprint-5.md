# Sprint 5 — Visão Gerencial + Relatórios

**Status:** ⏳ Pendente
**Objetivo:** Clareza diária/semanal para gestão + exportação de dados.
**Depende de:** Sprint 4 (métricas consistentes)

---

## Contexto do Problema

João e Vitor não conseguem ter clareza sobre a performance diária/semanal sem mergulhar nos dados manualmente. Também não conseguem exportar a base de leads para análise externa. As bibliotecas `papaparse` e `xlsx` já estão instaladas, mas sem interface.

O `dashboard/page.tsx` tem 53.5KB — é um monólito que precisa ser quebrado em componentes.

---

## Arquivos Críticos

| Arquivo | Linhas/Tamanho | O que faz |
|---------|----------------|-----------|
| `client/app/dashboard/page.tsx` | 53.5KB | Dashboard monolítico. Precisa refatorar |
| `client/app/(protected)/super-dash/page.tsx` | 483 linhas | SuperDash admin. Já tem DateFilterToggle |
| `client/app/api/leads/stats/` | 6 endpoints | Performance, funnel, timeline, regions, etc. |
| `client/app/war-room/page.tsx` | ~100 linhas | War Room com dados mock |
| **NOVO:** `client/app/api/leads/export/route.ts` | — | Endpoint de exportação CSV/Excel |

---

## Ações Detalhadas

### 1. Dashboard diário (KPIs do dia)

**Arquivo:** `client/app/(protected)/super-dash/page.tsx` (ou novo componente)

Adicionar seção "Resumo do Dia" no topo do SuperDash (ou como view padrão quando período = "Hoje"):

```tsx
// KPIs do dia (cards horizontais):
const dailyKPIs = [
  { label: 'Leads Adicionados', value: stats.leadsAddedToday, icon: UserPlus },
  { label: 'Contatos Feitos', value: stats.contactsToday, icon: Phone },
  { label: 'Reuniões Agendadas', value: stats.meetingsToday, icon: Calendar },
  { label: 'Vendas', value: stats.salesToday, icon: DollarSign },
];

// Renderizar como cards horizontais com comparação com ontem:
<div className="grid grid-cols-4 gap-4">
  {dailyKPIs.map(kpi => (
    <Card key={kpi.label}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <kpi.icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{kpi.label}</span>
        </div>
        <div className="text-2xl font-bold mt-1">{kpi.value}</div>
      </CardContent>
    </Card>
  ))}
</div>
```

### 2. Dashboard semanal (comparativo)

Adicionar comparativo "Esta Semana vs Semana Passada":

```tsx
// Dados necessários da API:
// - stats.thisWeek: { leads, contacts, meetings, sales, revenue }
// - stats.lastWeek: { leads, contacts, meetings, sales, revenue }

// Calcular tendência:
const trend = (current: number, previous: number) => {
  if (previous === 0) return { pct: 0, direction: 'neutral' };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { pct, direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral' };
};

// Exibir com seta e cor:
// ↑ 25% (verde) ou ↓ 10% (vermelho) ou → 0% (cinza)
```

**API:** O endpoint `GET /api/super-dash/stats` já suporta `minDate/maxDate`. Basta chamar 2x:
1. Com datas desta semana
2. Com datas da semana passada

Ou adicionar um parâmetro `compareWithPrevious=true` que retorna ambos os períodos.

### 3. Export CSV

**Criar:** `client/app/api/leads/export/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { LeadsService } from '@/lib/services/leads-service';

export async function GET(req: NextRequest) {
  // 1. Auth check
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Parse filters from query params (mesmos do /api/leads)
  const searchParams = req.nextUrl.searchParams;
  const format = searchParams.get('format') || 'csv'; // 'csv' ou 'xlsx'
  const status = searchParams.get('status')?.split(',');
  const ownerId = searchParams.get('ownerId');

  // 3. Buscar TODOS os leads (sem paginação)
  const { data: leads } = await LeadsService.findAll(1, 10000, {
    status,
    ownerId,
    // outros filtros...
  });

  // 4. Mapear para formato exportável
  const exportData = leads.map(lead => ({
    'Empresa': lead.trade_name || lead.company_name || '',
    'CNPJ': lead.cnpj || '',
    'Telefone': lead.phone || '',
    'Email': lead.email || '',
    'Decisor': lead.decision_maker || '',
    'Status': lead.status || '',
    'Responsável': lead.owner || '',
    'Cidade': lead.city || '',
    'UF': lead.uf || '',
    'Valor Contrato': lead.contract_value || 0,
    'Score': lead.score || 0,
    'Fonte': lead.source || '',
    'Data Adição': lead.date_added?.toISOString().split('T')[0] || '',
    'Último Contato': lead.last_contact_date?.toISOString().split('T')[0] || '',
    'Notas': lead.notes || '',
  }));

  if (format === 'csv') {
    // 5a. Gerar CSV
    const csv = Papa.unparse(exportData);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  // 5b. Para xlsx, usar a lib xlsx
  // import XLSX from 'xlsx';
  // const worksheet = XLSX.utils.json_to_sheet(exportData);
  // const workbook = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  // const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  // return new NextResponse(buffer, { headers: { 'Content-Type': '...', 'Content-Disposition': '...' } });
}
```

### 4. Export Excel (xlsx)

Mesmo endpoint acima, com `format=xlsx`. Usar a lib `xlsx` já instalada.

### 5. Botão de export na UI

**Arquivo:** `client/components/kanban/KanbanView.tsx` (ou FilterBar)

Adicionar botão "Exportar" na barra de ferramentas:

```tsx
<Button variant="outline" size="sm" onClick={handleExport}>
  <Download className="h-4 w-4 mr-1" />
  Exportar
</Button>

// handleExport:
const handleExport = async () => {
  // Construir URL com os mesmos filtros ativos
  const params = new URLSearchParams();
  params.set('format', 'csv'); // ou 'xlsx'
  if (filterBarState.status?.length) params.set('status', filterBarState.status.join(','));
  if (filterBarState.view === 'mine') params.set('ownerId', profile.id);

  // Download
  const res = await fetch(`/api/leads/export?${params}`);
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

**Também adicionar no SuperDash** para exportar métricas.

### 6. Refatorar dashboard/page.tsx

**Arquivo:** `client/app/dashboard/page.tsx` (53.5KB)

**Esse arquivo é grande demais.** Quebrar em componentes:

```
client/app/dashboard/
├── page.tsx              ← Orquestrador (importa componentes)
├── components/
│   ├── FunnelChart.tsx    ← Gráfico de funil
│   ├── LeadOverview.tsx   ← Cards de overview
│   ├── ActivityTimeline.tsx ← Timeline de atividades
│   ├── PerformanceTable.tsx ← Tabela de performance por owner
│   ├── RegionMap.tsx       ← Mapa de distribuição regional
│   └── UpcomingActions.tsx  ← Próximos follow-ups e reuniões
```

**Abordagem:**
1. Ler o arquivo inteiro
2. Identificar blocos lógicos (cada seção do dashboard)
3. Extrair cada bloco para seu próprio componente
4. O `page.tsx` final deve ter ~50-100 linhas (importações + layout grid)

### 7. War Room: Conectar dados reais

**Arquivo:** `client/app/war-room/page.tsx`

**Verificar:** Se está usando dados mock ou dados reais da API.

**Se mock:** Substituir por chamadas à API existente:
- `GET /api/super-dash/stats` para métricas
- `GET /api/leads/stats/performance` para performance individual
- `GET /api/leads/stats/timeline` para atividade recente

---

## Critério de Conclusão

- [ ] Resumo diário visível no SuperDash com 4 KPIs (leads, contatos, reuniões, vendas)
- [ ] Comparativo semanal (esta semana vs anterior) com tendências visuais
- [ ] Export CSV funciona: botão baixa arquivo com todos os leads filtrados
- [ ] Export Excel funciona: mesmo que CSV mas em formato .xlsx
- [ ] `dashboard/page.tsx` refatorado de 53.5KB para ~5KB (componentes extraídos)
- [ ] War Room conectado com dados reais (não mock)
