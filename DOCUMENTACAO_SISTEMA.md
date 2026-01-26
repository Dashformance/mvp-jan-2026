# Dashformance - Documentação Técnica Completa

> **Versão:** 0.1.0  
> **Última Atualização:** Janeiro 2026  
> **Objetivo:** Documentação para onboarding de desenvolvedores

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Arquitetura do Projeto](#arquitetura-do-projeto)
4. [Funcionalidades do Sistema](#funcionalidades-do-sistema)
5. [Modelo de Dados](#modelo-de-dados)
6. [Backend / API Routes](#backend--api-routes)
7. [Frontend / Componentes](#frontend--componentes)
8. [Design System](#design-system)
9. [Como Rodar o Projeto](#como-rodar-o-projeto)
10. [Melhorias Sugeridas](#melhorias-sugeridas)
11. [Status de Implementação & Roadmap](#status-de-implementação--roadmap)

---

## Visão Geral

**Dashformance** é um CRM de prospecção focado em gestão de leads B2B para o mercado brasileiro. O sistema permite:

- Extração automática de leads via API Casa dos Dados (CNPJ)
- Gestão visual via Kanban com drag-and-drop
- Pipeline de vendas completo (Lista Fria → Fechamento)
- Dashboard analítico com métricas de performance
- Sistema multi-usuário com divisão de leads entre vendedores

---

## Stack Tecnológica

### Core Framework
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Next.js** | 16.1.1 | Framework React full-stack com App Router |
| **React** | 19.2.3 | Biblioteca de UI |
| **TypeScript** | ^5 | Tipagem estática |

### Banco de Dados & ORM
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **PostgreSQL** | - | Banco de dados principal (hospedado Supabase) |
| **Prisma** | ^6.19.1 | ORM para acesso ao banco |
| **Supabase** | ^2.89.0 | Backend-as-a-Service (auth, DB hosting) |

### UI & Componentes
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Radix UI** | Vários | Componentes headless acessíveis |
| **TailwindCSS** | v4 | Framework CSS utility-first |
| **Lucide React** | ^0.562.0 | Ícones |
| **Recharts** | ^3.6.0 | Gráficos e visualizações |
| **DnD-Kit** | ^6.3.1 | Drag-and-drop nativo |
| **Sonner** | ^2.0.7 | Toast notifications |

### Integrações Externas
| Serviço | Uso |
|---------|-----|
| **Casa dos Dados API** | Extração de dados de empresas brasileiras (CNPJ) |
| **Vercel** | Deploy e hosting |

---

## Arquitetura do Projeto

```
DASHFORMANCE/
├── client/                      # Aplicação Next.js
│   ├── app/                     # App Router (Next.js 13+)
│   │   ├── api/                 # API Routes (Backend)
│   │   │   ├── leads/           # CRUD de leads
│   │   │   │   ├── batch/       # Operações em lote
│   │   │   │   ├── cleanup-duplicates/
│   │   │   │   ├── divide/      # Divisão de leads entre users
│   │   │   │   ├── stats/       # 6 endpoints de analytics
│   │   │   │   │   ├── funnel/
│   │   │   │   │   ├── geo/
│   │   │   │   │   ├── overview/
│   │   │   │   │   ├── performance/
│   │   │   │   │   ├── salesforce/
│   │   │   │   │   └── timeline/
│   │   │   │   └── trashed/
│   │   │   ├── extraction/      # Extração Casa dos Dados
│   │   │   └── stages/          # Configuração de estágios
│   │   ├── dashboard/           # Página de analytics
│   │   ├── login/               # Autenticação
│   │   ├── page.tsx             # Página principal (Kanban)
│   │   ├── layout.tsx           # Layout root
│   │   └── globals.css          # Estilos globais
│   ├── components/
│   │   ├── ui/                  # 18 componentes base (Radix)
│   │   ├── kanban/              # KanbanBoard, Column, Card
│   │   ├── lead/                # LeadSheet, QualificationForm
│   │   ├── layout/              # UserSelector
│   │   ├── dashboard/           # RegionDistribution
│   │   ├── ImportReviewDialog.tsx
│   │   └── TrashSheet.tsx
│   ├── lib/
│   │   ├── services/            # Lógica de negócio
│   │   │   ├── leads-service.ts
│   │   │   ├── extraction-service.ts
│   │   │   └── lead-sanitizer.ts
│   │   ├── prisma.ts            # Client Prisma singleton
│   │   └── supabase/            # Client Supabase
│   ├── prisma/
│   │   └── schema.prisma        # Schema do banco
│   └── public/                  # Assets estáticos
└── VISUALIZEN_DESIGN_SYSTEM_v3.1.md  # Design System docs
```

---

## Funcionalidades do Sistema

### 1. 📊 Kanban Board (Pipeline de Vendas)

**Arquivo Principal:** `app/page.tsx`

O sistema principal é um Kanban com 8 colunas de status:

| Coluna | ID | Descrição |
|--------|-----|-----------|
| ❄️ Lista Fria | `INBOX` | Leads recém-importados, não qualificados |
| ✅ Qualificado | `NEW` | Leads aprovados para prospecção |
| 📞 Tentativa | `ATTEMPTED` | Contato tentado, sem sucesso |
| 💬 Contatado | `CONTACTED` | Primeiro contato realizado |
| 📅 Reunião | `MEETING` | Reunião agendada |
| 💰 Fechamento | `WON` | Venda fechada com sucesso |
| 🔻 Perdido | `LOST` | Lead perdido |
| 🚫 Desqualificado | `DISQUALIFIED` | Lead removido do pipeline |

**Features:**
- Drag-and-drop entre colunas (DnD-Kit)
- Atualização de status em tempo real
- Contagem de leads por coluna
- Cards com informações resumidas

---

### 2. 🔍 Extração de Leads (Casa dos Dados)

**Arquivos:** `lib/services/extraction-service.ts`, `app/api/extraction/`

Sistema de busca avançada de empresas brasileiras via API Casa dos Dados.

**Parâmetros de Filtro Disponíveis:**

| Categoria | Filtros |
|-----------|---------|
| **Localização** | UF, Município, Bairro, CEP, DDD |
| **Atividade** | CNAE Principal, CNAE Secundário |
| **Porte** | Capital Social (min/max), Nº de funcionários |
| **Regime Tributário** | MEI, Simples Nacional |
| **Situação** | Ativa, Baixada, Suspensa, Inapta |
| **Tipo** | Matriz, Filial |
| **Contato** | Com email, Com telefone, Só fixo/celular |
| **Data** | Abertura desde/até |

**Fluxo de Importação:**
1. Usuário configura filtros na interface
2. Sistema busca na API Casa dos Dados
3. Leads são sanitizados (padronização de dados)
4. Modal de revisão permite seleção
5. Leads selecionados são salvos no banco
6. Duplicatas por CNPJ são automaticamente removidas

---

### 3. 📝 LeadSheet (Edição de Lead)

**Arquivo:** `components/lead/LeadSheet.tsx`

Modal lateral para visualização e edição completa de um lead.

**Campos disponíveis:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `company_name` | String | Razão Social |
| `trade_name` | String | Nome Fantasia |
| `cnpj` | String | CNPJ (único) |
| `phone` | String | Telefone |
| `email` | String | Email |
| `instagram_url` | String | Perfil Instagram |
| `website_url` | String | Site |
| `render_quality` | Enum | GOOD / MEDIUM / BAD |
| `decision_maker` | String | Nome do decisor |
| `uf` | String | Estado |
| `city` | String | Cidade |
| `notes` | Text | Observações |
| `owner` | String | Responsável (vendedor) |
| `source` | String | Fonte do lead |
| `score` | Int | Pontuação calculada |
| `status` | Enum | Estágio no pipeline |

**Funcionalidades:**
- Edição inline de todos os campos
- Botão de busca rápida no Google
- Formulário de qualificação integrado
- Histórico de contatos (notes)

---

### 4. 📈 Dashboard Analítico

**Arquivo:** `app/dashboard/page.tsx`

Painel com métricas de performance em tempo real.

**KPIs Principais:**
- Total de Leads
- Leads Ganhos (conversão %)
- Em Reunião
- Novos Hoje

**Visualizações:**

| Gráfico | Endpoint | Descrição |
|---------|----------|-----------|
| Leads por Dia | `/api/leads/stats/timeline` | AreaChart com tendência |
| Funil de Vendas | `/api/leads/stats/funnel` | Funnel com conversão por estágio |
| Distribuição por Status | `/api/leads/stats/funnel` | PieChart com % |
| Mapa por Região | `/api/leads/stats/geo` | Distribuição geográfica (UFs) |
| Performance por Vendedor | `/api/leads/stats/performance` | Comparativo entre owners |
| Força de Vendas | `/api/leads/stats/salesforce` | Placar diário/semanal/mensal |

**Sistema de Pontuação (Sales Force):**
- Contato realizado = 1 ponto
- Reunião agendada = 3 pontos
- Venda fechada = 10 pontos

---

### 5. 👥 Multi-Usuário

**Features:**
- Seletor de usuário (João / Vitor)
- Filtro por owner no Kanban
- Divisão automática de leads não atribuídos
- Performance comparativa no Dashboard

---

### 6. 🗑️ Lixeira (Soft Delete)

**Arquivos:** `components/TrashSheet.tsx`, `app/api/leads/trashed/`

Leads deletados vão para lixeira (soft delete via campo `deletedAt`).

**Funcionalidades:**
- Listagem de leads na lixeira
- Restauração individual ou em lote
- Exclusão permanente

---

### 7. 🔄 Operações em Lote

**Ações disponíveis:**
- Seleção múltipla de leads
- Alteração de status em massa
- Atribuição de owner em massa
- Deleção em massa
- Divisão equitativa entre vendedores
- Limpeza de duplicatas

---

## Modelo de Dados

### Prisma Schema

```prisma
model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  password_hash String
  created_at    DateTime @default(now())
}

model Segment {
  id          String   @id @default(uuid())
  name        String
  description String?
  created_at  DateTime @default(now())
  leads       Lead[]
}

model Lead {
  id                 String     @id @default(uuid())
  company_name       String?
  trade_name         String?
  cnpj               String?    @unique
  phone              String?
  email              String?
  decision_maker     String?
  extra_info         Json?
  segment_id         String?
  status             LeadStatus @default(NEW)
  priority           Int        @default(0)
  date_added         DateTime   @default(now())
  first_contact_date DateTime?
  last_contact_date  DateTime?
  next_followup_date DateTime?
  notes              String?
  owner              String?
  deletedAt          DateTime?    // Soft delete
  score              Int        @default(0)
  source             String?
  city               String?
  uf                 String?
  instagram_url      String?
  render_quality     String?
  website_url        String?
  segment            Segment?   @relation(...)
}

enum LeadStatus {
  NEW
  ATTEMPTED
  CONTACTED
  MEETING
  WON
  LOST
  DISQUALIFIED
  INBOX
  SCREENING
}
```

---

## Backend / API Routes

### Leads CRUD

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/leads` | Listar leads (paginado) |
| `POST` | `/api/leads` | Criar lead |
| `GET` | `/api/leads/[id]` | Buscar lead por ID |
| `PUT` | `/api/leads/[id]` | Atualizar lead |
| `DELETE` | `/api/leads/[id]` | Soft delete |

### Operações Especiais

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/leads/batch` | Operações em lote |
| `POST` | `/api/leads/cleanup-duplicates` | Remover duplicatas |
| `POST` | `/api/leads/divide` | Dividir leads entre owners |
| `GET` | `/api/leads/trashed` | Listar lixeira |
| `POST` | `/api/leads/[id]/restore` | Restaurar da lixeira |

### Estatísticas

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/leads/stats/overview` | KPIs gerais |
| `GET` | `/api/leads/stats/funnel` | Contagem por status |
| `GET` | `/api/leads/stats/timeline?days=30` | Leads por dia |
| `GET` | `/api/leads/stats/geo` | Distribuição por UF |
| `GET` | `/api/leads/stats/performance` | Por vendedor |
| `GET` | `/api/leads/stats/salesforce` | Placar gamificado |

### Extração

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/extraction` | Buscar/importar leads |

---

## Frontend / Componentes

### Componentes Base (ui/)

Componentes headless do Radix UI customizados:

- `accordion.tsx`
- `badge.tsx`
- `button.tsx`
- `card.tsx`
- `checkbox.tsx`
- `dialog.tsx`
- `dropdown-menu.tsx`
- `input.tsx`
- `label.tsx`
- `radio-group.tsx`
- `scroll-area.tsx`
- `select.tsx`
- `sheet.tsx`
- `slider.tsx`
- `sonner.tsx`
- `table.tsx`
- `tabs.tsx`
- `textarea.tsx`

### Componentes de Negócio

| Componente | Descrição |
|------------|-----------|
| `KanbanBoard` | Board principal com drag-and-drop |
| `KanbanColumn` | Coluna do Kanban |
| `KanbanCard` | Card de lead individual |
| `LeadSheet` | Modal de edição de lead |
| `QualificationForm` | Form de qualificação |
| `ImportReviewDialog` | Modal de revisão pré-import |
| `TrashSheet` | Painel de lixeira |
| `UserSelector` | Seletor de usuário |
| `RegionDistribution` | Mapa de distribuição |

---

## Design System

O projeto segue o **Visualizen Design System v3.1** com tema "Liquid Glass + Champagne".

### Cores Principais

```css
--bg-base: #181818;       /* Fundo principal */
--bg-elevated: #222222;   /* Cards e inputs */
--accent: #DECCA8;        /* Champagne (destaque) */
--text-primary: #FFFFFF;
--text-muted: #888888;
```

### Padrões de UI

- Fundo escuro (#0F0F0F a #1C1C1C)
- Bordas sutis (white/5 a white/10)
- Gradientes com cor champagne (#DECCA8)
- Glassmorphism em hovers
- Transições suaves

---

## Como Rodar o Projeto

### Requisitos
- Node.js 18+
- npm ou pnpm
- Conta Supabase (ou PostgreSQL local)

### Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd DASHFORMANCE/client

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com credenciais Supabase
```

### Variáveis de Ambiente

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
CASA_DADOS_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Rodar em Desenvolvimento

```bash
npm run dev
# Abrir http://localhost:3000
```

### Build de Produção

```bash
npm run build
npm start
```

### Prisma

```bash
# Gerar client após alterar schema
npx prisma generate

# Push para o banco
npx prisma db push

# Abrir Prisma Studio
npx prisma studio
```

---

## Melhorias Sugeridas

### Performance
- [ ] Implementar React Query ou SWR para cache de dados
- [ ] Virtualização de listas grandes (react-window)
- [ ] Otimizar rerenders do Kanban

### Funcionalidades
- [ ] Integração com WhatsApp Business API
- [ ] Automação de follow-ups
- [ ] Templates de email
- [ ] Histórico de atividades por lead
- [ ] Importação via CSV/Excel
- [ ] Notificações push

### Código
- [ ] Migrar page.tsx (1800+ linhas) para componentes menores
- [ ] Adicionar testes unitários (Jest/Vitest)
- [ ] Implementar error boundaries
- [ ] Adicionar loading skeletons

### Segurança
- [ ] Implementar autenticação completa (Supabase Auth)
- [ ] Row Level Security no Prisma
- [ ] Rate limiting na API

### DevOps
- [ ] CI/CD com GitHub Actions
- [ ] Monitoring com Sentry
- [ ] Analytics com Vercel Analytics (já instalado)

---

## Status de Implementação & Roadmap

### ✅ Implementado (Jan 2026)

#### Core & UI
- [x] **Round 1: Múltiplos Contatos:** Tabela `contacts` (1-N), migração de dados e UI de lista.
- [x] **Round 2: Visualização em Tabela:** Alternância entre Kanban/Lista, filtros avançados e ordenação.
- [x] **Round 3: Refatoração Kanban:** Scroll suave, colunas independentes e DnD otimizado.
- [x] **Round 4: Score Visual & Favoritos:** Bordas coloridas por score, glow effect e sistema de "estrelar" leads.
- [x] **Round 7: Histórico Automático:** Tabela `activities`, log automático de interações e timeline.

#### Features Específicas
- [x] **Funil de Vendas Dividido:** Gráfico "Butterfly" comparando performance entre vendedores (João vs Vitor).
- [x] **Métricas Customizáveis:** Seletor de métricas no gráfico de linha (Adicionados, Contatados, Agendados).
- [x] **Correções:** Ajuste de fuso horário em gráficos e logs automáticos (WhatsApp/Email).
- [x] **Colunas Dinâmicas:** Estágios persistidos no banco (`stages` table) e sincronizados na UI.
- [x] **Kanban Scroll Fix:** Scroll de página habilitado para visualizar muitos leads.

---

### 🚀 Roadmap - Próximos Passos

#### Round 5: Abas de Fases do Pipeline
- [ ] UI: Abas superiores no Kanban ([Todos] [Qualificação] [Vendas] [Pós-Venda])
- [ ] UI: Filtrar colunas visíveis por fase selecionada
- [ ] UI: Manter ordem das colunas ao trocar abas

#### Round 6: Kanban Editável (CRUD de Estágios)
- [ ] UI: Editar nome do estágio (duplo clique)
- [ ] UI: Botão de criar nova coluna
- [ ] UI: Menu de excluir estágio (com estratégia de migração de leads)
- [ ] UI: Drag-and-drop de colunas (reordenar)

#### Round 8: Login & Sessão de Usuário
- [ ] UI: Tela de Login (Avatar + PIN ou Email/Senha)
- [ ] State: Persistência de sessão segura (localStorage ou Supabase Auth)
- [ ] UI: Display de usuário no header e botão Logout
- [ ] Refactor: Remover seletor de usuário temporário (`UserSelector`)

#### Round 9: Notificações In-App
- [ ] DB: Tabela `notifications` (id, user_id, type, message, read, created_at)
- [ ] Backend: Gerar notificações via gatilhos (ex: lead atribuído, tarefa vencida, follow-up pendente)
- [ ] UI: "Sininho" no Header com badge de não lidas
- [ ] UI: Lista dropdown de notificações com mark as read

---

### 💡 Backlog de Melhorias (Não Priorizadas)

#### Integrações
- [ ] WhatsApp Business API (envio de mensagens)
- [ ] Calendly/Google Calendar (agendar reuniões)
- [ ] Mailchimp/SendGrid (automação de emails)

#### UX Avançado
- [ ] Importação via CSV/Excel
- [ ] Templates de mensagem (email/WhatsApp)
- [ ] Automação de follow-ups (regras configuráveis)
- [ ] Bulk edit inline na tabela

#### Performance
- [ ] React Query/SWR para cache de dados
- [ ] Virtualização de listas (react-window)
- [ ] Lazy loading de componentes pesados

#### Código & Arquitetura
- [ ] Refatorar `page.tsx` (1900+ linhas) em subcomponentes
- [ ] Migrar para server components onde possível
- [ ] Adicionar testes (Jest/Vitest)
- [ ] Error boundaries e loading skeletons


#### Observações Recentes (Prioridade Imediata)
- [ ] **Kanban Card:** Mostrar últimos 4 dígitos do telefone.
- [ ] **Kanban Card:** Mostrar data da última interação.
- [ ] **Reatividade:** Card menor deve atualizar imediatamente ao alterar dados no LeadSheet (score, contato principal).
- [ ] **UX/Bug:** Corrigir erro ao adicionar contato em lead ainda não criado (implementar salvamento em lote ou draft).

---


## Contato

Para dúvidas técnicas ou acesso ao repositório, entre em contato com a equipe de desenvolvimento.
