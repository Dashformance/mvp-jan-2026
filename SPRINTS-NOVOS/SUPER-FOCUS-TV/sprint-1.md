# Sprint 1 — Schema & Multi-Colaborador

**Status:** ⏳ Pendente
**Objetivo:** Preparar banco para cadências e múltiplos donos. Zero breaking changes.
**Depende de:** Nenhum

---

## Contexto

O banco atual tem `leads.owner_id` como único responsável por lead. Precisamos:
1. Adicionar motor de cadência (tabela de regras + campos nos leads)
2. Adicionar suporte a múltiplos colaboradores por lead sem quebrar o sistema atual

**Regra de ouro:** `owner_id` continua sendo o dono principal. `LeadCollaborator` é adição, não substituição.

---

## Arquivos

| Arquivo | Ação |
|---------|------|
| `client/prisma/schema.prisma` | MODIFICAR — 3 adições |
| `client/lib/services/leads-service.ts` | MODIFICAR — findAll() |

---

## Ações Detalhadas

### 1. Ler o schema atual

**OBRIGATÓRIO:** Ler `client/prisma/schema.prisma` antes de qualquer edição.

### 2. Adicionar modelo `cadence_rules`

Adicionar após o modelo `stages`:

```prisma
model cadence_rules {
  id               String   @id @default(cuid())
  name             String   // "Prospecção sem resposta", "Interesse em reunião", etc.
  trigger_status   String   // Status do lead que ativa: "ATTEMPTED", "CONTACTED", "MEETING"
  condition        String   // "no_reply" | "replied_silent" | "meeting_interest" | "meeting_confirmed"
  days_delay       Int      @default(1)   // Dias entre contatos
  max_attempts     Int      @default(3)   // Limite de tentativas
  priority         Int      @default(1)   // 1=baixa, 2=media, 3=alta, 4=urgente
  message_template String?  // Template de mensagem. Ex: "Opa {company}, tudo bem?"
  is_active        Boolean  @default(true)
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  @@index([trigger_status])
  @@index([is_active])
}
```

### 3. Adicionar campos em `leads`

Dentro do modelo `leads`, adicionar:

```prisma
  // Cadência
  cadence_step   Int     @default(0)    // Passo atual na sequência (0 = início)
  cadence_paused Boolean @default(false) // Pausado manualmente via Skip

  // Relação com colaboradores
  collaborators  LeadCollaborator[]
```

### 4. Adicionar modelo `LeadCollaborator`

```prisma
model LeadCollaborator {
  id        String   @id @default(cuid())
  lead_id   String
  user_id   String
  added_by  String   // user_id de quem adicionou o colaborador
  added_at  DateTime @default(now())

  lead      leads    @relation(fields: [lead_id], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([lead_id, user_id])   // Um usuário não pode ser colaborador do mesmo lead 2x
  @@index([user_id])
  @@index([lead_id])
}
```

### 5. Adicionar relação inversa no modelo `User`

No modelo `User`, adicionar:

```prisma
  collaborations LeadCollaborator[]
```

### 6. Executar migração

```bash
cd client
npx prisma migrate dev --name "add-cadence-and-collaborators"
```

**Se falhar:** Ler o erro completo. Verificar se há conflito de nome ou tipo. NÃO repetir o mesmo comando.

### 7. Seed das regras de cadência padrão

Criar `client/prisma/seed-cadence.ts` (ou adicionar em seed existente):

```typescript
const rules = [
  {
    name: 'Prospecção sem resposta',
    trigger_status: 'ATTEMPTED',
    condition: 'no_reply',
    days_delay: 1,
    max_attempts: 3,
    priority: 2,
    message_template: 'Opa {company}, tudo bem? Sou do comercial da construtora, queria entender melhor o seu projeto 🏗️',
  },
  {
    name: 'Contato silenciou',
    trigger_status: 'CONTACTED',
    condition: 'replied_silent',
    days_delay: 1,
    max_attempts: 5,
    priority: 2,
    message_template: 'Oi {company}! Passando pra ver se ainda faz sentido conversar sobre o projeto 👋',
  },
  {
    name: 'Interesse em reunião',
    trigger_status: 'CONTACTED',
    condition: 'meeting_interest',
    days_delay: 1,
    max_attempts: 7,
    priority: 3,
    message_template: 'Boa tarde {company}! Já consegui ver um horário disponível pra nós. Quando seria melhor pra você? 📅',
  },
  {
    name: 'Reunião confirmada',
    trigger_status: 'MEETING',
    condition: 'meeting_confirmed',
    days_delay: 1,
    max_attempts: 10,
    priority: 4,
    message_template: 'Olá {company}! Só lembrando da nossa reunião. Confirma presença? 🤝',
  },
];

for (const rule of rules) {
  await prisma.cadence_rules.upsert({
    where: { name: rule.name }, // precisa de @@unique([name]) ou usar create
    update: {},
    create: { id: crypto.randomUUID(), ...rule, updated_at: new Date() },
  });
}
```

**Executar:** `npx tsx prisma/seed-cadence.ts` ou incluir no seed principal.

### 8. Atualizar `LeadsService.findAll()`

**Arquivo:** `client/lib/services/leads-service.ts`

Adicionar suporte ao filtro `collaboratorId` (para buscar leads onde o usuário é colaborador):

```typescript
async findAll(page = 1, limit = 50, filters?: {
  ownerId?: string;
  collaboratorId?: string; // NOVO
  view?: 'mine' | 'collaborations' | 'all'; // NOVO valor 'collaborations'
  // ... demais filtros existentes
}) {
  const AND: any[] = [{ deletedAt: null }];

  if (filters?.view === 'mine') {
    AND.push({ owner_id: filters.ownerId });
  } else if (filters?.view === 'collaborations') {
    // Leads onde o usuário é colaborador (mas não dono)
    AND.push({
      collaborators: { some: { user_id: filters.collaboratorId || filters.ownerId } }
    });
  } else if (filters?.ownerId) {
    // Comportamento legado: filtrar por owner
    AND.push({ owner_id: filters.ownerId });
  }
  // se view === 'all' → sem filtro de owner

  const leads = await prisma.leads.findMany({
    where: { AND },
    include: {
      collaborators: {
        include: { user: { select: { id: true, name: true, avatar_url: true } } }
      }
    },
    // ... rest of query
  });
}
```

**IMPORTANTE:** Ler o método `findAll()` completo antes de editar. Adicionar o `include` de collaborators sem remover os includes existentes.

---

## Critério de Conclusão

- [ ] `npx prisma migrate dev` executa sem erros
- [ ] Tabela `cadence_rules` existe no banco com 4 regras seed
- [ ] Modelo `leads` tem campos `cadence_step` e `cadence_paused`
- [ ] Tabela `LeadCollaborator` existe com índices e relações corretas
- [ ] `LeadsService.findAll()` aceita `view: 'collaborations'` e retorna leads corretos
- [ ] `include: { collaborators: { include: { user: ... } } }` retorna dados de colaboradores

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
