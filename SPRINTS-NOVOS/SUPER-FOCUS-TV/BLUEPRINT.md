# Blueprint: Focus Mode & Multi-Collaborator Architecture

Este documento detalha o funcionamento técnico das novas funcionalidades solicitadas para garantir clareza no "COMO" será implementado.

## 1. Task Horizon (Visão Semanal de Carga)

O objetivo é dar contexto temporal ao vendedor. Não será um calendário cheio, mas uma "linha de horizonte".

### Componente: `TaskHorizon.tsx`
- **Ontem**: Busca no log de interações (`interactions`) o que foi concluído pelo `userId`. Exibe um badge de "Check" com o total.
- **Hoje**: Mostra o `ProgressRing` centralizado com o ratio de Tarefas de Cadência (ex: 8/15).
- **Próximos 3 Dias**: O motor de cadência fará uma projeção:
  - `SELECT count(*) FROM leads WHERE status IN (rules) AND last_contact + delay = [data_futura]`
  - Isso permite ao usuário ver se a "quarta-feira" estará sobrecarregada, decidindo se deve adiantar ou adiar leads de hoje.

## 2. Motor de Cadência Dinâmico

O motor não será apenas um script, mas um **Service** que roda sob demanda ou via Cron.

### Lógica de Seleção (`cadence-service.ts`)
1. **Priorização**: 
   - 1º: Reunião Confirmada (Follow-up de lembrete).
   - 2º: Atâr atrasados (leads que o delay já passou de 2 dias).
   - 3º: Fluxo normal.
2. **Auto-Snooze**: Se um lead entra em "Final de Semana", o motor automaticamente projeta para Segunda-feira.
3. **Template Matcher**: O motor injeta os campos do lead (nome, empresa) no `message_template` da regra para que o botão de WhatsApp já abra com o texto 100% pronto.

## 3. Lead Multi-Colaborador

Para permitir que o usuário "continue a ação de outro", mudamos a estrutura de posse única para posse compartilhada.

### Estrutura de Dados
```prisma
model LeadCollaborator {
  lead_id   String
  user_id   String
  added_by  String // Quem deu o acesso
  added_at  DateTime @default(now())
}
```

### UX de Transição
- No `KanbanCard`, se o lead tiver colaboradores, aparecerão pequenos avatares no canto.
- No `LeadSheet`, haverá um botão "Convidar para este Lead".
- **Filtros**: O usuário terá uma opção "Meus Leads + Colaborações" para ver tudo o que ele tem permissão de interagir.

## 4. SuperDash TV Auto-Refresh

- Utilizaremos um `refreshInterval: 30000` (SWR) ou um `setInterval` simples no componente de página.
- O layout será baseado em **CSS Grid de 12 colunas** fixo para evitar scroll em TVs.
- **Modo Dark Puro**: Fundo `#000000` com accents em gold/neon-green para máximo contraste e estética premium.
