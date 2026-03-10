# Sprint 5 — WPP Integrado + Página Prospecting

**Status:** ⏳ Pendente
**Objetivo:** Mensagem pré-preenchida em todos os pontos de contato + prospecção standalone + convidar colaborador.
**Depende de:** Sprint 2

---

## Contexto

Três entregas neste sprint:
1. **KanbanCard** — botão WhatsApp abre com mensagem pré-preenchida + avatares de colaboradores
2. **LeadSheet** — botão WhatsApp no header + botão "Convidar Colaborador"
3. **Página /prospecting** — colar dados brutos → preview → enviar WPP → salvar como lead opcional

---

## Arquivos

| Arquivo | Ação |
|---------|------|
| `client/components/kanban/KanbanCard.tsx` | MODIFICAR |
| `client/components/lead/LeadSheet.tsx` | MODIFICAR |
| `client/app/(protected)/prospecting/page.tsx` | CRIAR |

---

## Ações Detalhadas

### 1. KanbanCard — WhatsApp com mensagem pré-preenchida

**OBRIGATÓRIO:** Ler `client/components/kanban/KanbanCard.tsx` antes de editar.

**Localizar:** A função `handleWhatsApp` (ou equivalente) que já abre WPP.

**Modificar:** Em vez de `https://wa.me/{phone}`, usar `https://api.whatsapp.com/send?phone={phone}&text={message}` (suporta parâmetro de texto).

```typescript
const handleWhatsApp = () => {
  const phone = lead.phone?.replace(/\D/g, '');
  if (!phone) {
    toast.error('Lead sem telefone cadastrado');
    return;
  }
  const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;
  const companyName = lead.trade_name || lead.company_name || 'empresa';
  const message = `Opa ${companyName}, tudo bem? Sou do comercial 🏗️`;
  const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
```

**Onde colocar essa função:** Substituir a função existente de WhatsApp, ou adicionar caso não exista.

### 2. KanbanCard — Avatares de colaboradores

**No JSX do KanbanCard**, adicionar grupo de avatares se o lead tiver colaboradores:

```tsx
{/* Colaboradores — exibir apenas se houver */}
{lead.collaborators && lead.collaborators.length > 0 && (
  <div className="flex -space-x-2">
    {lead.collaborators.slice(0, 3).map((c: any) => (
      <div
        key={c.user.id}
        className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-800
                   flex items-center justify-center text-xs font-bold text-zinc-300"
        title={c.user.name}
      >
        {c.user.name.charAt(0).toUpperCase()}
      </div>
    ))}
    {lead.collaborators.length > 3 && (
      <div className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-800
                      flex items-center justify-center text-xs text-zinc-500">
        +{lead.collaborators.length - 3}
      </div>
    )}
  </div>
)}
```

**Verificar:** Se a query de leads já inclui `collaborators` (foi adicionado no Sprint 1). Se não, confirmar que o include está no `LeadsService.findAll()`.

### 3. LeadSheet — Botão WhatsApp no header

**OBRIGATÓRIO:** Ler `client/components/lead/LeadSheet.tsx` antes de editar.

**Localizar:** O header/title da sheet. Adicionar botão verde "WhatsApp" ao lado do título ou na barra de ações.

```tsx
{/* No header da LeadSheet, ao lado dos outros botões */}
<Button
  variant="default"
  size="sm"
  className="bg-green-600 hover:bg-green-500 text-white"
  onClick={() => {
    const phone = lead?.phone?.replace(/\D/g, '');
    if (!phone) { toast.error('Lead sem telefone'); return; }
    const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;
    const companyName = lead?.trade_name || lead?.company_name || 'empresa';
    const message = `Opa ${companyName}, tudo bem? Sou do comercial 🏗️`;
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }}
>
  <span>WhatsApp</span>
</Button>
```

### 4. LeadSheet — Botão "Convidar Colaborador"

**Localizar:** Uma tab de "Detalhes" ou footer da sheet. Adicionar seção de colaboradores.

```tsx
{/* Seção de colaboradores na LeadSheet */}
<div className="flex flex-col gap-3">
  <h4 className="text-sm font-medium text-zinc-400">Colaboradores</h4>

  {/* Lista de colaboradores atuais */}
  {lead?.collaborators?.map((c: any) => (
    <div key={c.user.id} className="flex items-center gap-2 text-sm">
      <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
        {c.user.name.charAt(0)}
      </div>
      <span className="text-zinc-300">{c.user.name}</span>
      <span className="text-zinc-600 text-xs">co-responsável</span>
    </div>
  ))}

  {/* Botão convidar */}
  <Select onValueChange={handleInviteCollaborator}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="+ Convidar colaborador" />
    </SelectTrigger>
    <SelectContent>
      {availableUsers
        .filter(u => u.id !== lead?.owner_id) // não convidar o próprio dono
        .filter(u => !lead?.collaborators?.some((c: any) => c.user.id === u.id)) // não duplicar
        .map(u => (
          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
        ))
      }
    </SelectContent>
  </Select>
</div>
```

**Função `handleInviteCollaborator`:**
```typescript
const handleInviteCollaborator = async (userId: string) => {
  await fetch('/api/leads/{id}/collaborators', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  // Revalidar lead
  mutateLeads();
  toast.success('Colaborador adicionado');
};
```

**Criar endpoint:** `client/app/api/leads/[id]/collaborators/route.ts`

```typescript
// POST: adicionar colaborador
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await req.json();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const dbUser = await UserService.getOrCreateUser(user);

  await prisma.leadCollaborator.create({
    data: {
      id: crypto.randomUUID(),
      lead_id: params.id,
      user_id: userId,
      added_by: dbUser.id,
    },
  });
  return NextResponse.json({ success: true });
}

// DELETE: remover colaborador
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await req.json();
  await prisma.leadCollaborator.deleteMany({
    where: { lead_id: params.id, user_id: userId },
  });
  return NextResponse.json({ success: true });
}
```

### 5. Criar página `/prospecting`

**Arquivo:** `client/app/(protected)/prospecting/page.tsx`

```tsx
'use client';
import { useState } from 'react';

export default function ProspectingPage() {
  const [rawText, setRawText] = useState('');
  const [preview, setPreview] = useState<{ phone: string; company: string; message: string; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [todayHistory, setTodayHistory] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    const res = await fetch('/api/whatsapp/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });
    const data = await res.json();
    setPreview(data);
    setLoading(false);
  };

  const handleSend = () => {
    if (preview?.url) window.open(preview.url, '_blank');
    // Adicionar ao histórico do dia
    setTodayHistory(prev => [{ ...preview, sentAt: new Date() }, ...prev]);
    setPreview(null);
    setRawText('');
  };

  const handleSaveAsLead = async () => {
    if (!preview) return;
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: preview.company,
        phone: preview.phone,
        status: 'ATTEMPTED',
        source: 'prospecting',
      }),
    });
    toast.success(`${preview.company} salvo como lead (ATTEMPTED)`);
    handleSend();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-black text-white">Prospectar</h1>
      <p className="text-zinc-500 text-sm">
        Cole os dados do prospect abaixo. O sistema detecta o telefone e nome automaticamente.
      </p>

      {/* Textarea */}
      <textarea
        value={rawText}
        onChange={e => setRawText(e.target.value)}
        placeholder={"Construtora ABC\n(11) 99999-1234\nJoão Silva - Diretor"}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white
                   text-sm font-mono h-32 resize-none focus:outline-none focus:border-zinc-500"
      />

      <button
        onClick={handleGenerate}
        disabled={loading || !rawText.trim()}
        className="bg-green-600 hover:bg-green-500 text-white font-medium px-6 py-3
                   rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? 'Gerando...' : 'Gerar Mensagem'}
      </button>

      {/* Preview */}
      {preview && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-zinc-500">Empresa</span>
              <p className="text-white font-medium">{preview.company}</p>
            </div>
            <div>
              <span className="text-zinc-500">Telefone</span>
              <p className="text-white font-medium">+{preview.phone}</p>
            </div>
          </div>
          <div>
            <span className="text-zinc-500 text-sm">Mensagem</span>
            <p className="text-zinc-300 italic text-sm mt-1 border-l-2 border-zinc-700 pl-3">
              "{preview.message}"
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSend}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-2 rounded-lg transition-colors">
              Enviar WhatsApp
            </button>
            <button onClick={handleSaveAsLead}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 rounded-lg transition-colors">
              Salvar como Lead
            </button>
          </div>
        </div>
      )}

      {/* Histórico do dia */}
      {todayHistory.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-500 mb-3">Enviados hoje</h3>
          {todayHistory.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-zinc-800 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-white">{item.company}</span>
              <span className="text-zinc-600 ml-auto">{item.phone}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Critério de Conclusão

- [ ] KanbanCard: WhatsApp abre `api.whatsapp.com/send` com mensagem pré-preenchida
- [ ] KanbanCard: avatares de colaboradores visíveis no card (se houver)
- [ ] LeadSheet: botão verde "WhatsApp" no header abre com mensagem
- [ ] LeadSheet: dropdown "Convidar Colaborador" adiciona co-responsável sem alterar `owner_id`
- [ ] `/prospecting`: colar texto → clicar "Gerar" → ver preview → enviar WPP
- [ ] `/prospecting`: "Salvar como Lead" cria lead com status ATTEMPTED
- [ ] Histórico do dia na página prospecting

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
