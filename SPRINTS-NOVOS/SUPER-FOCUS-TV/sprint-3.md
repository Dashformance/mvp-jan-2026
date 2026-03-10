# Sprint 3 — SuperDash TV (Rewrite Visual)

**Status:** ⏳ Pendente
**Objetivo:** Redesign total da dashboard para exibição em TV. 3 colunas, auto-refresh 30s, dark mode puro.
**Depende de:** Sprint 2

---

## Contexto

O SuperDash atual tem excesso de informação: gauges, sparklines, 6 KPIs, arena, streaks, quests. Para TV, menos é mais. A regra é: **se não cabe em 1080p sem scroll, está errado.**

**Layout alvo:**
```
┌─────────────────────────────────────────────────────────────────┐
│  SUPERDASH  ●AO VIVO  [LiveClock]                    [⛶ Fullscreen] │
├──────────────┬──────────────────────────┬────────────────────────┤
│  LEADERBOARD │   MÉTRICAS GRANDES       │  AGENDA DE HOJE        │
│              │   (grid 3x2)             │                        │
│  #1 João     │   47  |  12  |  3        │  14:00 - Empresa X     │
│  score: 143  │  leads|cont.|reun.       │  16:30 - Empresa Y     │
│              │                          │                        │
│  #2 Vitor    │   FEED AO VIVO           │  PENDÊNCIAS            │
│  score: 98   │   ─────────────          │  5 leads atrasados     │
│              │   João - lead movido     │  3 reuniões sem conf.  │
│              │   Vitor - WPP enviado    │                        │
└──────────────┴──────────────────────────┴────────────────────────┘
```

**Cores:**
- Fundo: `#000000`
- Accents: gold `#F59E0B`, neon-green `#22C55E`
- Texto primário: `#FFFFFF`
- Texto secundário: `#6B7280`

---

## Arquivos

| Arquivo | Ação |
|---------|------|
| `client/app/(protected)/super-dash/page.tsx` | REWRITE COMPLETO |
| `client/app/api/super-dash/tv/route.ts` | CRIAR |
| `client/components/super-dash/BigMetric.tsx` | CRIAR |
| `client/components/super-dash/ActivityFeed.tsx` | CRIAR |
| `client/components/super-dash/TodayAgenda.tsx` | CRIAR |
| `client/components/super-dash/OverdueList.tsx` | CRIAR |

**Mantidos sem modificação:** `LiveClock.tsx`, `PlayerCard.tsx` (versão compact), `LevelUpModal.tsx`

**Componentes que saem da página** (arquivos preservados, apenas não importados):
`AppleGauge`, `ActionTrendChart`, `DateFilterToggle`, `KPICard`, `Sparkline`

---

## Ações Detalhadas

### 1. Criar endpoint `GET /api/super-dash/tv`

**Arquivo:** `client/app/api/super-dash/tv/route.ts`

Endpoint otimizado para TV — retorna apenas o que o dashboard precisa, período fixo = hoje:

```typescript
export async function GET(req: NextRequest) {
  // Auth
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // 1. Leaderboard (todos os usuários, score do dia)
  const users = await prisma.user.findMany({
    where: { role: { not: 'admin' } }, // ou sem filtro se admin também aparece
    select: { id: true, name: true, avatar_url: true },
  });

  const leaderboard = await Promise.all(users.map(async (u) => {
    const contacts = await prisma.interactions.count({
      where: { user_id: u.id, type: 'CONTACT_WHATSAPP', date: { gte: today, lt: tomorrow } },
    });
    const meetings = await prisma.interactions.count({
      where: { user_id: u.id, type: { startsWith: 'MEETING' }, date: { gte: today, lt: tomorrow } },
    });
    const leadsAdded = await prisma.leads.count({
      where: { owner_id: u.id, date_added: { gte: today, lt: tomorrow }, deletedAt: null },
    });
    const score = contacts + (meetings * 5) + (leadsAdded * 2);
    return { ...u, contacts, meetings, leadsAdded, score };
  }));
  leaderboard.sort((a, b) => b.score - a.score);

  // 2. Métricas do time hoje
  const teamMetrics = {
    leadsAdded: await prisma.leads.count({
      where: { date_added: { gte: today, lt: tomorrow }, deletedAt: null },
    }),
    contacts: await prisma.interactions.count({
      where: { type: 'CONTACT_WHATSAPP', date: { gte: today, lt: tomorrow } },
    }),
    meetings: await prisma.leads.count({
      where: { status: 'MEETING', updated_at: { gte: today, lt: tomorrow }, deletedAt: null },
    }),
    sales: await prisma.leads.count({
      where: { status: { in: ['WON', 'SOLD'] }, updated_at: { gte: today, lt: tomorrow }, deletedAt: null },
    }),
    revenue: await prisma.leads.aggregate({
      where: { status: { in: ['WON', 'SOLD'] }, updated_at: { gte: today, lt: tomorrow }, deletedAt: null },
      _sum: { contract_value: true },
    }),
  };

  // 3. Activity Feed (últimas 20 interações do time)
  const feed = await prisma.interactions.findMany({
    where: { date: { gte: today }, leads: { deletedAt: null } },
    orderBy: { date: 'desc' },
    take: 20,
    select: {
      id: true, type: true, content: true, date: true, user_id: true,
      leads: { select: { trade_name: true, company_name: true } },
    },
  });

  // 4. Agenda de hoje (reuniões)
  const todayAgenda = await prisma.leads.findMany({
    where: {
      status: 'MEETING',
      deletedAt: null,
      next_followup_date: { gte: today, lt: tomorrow },
    },
    select: {
      id: true, trade_name: true, company_name: true,
      next_followup_date: true, owner_id: true,
    },
    orderBy: { next_followup_date: 'asc' },
  });

  // 5. Pendências (leads com follow-up atrasado)
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const overdue = await prisma.leads.count({
    where: {
      deletedAt: null,
      cadence_paused: false,
      next_followup_date: { lt: today },
      status: { notIn: ['WON', 'SOLD', 'LOST', 'DISQUALIFIED'] },
    },
  });

  return NextResponse.json({
    leaderboard,
    teamMetrics: { ...teamMetrics, revenue: teamMetrics.revenue._sum.contract_value || 0 },
    feed,
    todayAgenda,
    overdue,
    generatedAt: new Date().toISOString(),
  });
}
```

### 2. Criar `BigMetric.tsx`

**Arquivo:** `client/components/super-dash/BigMetric.tsx`

```tsx
interface BigMetricProps {
  label: string;
  value: number | string;
  unit?: string;       // ex: "R$"
  color?: 'gold' | 'green' | 'white';
}

export function BigMetric({ label, value, unit, color = 'white' }: BigMetricProps) {
  const colorClass = {
    gold: 'text-amber-400',
    green: 'text-green-400',
    white: 'text-white',
  }[color];

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-zinc-900 rounded-lg">
      <span className="text-xs uppercase tracking-widest text-zinc-500 mb-1">{label}</span>
      <span className={`text-5xl font-black tabular-nums ${colorClass}`}>
        {unit && <span className="text-2xl mr-1 font-normal">{unit}</span>}
        {value}
      </span>
    </div>
  );
}
```

### 3. Criar `ActivityFeed.tsx`

```tsx
// Lista de interações recentes do time
// Renderiza: [avatar] [nome] - [ação] - [X min atrás]
// Atualiza via prop (não faz fetch próprio)

export function ActivityFeed({ items }: { items: FeedItem[] }) {
  return (
    <div className="flex flex-col gap-1 overflow-hidden">
      {items.slice(0, 8).map(item => (
        <div key={item.id} className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="text-zinc-600 shrink-0">
            {formatRelativeTime(item.date)}
          </span>
          <span className="truncate">{formatFeedItem(item)}</span>
        </div>
      ))}
    </div>
  );
}
```

### 4. Criar `TodayAgenda.tsx`

```tsx
// Lista plana de reuniões do dia
// Renderiza: [horário] [empresa] [dono]
export function TodayAgenda({ items }: { items: AgendaItem[] }) {
  if (items.length === 0) {
    return <p className="text-zinc-600 text-sm">Sem reuniões hoje</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-3">
          <span className="text-amber-400 font-mono text-sm shrink-0">
            {formatTime(item.next_followup_date)}
          </span>
          <span className="text-white text-sm truncate">
            {item.trade_name || item.company_name}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### 5. Criar `OverdueList.tsx`

```tsx
// Exibe contador de pendências do time
export function OverdueList({ count }: { count: number }) {
  return (
    <div className={`rounded-lg p-4 ${count > 0 ? 'bg-red-950 border border-red-800' : 'bg-zinc-900'}`}>
      <span className="text-xs uppercase tracking-widest text-zinc-500">Pendências</span>
      <div className="flex items-baseline gap-2 mt-1">
        <span className={`text-4xl font-black ${count > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {count}
        </span>
        <span className="text-zinc-500 text-sm">leads atrasados</span>
      </div>
    </div>
  );
}
```

### 6. Reescrever `super-dash/page.tsx`

**IMPORTANTE:** Ler o arquivo atual ANTES de reescrever. Identificar:
- Como faz fetch de dados (SWR? useEffect?)
- Quais componentes são usados
- Auth pattern (usa `useAuth()`?)

**Estrutura do novo page.tsx:**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
// imports dos novos componentes...

const REFRESH_INTERVAL = 30_000; // 30 segundos

export default function SuperDashTVPage() {
  const { profile } = useAuth();
  const [data, setData] = useState<TVData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    const res = await fetch('/api/super-dash/tv');
    if (res.ok) {
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <LoadingState />;

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black tracking-tight">SUPERDASH</span>
          <span className="text-xs text-red-500 font-mono animate-pulse">● AO VIVO</span>
        </div>
        <LiveClock />
        <button onClick={() => document.documentElement.requestFullscreen()}>⛶</button>
      </header>

      {/* BODY: 3 colunas */}
      <main className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* LEFT: Leaderboard */}
        <div className="col-span-3 flex flex-col gap-3">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500">Ranking Hoje</h2>
          {data.leaderboard.map((user, i) => (
            <PlayerCardCompact key={user.id} user={user} rank={i + 1} />
          ))}
        </div>

        {/* CENTER: Métricas + Feed */}
        <div className="col-span-5 flex flex-col gap-4">
          <div className="grid grid-cols-3 grid-rows-2 gap-3">
            <BigMetric label="Leads" value={data.teamMetrics.leadsAdded} />
            <BigMetric label="Contatos" value={data.teamMetrics.contacts} color="green" />
            <BigMetric label="Reuniões" value={data.teamMetrics.meetings} color="gold" />
            <BigMetric label="Vendas" value={data.teamMetrics.sales} color="gold" />
            <BigMetric label="Receita" value={formatCurrency(data.teamMetrics.revenue)} unit="R$" color="green" />
            <BigMetric label="Meta %" value="—" />
          </div>
          <div className="flex-1 bg-zinc-950 rounded-lg p-3 overflow-hidden">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Feed ao Vivo</h3>
            <ActivityFeed items={data.feed} />
          </div>
        </div>

        {/* RIGHT: Agenda + Pendências */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="bg-zinc-950 rounded-lg p-4 flex-1">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Agenda de Hoje</h3>
            <TodayAgenda items={data.todayAgenda} />
          </div>
          <OverdueList count={data.overdue} />
        </div>
      </main>
    </div>
  );
}
```

---

## Critério de Conclusão

- [ ] `GET /api/super-dash/tv` retorna 200 com todos os campos
- [ ] SuperDash abre sem scroll horizontal ou vertical em 1080p
- [ ] Auto-refresh visível: `lastUpdate` no header atualiza a cada 30s
- [ ] Leaderboard exibe todos os usuários com score do dia
- [ ] Grid de métricas 3x2 com números grandes e legíveis
- [ ] Feed ao vivo lista últimas interações do time
- [ ] Agenda de hoje com horários das reuniões
- [ ] OverdueList mostra pendências com destaque vermelho se > 0
- [ ] Botão fullscreen funciona

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
