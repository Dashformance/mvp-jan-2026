# Sprint 1 — Integridade de Dados (Fundação)

**Status:** ⏳ Pendente
**Objetivo:** Garantir que NENHUM lead suma. Zero tolerância.
**Depende de:** Nenhum (é a fundação)

---

## Contexto do Problema

O CRM tem 2 campos de ownership no modelo `leads`:
- `owner` (String?) — campo LEGADO. Armazena nome como string ("joão", "vitor", "bruno")
- `owner_id` (String?) — campo ATUAL. UUID referenciando a tabela `User`

**Bug principal:** Leads com `owner = 'vitor'` mas `owner_id = NULL` ficam INVISÍVEIS porque todas as queries filtram por `owner_id`. O lead existe no banco, mas ninguém consegue vê-lo na interface.

**IDs dos usuários:**
- João: `21d216a4-e8c9-464d-b486-0b4db827f5ba`
- Vitor: `0eabdccd-e490-4e2c-a862-7f61fa576906`
- Bruno (inativo): `0184fc53-a696-4ed6-b5e4-2391fd21b902`

---

## Arquivos Críticos

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| `client/lib/services/leads-service.ts` | 693 | CRUD principal de leads. Métodos: `create()`, `findAll()`, `update()`, `remove()`, `restore()`, `mergeLeads()`, `deduplicate()` |
| `client/app/api/leads/route.ts` | ~70 | GET (lista com filtros) e POST (criar lead). Aplica `{ deletedAt: null }` e filtro por `owner_id` |
| `client/app/api/leads/[id]/route.ts` | ~80 | PATCH (atualizar), DELETE (soft delete), GET (lead individual) |
| `client/prisma/schema.prisma` | ~100 | Schema do banco. Modelo `leads` com ambos `owner` e `owner_id` |

---

## Ações Detalhadas

### 1. Diagnóstico do banco de dados

Criar script `client/scripts/diagnose-ownership.ts` que execute:

```sql
-- Leads com owner mas sem owner_id (INVISÍVEIS)
SELECT id, company_name, owner, owner_id, status, date_added
FROM leads
WHERE owner IS NOT NULL AND owner_id IS NULL AND "deletedAt" IS NULL;

-- Leads sem nenhum dono (ÓRFÃOS)
SELECT id, company_name, owner, owner_id, status, date_added
FROM leads
WHERE owner IS NULL AND owner_id IS NULL AND "deletedAt" IS NULL;

-- Contagem por situação
SELECT
  CASE
    WHEN owner_id IS NOT NULL THEN 'OK (tem owner_id)'
    WHEN owner IS NOT NULL AND owner_id IS NULL THEN 'INVISÍVEL (owner sem owner_id)'
    WHEN owner IS NULL AND owner_id IS NULL THEN 'ÓRFÃO (sem dono)'
  END as situacao,
  COUNT(*) as total
FROM leads
WHERE "deletedAt" IS NULL
GROUP BY situacao;
```

**Saída esperada:** Lista de leads problemáticos e contagem por categoria.

### 2. Migração de leads órfãos

Criar script `client/scripts/fix-ownership.ts` que execute:

```typescript
// Mapear owner string → owner_id UUID
const OWNER_MAP: Record<string, string> = {
  'joão': '21d216a4-e8c9-464d-b486-0b4db827f5ba',
  'joao': '21d216a4-e8c9-464d-b486-0b4db827f5ba',
  'vitor': '0eabdccd-e490-4e2c-a862-7f61fa576906',
  'bruno': '0184fc53-a696-4ed6-b5e4-2391fd21b902',
};

// Para cada lead com owner mas sem owner_id:
// 1. Buscar o owner_id correto no mapa
// 2. Atualizar o lead com owner_id
// 3. Logar a alteração na tabela interactions (tipo: 'OWNERSHIP_FIX')
```

**IMPORTANTE:** Rodar em dry-run primeiro (só logar, sem alterar). Depois rodar de verdade.

### 3. Fortalecer `LeadsService.update()`

**Arquivo:** `client/lib/services/leads-service.ts` — método `update()` (~linha 374)

**Regra:** NUNCA permitir que `owner_id` seja setado como `null` se já tem valor.

```typescript
// ANTES da atualização no banco:
if (currentLead.owner_id) {
  // Se o payload não traz owner_id OU traz null/undefined → preservar o atual
  if (!sanitizedData.owner_id) {
    sanitizedData.owner_id = currentLead.owner_id;
  }
  // Se traz owner_id diferente → permitir (é transferência intencional)
  // MAS logar a mudança como interação de auditoria
  if (sanitizedData.owner_id !== currentLead.owner_id) {
    await prisma.interactions.create({
      data: {
        id: crypto.randomUUID(),
        lead_id: id,
        type: 'OWNERSHIP_TRANSFER',
        content: `Owner changed from ${currentLead.owner_id} to ${sanitizedData.owner_id}`,
        user_id: sanitizedData.owner_id,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });
  }
}
```

**Verificar:** Este código já existe parcialmente (~linhas 387-391). Garantir que está robusto e inclui log de auditoria.

### 4. Fortalecer `LeadsService.createMany()` (bulk import)

**Arquivo:** `client/lib/services/leads-service.ts` — método `createMany()` (~linha 81)

**Problema atual:** O upsert pode sobrescrever `owner_id` existente.

```typescript
// No upsert, separar create e update data:
return prisma.leads.upsert({
  where: { cnpj: lead.cnpj },
  create: {
    ...data,
    owner_id: data.owner_id || userId,  // Novo lead → atribuir ao importador
  },
  update: {
    ...data,
    // NUNCA sobrescrever owner_id no update se já existe
    // Remover owner_id do objeto de update
    owner_id: undefined,  // Prisma ignora undefined
    deletedAt: null,  // Restaurar se estava deletado
  }
});
```

**Alternativa:** Antes do upsert, verificar se o lead já existe. Se sim, não incluir `owner_id` no update.

### 5. Validação na API `PATCH /api/leads/[id]`

**Arquivo:** `client/app/api/leads/[id]/route.ts`

Adicionar validação no handler PATCH:

```typescript
// Se o body tenta setar owner_id como null ou string vazia → rejeitar
if (body.owner_id === null || body.owner_id === '') {
  return NextResponse.json(
    { error: 'owner_id cannot be cleared. Use a valid UUID to transfer ownership.' },
    { status: 400 }
  );
}
```

### 6. Revisar `mergeLeads()` e `deduplicate()`

**Arquivo:** `client/lib/services/leads-service.ts` — métodos `mergeLeads()` (~linha 563) e `deduplicate()`

**Verificar:**
- O lead "master" (que sobrevive ao merge) deve preservar seu `owner_id`
- Os leads duplicados que são soft-deleted devem ter log de interação tipo `MERGE_DELETED`
- Se o lead master não tem `owner_id` mas um duplicado tem → herdar o `owner_id` do duplicado

### 7. Log de auditoria para owner_id

Toda operação que altere `owner_id` deve criar uma `interaction`:

```typescript
{
  type: 'OWNERSHIP_TRANSFER' | 'OWNERSHIP_FIX' | 'OWNERSHIP_IMPORT',
  content: `De: ${oldOwnerId || 'nenhum'} → Para: ${newOwnerId}`,
  lead_id: leadId,
  user_id: quem fez a alteração,
}
```

---

## Critério de Conclusão

- [ ] Query `SELECT count(*) FROM leads WHERE owner IS NOT NULL AND owner_id IS NULL` retorna **0**
- [ ] `LeadsService.update()` nunca permite `owner_id = null` se já tinha valor
- [ ] `LeadsService.createMany()` nunca sobrescreve `owner_id` existente
- [ ] API PATCH rejeita tentativa de limpar `owner_id`
- [ ] Merge preserva ownership do lead master
- [ ] Toda mudança de ownership é logada em `interactions`
