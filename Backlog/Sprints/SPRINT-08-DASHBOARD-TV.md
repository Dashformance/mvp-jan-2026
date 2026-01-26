# 📺 Sprint 4: Dashboard de Performance (TV)

> **Status:** 🔴 Pendente  
> **Prioridade:** Média  
> **Dependências:** Sprint 1 (Autenticação), Sprint 3 (UI/UX)

---

## 🎯 Objetivo

Criar um painel de dashboard projetado para exibição em TV, com métricas de performance de cada usuário em tempo real para monitoramento e motivação da equipe.

---

## 📋 Requisitos Funcionais

### RF-01: Layout Otimizado para TV
- [ ] Design responsivo para telas grandes (1080p, 4K)
- [ ] Alto contraste para visibilidade à distância
- [ ] Fontes grandes e legíveis
- [ ] Sem scroll - tudo visível em uma tela

### RF-02: Métricas por Usuário
- [ ] Cards individuais por vendedor
- [ ] Foto/avatar do usuário
- [ ] Métricas pessoais:
  - Leads trabalhados hoje
  - Contatos realizados
  - Reuniões agendadas
  - Conversões (WON)
  - Pontuação total

### RF-03: Ranking/Gamificação
- [ ] Placar em tempo real
- [ ] Posição no ranking
- [ ] Indicador de tendência (subindo/descendo)
- [ ] Destaque para líder do dia/semana

### RF-04: Visualizações Gráficas
- [ ] Gráfico de barras comparativo
- [ ] Funil de vendas da equipe
- [ ] Timeline de atividades recentes
- [ ] Metas vs. Realizado

### RF-05: Auto-Refresh & Fullscreen
- [ ] Atualização automática (intervalo configurável)
- [ ] Modo fullscreen nativo
- [ ] Sem necessidade de interação após iniciar
- [ ] Clock/data visível

---

## 🎨 Design Proposto

### Layout (4 Quadrantes)

```
┌─────────────────────────────────────────────────────────────┐
│  DASHFORMANCE - Dashboard de Performance    📅 23/01 14:30 │
├─────────────────────────────┬───────────────────────────────┤
│                             │                               │
│      RANKING GERAL          │     MÉTRICAS DO DIA           │
│      (Top 3 destaque)       │     (Gráfico de barras)       │
│                             │                               │
├─────────────────────────────┼───────────────────────────────┤
│                             │                               │
│      FUNIL DE VENDAS        │     ATIVIDADES RECENTES       │
│      (Gráfico funnel)       │     (Timeline últimas 10)     │
│                             │                               │
└─────────────────────────────┴───────────────────────────────┘
```

### Cards de Usuário

```
┌────────────────────────────┐
│  🥇 #1                     │
│  ┌────┐  João Vitor        │
│  │ 📷 │  ───────────────   │
│  └────┘  45 pts hoje       │
│                            │
│  📞 12  📅 3  ✅ 2         │
│  ▲ +15% vs ontem          │
└────────────────────────────┘
```

---

## 🏗️ Arquitetura Proposta

```
client/
├── app/
│   ├── tv/
│   │   ├── page.tsx          # Dashboard TV (rota pública?)
│   │   └── layout.tsx        # Layout fullscreen
│   └── api/
│       └── leads/stats/
│           └── tv/route.ts   # Endpoint otimizado para TV
├── components/
│   └── tv/
│       ├── TVDashboard.tsx   # Container principal
│       ├── RankingBoard.tsx  # Placar de ranking
│       ├── UserCard.tsx      # Card de vendedor
│       ├── DailyMetrics.tsx  # Métricas do dia
│       ├── TeamFunnel.tsx    # Funil da equipe
│       └── ActivityFeed.tsx  # Timeline de atividades
```

---

## 📊 Dados Necessários

### Endpoint `/api/leads/stats/tv`

```typescript
interface TVDashboardData {
  timestamp: string;
  users: UserMetrics[];
  team: TeamMetrics;
  recentActivities: Activity[];
}

interface UserMetrics {
  id: string;
  name: string;
  avatar_url: string;
  today: {
    leads_worked: number;
    contacts_made: number;
    meetings_scheduled: number;
    conversions: number;
    points: number;
  };
  week: {
    // mesmos campos
  };
  month: {
    // mesmos campos
  };
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

interface TeamMetrics {
  funnel: { stage: string; count: number }[];
  total_leads: number;
  conversion_rate: number;
}
```

---

## ⚙️ Configurações

### Variáveis de Configuração

```typescript
const TV_CONFIG = {
  refreshInterval: 30000,     // 30 segundos
  showClock: true,
  animateTransitions: true,
  celebrateConversions: true, // Animação especial em WON
  theme: 'dark',
};
```

---

## ✅ Critérios de Aceite

1. [ ] Dashboard carrega corretamente em rota `/tv`
2. [ ] Layout se adapta a telas de TV (1080p, 4K)
3. [ ] Dados atualizam automaticamente a cada 30s
4. [ ] Ranking mostra posição correta de cada usuário
5. [ ] Modo fullscreen funciona (F11 ou botão)
6. [ ] Funciona sem interação após carregamento inicial
7. [ ] Performance: carregamento < 2s

---

## 🧪 Plano de Testes

### Testes Manuais
1. Abrir `/tv` em monitor/TV → layout se adapta
2. Aguardar 30s → dados atualizam sem refresh
3. Criar lead/conversão → aparece no dashboard em < 1min
4. Fullscreen (F11) → funciona corretamente
5. Deixar rodando 1h → sem memory leaks ou travamentos

---

## 📝 Notas

> **NOTA:** O usuário mencionou que já tem um projeto montado para este dashboard e vai incrementá-lo aqui. Este documento será atualizado com os detalhes específicos fornecidos.

### Perguntas Pendentes
- [ ] Qual formato/design do projeto existente?
- [ ] Quais métricas são prioridade?
- [ ] Haverá metas configuráveis?
- [ ] Som/notificações visuais para conversões?
