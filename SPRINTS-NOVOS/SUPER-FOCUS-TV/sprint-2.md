# Sprint 2 — Motor de Cadência (CadenceService + APIs)

**Status:** ⏳ Pendente
**Objetivo:** Lógica que define as tarefas do dia por usuário + APIs de foco e WhatsApp.
**Depende de:** Sprint 1

---

## Contexto

O CadenceService é o coração do Modo Foco. Ele lê as regras da tabela `cadence_rules` e determina quais leads o usuário deve contatar hoje, priorizando por urgência.

**Regras de prioridade:**
1. Reunião confirmada (priority=4) — mais urgente
2. Atrasados há 2+ dias (priority calculado dinamicamente)
3. Fluxo normal (priority=2)

**Auto-Snooze:** Se o próximo contato cai em sábado/domingo → adiar para segunda-feira.

**Template:** O `message_template` da regra tem `{company}` e `{contact}` como placeholders.

---

## Arquivos

| Arquivo | Ação |
|---------|------|
| `client/lib/services/cadence-service.ts` | CRIAR |
| `client/app/api/focus/tasks/route.ts` | CRIAR |
| `client/app/api/focus/actions/route.ts` | CRIAR |
| `client/app/api/whatsapp/generate/route.ts` | CRIAR |

---

## Ações Detalhadas

### 1. Criar `CadenceService`

**Arquivo:** `client/lib/services/cadence-service.ts`

```typescript
import { prisma } from '@/lib/prisma';

export type CadenceTask = {
  lead_id: string;
  lead: {
    id: string;
    company_name: string | null;
    trade_name: string | null;
    phone: string | null;
    decision_maker: string | null;
    status: string;
    last_contact_date: Date | null;
    cadence_step: number;
    owner_id: string | null;
  };
  rule: {
    id: string;
    name: string;
    condition: string;
    priority: number;
    message_template: string | null;
    max_attempts: number;
    days_delay: number;
  };
  days_overdue: number;       // Quantos dias está atrasado (0 = hoje, 1+ = atrasado)
  message: string;            // Template com {company} e {contact} substituídos
  whatsapp_url: string;       // URL pronta para abrir
};

export class CadenceService {
  static async getTasksForUser(userId: string): Promise<CadenceTask[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Carregar regras ativas
    const rules = await prisma.cadence_rules.findMany({
      where: { is_active: true },
      orderBy: { priority: 'desc' },
    });

    // 2. Buscar leads do usuário (owner ou colaborador) que não estão pausados e não excederam o limite
    const leads = await prisma.leads.findMany({
      where: {
        deletedAt: null,
        cadence_paused: false,
        OR: [
          { owner_id: userId },
          { collaborators: { some: { user_id: userId } } },
        ],
        status: { in: rules.map(r => r.trigger_status) },
      },
      select: {
        id: true,
        company_name: true,
        trade_name: true,
        phone: true,
        decision_maker: true,
        status: true,
        last_contact_date: true,
        cadence_step: true,
        owner_id: true,
      },
    });

    const tasks: CadenceTask[] = [];

    for (const lead of leads) {
      // 3. Encontrar regra para o status do lead
      const rule = rules.find(r => r.trigger_status === lead.status);
      if (!rule) continue;

      // 4. Verificar se excedeu o limite de tentativas
      if (lead.cadence_step >= rule.max_attempts) continue;

      // 5. Calcular data do próximo contato
      const baseDate = lead.last_contact_date
        ? new Date(lead.last_contact_date)
        : new Date(0); // Se nunca houve contato, está atrasado desde sempre

      const nextContactDate = new Date(baseDate);
      nextContactDate.setDate(nextContactDate.getDate() + rule.days_delay);

      // 6. Auto-snooze fim de semana
      const dayOfWeek = nextContactDate.getDay();
      if (dayOfWeek === 6) nextContactDate.setDate(nextContactDate.getDate() + 2); // sab → seg
      if (dayOfWeek === 0) nextContactDate.setDate(nextContactDate.getDate() + 1); // dom → seg

      // 7. Verificar se é hoje ou está atrasado
      nextContactDate.setHours(0, 0, 0, 0);
      if (nextContactDate > today) continue; // Ainda não é hora

      const days_overdue = Math.floor((today.getTime() - nextContactDate.getTime()) / (1000 * 60 * 60 * 24));

      // 8. Construir mensagem com placeholders substituídos
      const companyName = lead.trade_name || lead.company_name || 'empresa';
      const contactName = lead.decision_maker || '';
      const message = (rule.message_template || 'Olá {company}!')
        .replace(/{company}/g, companyName)
        .replace(/{contact}/g, contactName);

      // 9. Construir URL do WhatsApp
      const phone = lead.phone?.replace(/\D/g, '');
      const formattedPhone = phone && phone.length >= 10
        ? (phone.startsWith('55') ? phone : `55${phone}`)
        : null;
      const whatsapp_url = formattedPhone
        ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`
        : '';

      tasks.push({ lead_id: lead.id, lead, rule, days_overdue, message, whatsapp_url });
    }

    // 10. Ordenar: priority desc, days_overdue desc
    tasks.sort((a, b) => {
      if (b.rule.priority !== a.rule.priority) return b.rule.priority - a.rule.priority;
      return b.days_overdue - a.days_overdue;
    });

    return tasks;
  }

  // Projeção para TaskHorizon (próximos N dias)
  static async getProjection(userId: string, days: number = 3): Promise<Record<string, number>> {
    // Retorna { "2026-03-11": 5, "2026-03-12": 3, "2026-03-13": 8 }
    const projection: Record<string, number> = {};
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      // Simplificado: contar leads que terão contato nessa data
      // Implementação completa roda a lógica de cadência para datas futuras
      projection[dateStr] = 0; // placeholder — implementar a lógica de projeção
    }
    return projection;
  }

  static async markDone(leadId: string, userId: string): Promise<void> {
    await prisma.leads.update({
      where: { id: leadId },
      data: {
        cadence_step: { increment: 1 },
        last_contact_date: new Date(),
      },
    });
    await prisma.interactions.create({
      data: {
        id: crypto.randomUUID(),
        lead_id: leadId,
        type: 'CONTACT_WHATSAPP',
        content: 'Contato via Modo Foco (WhatsApp)',
        user_id: userId,
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  static async snooze(leadId: string, daysToSnooze: number = 1): Promise<void> {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + daysToSnooze);
    await prisma.leads.update({
      where: { id: leadId },
      data: { last_contact_date: snoozeDate },
    });
  }

  static async skip(leadId: string): Promise<void> {
    await prisma.leads.update({
      where: { id: leadId },
      data: { cadence_paused: true },
    });
  }
}
```

### 2. Criar `GET /api/focus/tasks`

**Arquivo:** `client/app/api/focus/tasks/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UserService } from '@/lib/services/user-service';
import { CadenceService } from '@/lib/services/cadence-service';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await UserService.getOrCreateUser(user);
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const tasks = await CadenceService.getTasksForUser(dbUser.id);
  const projection = await CadenceService.getProjection(dbUser.id, 3);

  // Stats do dia
  const completedToday = await prisma.interactions.count({
    where: {
      user_id: dbUser.id,
      type: 'CONTACT_WHATSAPP',
      date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
  });

  return NextResponse.json({
    tasks,
    stats: {
      total: tasks.length,
      pending: tasks.length,
      completed_today: completedToday,
    },
    projection,
  });
}
```

### 3. Criar `POST /api/focus/actions`

**Arquivo:** `client/app/api/focus/actions/route.ts`

```typescript
// Body: { leadId: string, action: 'done' | 'snooze' | 'skip', days?: number }

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await UserService.getOrCreateUser(user);
  const { leadId, action, days } = await req.json();

  if (!leadId || !action) {
    return NextResponse.json({ error: 'leadId and action are required' }, { status: 400 });
  }

  switch (action) {
    case 'done':
      await CadenceService.markDone(leadId, dbUser.id);
      break;
    case 'snooze':
      await CadenceService.snooze(leadId, days || 1);
      break;
    case 'skip':
      await CadenceService.skip(leadId);
      break;
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

### 4. Criar `POST /api/whatsapp/generate`

**Arquivo:** `client/app/api/whatsapp/generate/route.ts`

Porta a lógica de `WPP DIRECIONADOR/app.js` (funções `formatNumber` e `extractSmartData`).

```typescript
// Body: { leadId?: string, rawText?: string, template?: string }
// Se leadId → busca lead no banco e usa o template da regra de cadência
// Se rawText → extrai empresa/telefone do texto colado (modo prospecting)

export async function POST(req: NextRequest) {
  const { leadId, rawText, template } = await req.json();

  let phone = '';
  let companyName = '';
  let message = '';

  if (leadId) {
    // Modo CRM: buscar lead
    const lead = await prisma.leads.findUnique({
      where: { id: leadId },
      select: { phone: true, trade_name: true, company_name: true, decision_maker: true }
    });
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    phone = lead.phone || '';
    companyName = lead.trade_name || lead.company_name || '';
    message = (template || 'Opa {company}, tudo bem? Sou do comercial 🏗️')
      .replace(/{company}/g, companyName)
      .replace(/{contact}/g, lead.decision_maker || '');
  } else if (rawText) {
    // Modo standalone: extrair do texto colado (porta lógica do WPP DIRECIONADOR/app.js)
    const extracted = extractSmartData(rawText);
    phone = extracted.phone;
    companyName = extracted.companyName;
    message = (template || 'Opa {company}, tudo bem? Sou do comercial 🏗️')
      .replace(/{company}/g, companyName);
  }

  // Formatar número
  const formatted = formatNumber(phone);
  const url = formatted
    ? `https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(message)}`
    : null;

  return NextResponse.json({ phone: formatted, company: companyName, message, url });
}

// Copiar exatamente de WPP DIRECIONADOR/app.js:
function formatNumber(rawNumber: string): string { /* ... */ }
function extractSmartData(text: string): { phone: string; companyName: string } { /* ... */ }
```

**IMPORTANTE:** As funções `formatNumber` e `extractSmartData` devem ser copiadas EXATAMENTE do arquivo `WPP DIRECIONADOR/app.js` — não reescrever. Ler o arquivo source antes.

---

## Critério de Conclusão

- [ ] `CadenceService.getTasksForUser(userId)` retorna lista correta (testar com curl ou script)
- [ ] `GET /api/focus/tasks` retorna 200 com tasks, stats e projection
- [ ] `POST /api/focus/actions` com `action: 'done'` incrementa `cadence_step` e cria interaction
- [ ] `POST /api/focus/actions` com `action: 'snooze'` atualiza `last_contact_date`
- [ ] `POST /api/focus/actions` com `action: 'skip'` seta `cadence_paused: true`
- [ ] `POST /api/whatsapp/generate` com `leadId` retorna URL com mensagem pré-preenchida
- [ ] `POST /api/whatsapp/generate` com `rawText` extrai telefone e empresa corretamente
- [ ] Auto-snooze: lead com próximo contato em sábado é adiado para segunda

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
