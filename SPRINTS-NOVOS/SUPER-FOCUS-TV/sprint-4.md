# Sprint 4 — Modo Foco (Página + Task Horizon)

**Status:** ⏳ Pendente
**Objetivo:** Interface de execução de tarefas diárias com visão semanal de carga.
**Depende de:** Sprint 2

---

## Contexto

O Modo Foco é a tela de trabalho do vendedor no dia a dia. Ele abre `/focus` e vê exatamente o que precisa fazer: lista de leads para contatar hoje, em ordem de prioridade. Um clique no botão WhatsApp abre a conversa com mensagem pré-preenchida e marca o contato como feito automaticamente.

O **Task Horizon** é uma visão compacta no topo: mostra o que foi feito ontem, o progresso de hoje, e uma prévia dos próximos 3 dias.

**Acessível a todos os usuários** (não só admin).

---

## Arquivos

| Arquivo | Ação |
|---------|------|
| `client/app/(protected)/focus/page.tsx` | CRIAR |
| `client/components/focus/TaskCard.tsx` | CRIAR |
| `client/components/focus/TaskHorizon.tsx` | CRIAR |
| `client/components/focus/ProgressRing.tsx` | CRIAR |

---

## Layout Alvo

```
┌────────────────────────────────────────────┐
│ Foco do Dia                                │
│                                            │
│ ┌─────────────────────────────────────────┐│
│ │ TASK HORIZON                            ││
│ │  Ontem ✓7  │  [◯ 8/15]  │  Seg:5 Ter:3 ││
│ └─────────────────────────────────────────┘│
│                                            │
│ ┌─────────────────────────────────────────┐│
│ │ Empresa X — João Silva — 3 dias sem ct. ││
│ │ "Opa Empresa X, tudo bem? Sou do..."    ││
│ │ [WhatsApp ✓]  [Done]  [Snooze]  [Skip] ││
│ └─────────────────────────────────────────┘│
│                                            │
│ ┌─────────────────────────────────────────┐│
│ │ Empresa Y — ...                         ││
│ │ [WhatsApp ✓]  [Done]  [Snooze]  [Skip] ││
│ └─────────────────────────────────────────┘│
└────────────────────────────────────────────┘
```

---

## Ações Detalhadas

### 1. Criar `ProgressRing.tsx`

**Arquivo:** `client/components/focus/ProgressRing.tsx`

SVG ring simples. Cor gold `#F59E0B`.

```tsx
interface ProgressRingProps {
  completed: number;
  total: number;
  size?: number;      // px, default 80
}

export function ProgressRing({ completed, total, size = 80 }: ProgressRingProps) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));
  const radius = (size / 2) - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#27272a" strokeWidth="6" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="#F59E0B" strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-black text-white">{completed}</span>
        <span className="text-xs text-zinc-500">/{total}</span>
      </div>
    </div>
  );
}
```

### 2. Criar `TaskHorizon.tsx`

**Arquivo:** `client/components/focus/TaskHorizon.tsx`

```tsx
interface TaskHorizonProps {
  completedYesterday: number;
  completed: number;
  total: number;
  projection: Record<string, number>; // { "2026-03-11": 5, ... }
}

export function TaskHorizon({ completedYesterday, completed, total, projection }: TaskHorizonProps) {
  const projectionEntries = Object.entries(projection).slice(0, 3);

  return (
    <div className="flex items-center gap-6 bg-zinc-950 rounded-xl p-4 border border-zinc-800">
      {/* Ontem */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-zinc-500 uppercase tracking-wide">Ontem</span>
        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold text-green-400">{completedYesterday}</span>
          <span className="text-green-400 text-lg">✓</span>
        </div>
      </div>

      <div className="w-px h-10 bg-zinc-800" />

      {/* Hoje */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-zinc-500 uppercase tracking-wide">Hoje</span>
        <ProgressRing completed={completed} total={total} size={72} />
      </div>

      <div className="w-px h-10 bg-zinc-800" />

      {/* Próximos dias */}
      <div className="flex items-center gap-4">
        {projectionEntries.map(([dateStr, count]) => {
          const date = new Date(dateStr);
          const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
          return (
            <div key={dateStr} className="flex flex-col items-center gap-1">
              <span className="text-xs text-zinc-500 capitalize">{dayName}</span>
              <span className={`text-xl font-bold ${count > 10 ? 'text-red-400' : 'text-zinc-300'}`}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 3. Criar `TaskCard.tsx`

**Arquivo:** `client/components/focus/TaskCard.tsx`

```tsx
interface TaskCardProps {
  task: CadenceTask;
  onDone: (leadId: string) => Promise<void>;
  onSnooze: (leadId: string) => Promise<void>;
  onSkip: (leadId: string) => Promise<void>;
}

export function TaskCard({ task, onDone, onSnooze, onSkip }: TaskCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleWhatsApp = async () => {
    // 1. Abrir WhatsApp com mensagem pré-preenchida
    if (task.whatsapp_url) {
      window.open(task.whatsapp_url, '_blank');
    }
    // 2. Auto-marcar como Done após abrir
    await handleAction('done');
  };

  const handleAction = async (action: 'done' | 'snooze' | 'skip') => {
    setLoading(action);
    try {
      if (action === 'done') await onDone(task.lead_id);
      else if (action === 'snooze') await onSnooze(task.lead_id);
      else if (action === 'skip') await onSkip(task.lead_id);
    } finally {
      setLoading(null);
    }
  };

  const companyName = task.lead.trade_name || task.lead.company_name || 'Empresa';
  const overdueText = task.days_overdue === 0
    ? 'Hoje'
    : `${task.days_overdue} dia${task.days_overdue > 1 ? 's' : ''} atrasado`;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3
                    hover:border-zinc-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-white text-lg leading-tight">{companyName}</h3>
          {task.lead.decision_maker && (
            <p className="text-zinc-400 text-sm">{task.lead.decision_maker}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            task.days_overdue > 0
              ? 'bg-red-950 text-red-400'
              : 'bg-amber-950 text-amber-400'
          }`}>
            {overdueText}
          </span>
          <span className="text-xs text-zinc-600">{task.rule.name}</span>
        </div>
      </div>

      {/* Mensagem preview */}
      {task.message && (
        <p className="text-zinc-500 text-sm italic border-l-2 border-zinc-700 pl-3">
          "{task.message}"
        </p>
      )}

      {/* Ações */}
      <div className="flex gap-2">
        <button
          onClick={handleWhatsApp}
          disabled={!!loading || !task.whatsapp_url}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white
                     text-sm font-medium px-4 py-2 rounded-lg transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center"
        >
          <span>WhatsApp</span>
          <span>✓</span>
        </button>

        <button
          onClick={() => handleAction('done')}
          disabled={!!loading}
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-3 py-2 rounded-lg transition-colors"
        >
          Done
        </button>

        <button
          onClick={() => handleAction('snooze')}
          disabled={!!loading}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm px-3 py-2 rounded-lg transition-colors"
        >
          Snooze
        </button>

        <button
          onClick={() => handleAction('skip')}
          disabled={!!loading}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-600 text-sm px-3 py-2 rounded-lg transition-colors"
          title="Pausar cadência deste lead"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
```

### 4. Criar `focus/page.tsx`

**Arquivo:** `client/app/(protected)/focus/page.tsx`

```tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { TaskCard } from '@/components/focus/TaskCard';
import { TaskHorizon } from '@/components/focus/TaskHorizon';

export default function FocusPage() {
  const { profile } = useAuth();
  const [data, setData] = useState<FocusData | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/focus/tasks');
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const callAction = async (leadId: string, action: string, days?: number) => {
    await fetch('/api/focus/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, action, days }),
    });
    // Remover da lista local imediatamente (optimistic)
    setRemovedIds(prev => new Set([...prev, leadId]));
  };

  const visibleTasks = data?.tasks.filter(t => !removedIds.has(t.lead_id)) ?? [];
  const completed = (data?.stats.completed_today ?? 0) + removedIds.size;
  const total = (data?.stats.total ?? 0);

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Foco do Dia</h1>
        <span className="text-zinc-500 text-sm">{visibleTasks.length} restantes</span>
      </div>

      {data && (
        <TaskHorizon
          completedYesterday={0} // TODO: buscar da API
          completed={completed}
          total={total}
          projection={data.projection}
        />
      )}

      {visibleTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
          <span className="text-5xl mb-4">🎯</span>
          <p className="text-lg font-medium">Tudo em dia!</p>
          <p className="text-sm">Sem tarefas pendentes para hoje.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleTasks.map(task => (
            <TaskCard
              key={task.lead_id}
              task={task}
              onDone={(id) => callAction(id, 'done')}
              onSnooze={(id) => callAction(id, 'snooze', 1)}
              onSkip={(id) => callAction(id, 'skip')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Critério de Conclusão

- [ ] `/focus` abre sem erro para usuário logado
- [ ] Exibe leads pendentes do usuário (owner + colaborações)
- [ ] TaskHorizon exibe ProgressRing com ratio correto
- [ ] TaskHorizon exibe projeção dos próximos 3 dias
- [ ] Botão WhatsApp abre `api.whatsapp.com/send` com mensagem e remove card da lista
- [ ] Botão Done: remove card, incrementa ProgressRing
- [ ] Botão Snooze: remove card (volta amanhã)
- [ ] Botão Skip: remove card (cadência pausada)
- [ ] Estado vazio exibe mensagem "Tudo em dia!"

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
