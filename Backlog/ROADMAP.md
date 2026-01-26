# 🗺️ Dashformance - Roadmap Consolidado

> **Atualizado:** 23/01/2026  
> **Objetivo:** Visão macro de todas as sprints e entregas planejadas

---

## 📊 Status Geral

| Sprint | Nome | Status | Prioridade |
|--------|------|--------|------------|
| Sprint 1 | Refatoração do Sistema de Login | 🔴 Pendente | Alta |
| Sprint 2 | Upload de Tabelas + IA | 🔴 Pendente | Alta |
| Sprint 3 | Refatoração UI/UX + Design System | 🔴 Pendente | Alta |
| Sprint 4 | Dashboard de Performance (TV) | 🔴 Pendente | Média |
| Sprint 5 | Refatoração do Kanban | 🔴 Pendente | Alta |
| Sprint 6 | Limpeza de Recursos Legados | ✅ Concluída | Baixa |

---

## 🎯 Sprints Detalhadas

### Sprint 1: Sistema de Autenticação
**Objetivo:** Implementar login real com sessão de usuário

**Usuários Iniciais:**
- João Vitor
- Nitz  
- Bruno

**Escopo:**
- Tela de login completa
- Autenticação via Supabase Auth
- Persistência de sessão
- Associação de leads ao usuário logado
- Remover seletor de usuário temporário

[📄 Ver Detalhes](./Sprints/SPRINT-01-AUTENTICACAO.md)

---

### Sprint 2: Upload de Tabelas + IA
**Objetivo:** Permitir importação de dados via tabelas com organização inteligente

**Escopo:**
- Interface de upload (drag & drop)
- Parsing de formatos (CSV, Excel)
- Processamento com IA para mapeamento automático
- Preview e confirmação antes de importar
- Inserção nos kanbans corretos

[📄 Ver Detalhes](./Sprints/SPRINT-02-UPLOAD-TABELAS.md)

---

### Sprint 3: Refatoração UI/UX
**Objetivo:** Redesign completo do sistema visual

**Escopo:**
- Novo Design System documentado
- Refatoração de todos os componentes
- Padronização de cores, tipografia, espaçamentos
- Animações e micro-interações
- Responsividade completa

[📄 Ver Detalhes](./Sprints/SPRINT-03-UIUX-DESIGNSYSTEM.md)

---

### Sprint 4: Dashboard de Performance (TV)
**Objetivo:** Painel para TV com métricas motivacionais em tempo real

**Escopo:**
- Layout otimizado para TV
- Métricas por usuário
- Gamificação (ranking, pontos)
- Auto-refresh
- Modo fullscreen

[📄 Ver Detalhes](./Sprints/SPRINT-04-DASHBOARD-TV.md)

---

### Sprint 5: Refatoração do Kanban
**Objetivo:** Corrigir bugs e melhorar estabilidade do Kanban

**Escopo:**
- Correção de bugs de drag-and-drop
- Performance optimization
- Sincronização de estado
- Manter layout atual dos cards

[📄 Ver Detalhes](./Sprints/SPRINT-05-KANBAN-REFACTOR.md)

---

### Sprint 6: Limpeza de Recursos
**Objetivo:** Remover features não utilizadas

**Itens a Remover:**
- [ ] Funcionalidade "Dividir Leads" (será repensada)
- [ ] Outros recursos obsoletos

[📄 Ver Detalhes](./Sprints/SPRINT-06-CLEANUP.md)

---

## 📈 Backlog Geral (Não Priorizado)

### Integrações
- [ ] WhatsApp Business API
- [ ] Calendly/Google Calendar
- [ ] Mailchimp/SendGrid

### UX Avançado
- [ ] Templates de mensagem
- [ ] Automação de follow-ups
- [ ] Bulk edit inline na tabela

### Performance
- [ ] React Query/SWR para cache
- [ ] Virtualização de listas
- [ ] Lazy loading

### Código & Arquitetura
- [ ] Refatorar `page.tsx` (1900+ linhas)
- [ ] Server components
- [ ] Testes automatizados
- [ ] Error boundaries

---

## 📋 Legado da Documentação Anterior

Os seguintes itens já foram implementados (referência `DOCUMENTACAO_SISTEMA.md`):

- ✅ Round 1: Múltiplos Contatos
- ✅ Round 2: Visualização em Tabela
- ✅ Round 3: Refatoração Kanban (primeira versão)
- ✅ Round 4: Score Visual & Favoritos
- ✅ Round 7: Histórico Automático
- ✅ Funil de Vendas Dividido
- ✅ Métricas Customizáveis
- ✅ Colunas Dinâmicas
