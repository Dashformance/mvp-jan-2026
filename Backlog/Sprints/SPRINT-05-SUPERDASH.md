# Sprint 05: Superdash Premium 🚀

> **Objetivo:** Construir o cockpit de performance comercial com gamificação AAA.  
> **Duração Estimada:** 5-7 dias  
> **Prioridade:** Alta  
> **Dependência:** Sprint 04 (Design System)

---

## 📋 Escopo

### Fase 1: Core do Superdash (2 dias)
- [ ] **Gauge Dual** — Velocímetros de Empenho + Conversão
  - SVG customizado com gradiente (vermelho→verde)
  - Ponteiro animado com Framer Motion (spring)
  - Labels 0-100, valor central grande
  - Glow na cor do status
- [ ] **KPI Cards Gamificados** (4x)
  - 📅 Reuniões Agendadas (verde)
  - 🏆 Vendas Realizadas (amarelo)
  - 💬 Primeiro Contato (cyan)
  - ⏳ Pendentes (vermelho)
  - Cada um com: valor, barra XP, botão [+]
- [ ] **InsightAlert** — Pill centralizada com lógica automática
  - Empenho alto + Conversão baixa → warning
  - Ambos altos → success
  - Ambos baixos → critical

### Fase 2: Arena (2 dias)
- [ ] **PlayerCard** — Estilo FIFA/RPG
  - Avatar com XP Ring
  - Badge de nível e liga
  - Mini funil (Contatos → Reuniões → Vendas)
  - Badges conquistados
  - Status indicator (on-fire, on-pace, slow)
- [ ] **Leaderboard** — Ranking do time
  - Top 3 com medalhas (🥇🥈🥉)
  - Destaque dourado para 1º lugar
  - XP + Nível de cada player
- [ ] **ArenaGrid** — Grid responsivo de PlayerCards

### Fase 3: Tendências (1 dia)
- [ ] **TrendChart** — Gráfico de área com Recharts
  - Linha suave (monotone)
  - Área com gradiente transparente
  - Tema escuro customizado
  - Tooltip glass
- [ ] **Sparklines** — Mini gráficos nos KPI Cards

### Fase 4: Gamificação Extra (1.5 dias)
- [ ] **LevelProgress** — Card de progresso pessoal
  - Ícone do título, nível, barra XP
  - "Faltam X XP para nível Y"
- [ ] **DailyQuestCard** — Missões diárias
  - Checkbox + descrição + recompensa XP
  - Estado concluído (fundo verde)
- [ ] **XPFeed** — Feed live de atividades
  - Dot pulsante "LIVE"
  - Eventos deslizando
  - "+XP" em verde
- [ ] **BadgeDisplay** — Grid de badges
  - Raridade (legendary, epic, rare, common)
  - Locked com grayscale
- [ ] **StreakCounter** — Contador de dias consecutivos
  - Ícone 🔥 animado

### Fase 5: Celebrações (0.5 dia)
- [ ] **LevelUpCelebration** — Overlay fullscreen
  - Partículas subindo
  - "LEVEL UP!" com glow
  - Número do nível gigante
  - Confetti (canvas-confetti)
  - Auto-dismiss 4s
- [ ] **XP Toast** — Notificação de XP ganho
  - Slide in/out
  - "+25 XP" em verde

---

## 🎮 Layout Final do Superdash

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER: [⚡ SUPERDASH] [🔴 Ao Vivo] [Lv.12] [Avatar]                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ TIER 1: HERO — Gauges + KPI Cards                                       │
│ ┌───────────────┐         ┌───────────────┐                            │
│ │ GAUGE EMPENHO │         │ GAUGE CONVERSÃO│                            │
│ │     70%       │         │      21%       │                            │
│ └───────────────┘         └───────────────┘                            │
│          [💡 InsightAlert: Alto esforço com baixa conversão]           │
│                                                                         │
│ [📅 Reuniões: 3] [🏆 Vendas: 2] [💬 Contatos: 14] [⏳ Pendentes: 6]    │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────┬─────────────────────────────┐
│ TIER 2/3: MAIN                            │ SIDEBAR                     │
│ ┌───────────────────────────────────────┐ │ ┌─────────────────────────┐ │
│ │ 📈 TrendChart (Vendas vs Leads)       │ │ │ 🏆 Leaderboard          │ │
│ └───────────────────────────────────────┘ │ └─────────────────────────┘ │
│                                           │ ┌─────────────────────────┐ │
│ ┌───────────────────────────────────────┐ │ │ 🔴 XP Feed              │ │
│ │ 🏟️ Arena (PlayerCards Grid)           │ │ └─────────────────────────┘ │
│ └───────────────────────────────────────┘ │ ┌─────────────────────────┐ │
│                                           │ │ 🎯 DailyQuests          │ │
│                                           │ └─────────────────────────┘ │
│                                           │ ┌─────────────────────────┐ │
│                                           │ │ 📊 LevelProgress        │ │
│                                           │ └─────────────────────────┘ │
└───────────────────────────────────────────┴─────────────────────────────┘
```

---

## 📦 Bibliotecas Necessárias

```bash
npm install recharts apexcharts react-apexcharts
npm install framer-motion
npm install canvas-confetti
```

---

## ✅ Critérios de Aceite

1. Gauges animados com spring physics
2. PlayerCards com todos os elementos visuais
3. Leaderboard ordenado por XP
4. TrendChart responsivo
5. LevelUpCelebration disparando corretamente
6. XP Feed atualizando em tempo real (mock)

---

## 📁 Arquivos Principais

```
client/components/
├── super-dash/
│   ├── Gauge.tsx
│   ├── DualGauge.tsx
│   ├── KPICardGame.tsx
│   ├── InsightAlert.tsx
│   ├── TrendChart.tsx
│   ├── Sparkline.tsx
│   └── SuperdashLayout.tsx
├── arena/
│   ├── PlayerCard.tsx
│   ├── XPRing.tsx
│   ├── Leaderboard.tsx
│   └── ArenaGrid.tsx
├── gamification/
│   ├── LevelProgress.tsx
│   ├── DailyQuestCard.tsx
│   ├── XPFeed.tsx
│   ├── BadgeDisplay.tsx
│   ├── StreakCounter.tsx
│   └── LevelUpCelebration.tsx
└── lib/gamification/
    ├── xp-config.ts
    ├── levels.ts
    └── badges.ts
```

---

## 📚 Documentação de Referência

- [DASHFORMANCE_DESIGN_SYSTEM_v2.0.md](../DASHFORMANCE_DESIGN_SYSTEM_v2.0.md)
- [SUPERDASH_BRIEFING.md](../SUPERDASH_BRIEFING.md)
- [Backlog/Sprints/REFS/](./REFS/) — Imagens de referência

---

**Status:** 🔴 Aguardando Sprint 04  
**Dependências:** Sprint 04 (Design System Foundation)  
**Bloqueia:** Nenhum
