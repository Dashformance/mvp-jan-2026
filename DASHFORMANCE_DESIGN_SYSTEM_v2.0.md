# Dashformance Design System v2.0

> **Plataforma de Aceleração Comercial B2B**  
> **Versão:** 2.0.0  
> **Última Atualização:** Janeiro 2026  
> **Stack:** Next.js 15+ | React 19 | TailwindCSS v4 | Radix UI | Framer Motion | Recharts + ApexCharts

---

## Changelog v2.0

- Sistema de Gamificação RPG completo (níveis, XP, ranks, badges)
- Superdash: Cockpit de Performance com Gauges
- Componentes de Arena (Player Cards, Leaderboards)
- Sistema de Alertas Inteligentes
- Live Feed de Atividades
- Daily Quests e Streaks
- Animações de Level Up e Celebrações
- Paleta expandida para status de gamificação
- Tipografia adicional (Space Grotesk para números)
- Microinterações avançadas

---

## 1. Fundamentos

### 1.1 Filosofia de Design

O Dashformance v2.0 evolui a estética **"Dark Glassmorphism + Champagne"** para incorporar elementos de **gamificação visual** inspirados em games AAA, mantendo a sofisticação de uma aplicação SaaS premium.

### 1.2 Princípios de Design

| Princípio | Descrição |
|-----------|-----------|
| **Clareza** | Informação hierarquizada sem ruído |
| **Engajamento** | Feedback constante de progresso |
| **Competição** | Comparação saudável entre pares |
| **Momentum** | Sensação de progresso contínuo |
| **Celebração** | Reconhecimento de conquistas |

---

## 2. Paleta de Cores

### 2.1 Cores de Fundo (Background)

| Token | Valor | Uso |
|-------|-------|-----|
| --bg-void | #050505 | Fundo absoluto (modais overlay) |
| --bg-base | #0A0A0A | Fundo da aplicação |
| --bg-deep | #0F0F0F | Fundo de seções |
| --bg-primary | #181818 | Fundo principal |
| --bg-elevated | #222222 | Cards, inputs |
| --bg-surface | #1C1C1C | Superfícies intermediárias |
| --bg-hover | #2A2A2A | Estado hover |
| --bg-active | #333333 | Estado pressed |

### 2.2 Cor de Destaque Principal (Champagne)

| Token | Valor |
|-------|-------|
| --accent | #DECCA8 |
| --accent-light | #E8DBC4 |
| --accent-dark | #B8A882 |
| --accent-muted | rgba(222, 204, 168, 0.15) |
| --accent-glow | rgba(222, 204, 168, 0.30) |

### 2.3 Cores Funcionais (Neon para Gamificação)

| Cor | Token | Valor |
|-----|-------|-------|
| Verde (Sucesso) | --neon-green | #00FF88 |
| Verde Soft | --neon-green-soft | #22C55E |
| Amarelo (Alerta) | --neon-yellow | #FFE066 |
| Laranja (Warning) | --neon-orange | #FF9F43 |
| Vermelho (Erro) | --neon-red | #FF4757 |
| Cyan (Info) | --neon-cyan | #00D4FF |
| Roxo (Premium) | --neon-purple | #A855F7 |

### 2.4 Cores de Rank (Sistema RPG)

| Rank | Cor | Background |
|------|-----|------------|
| Bronze | #CD7F32 | rgba(205, 127, 50, 0.15) |
| Silver | #C0C0C0 | rgba(192, 192, 192, 0.15) |
| Gold | #FFD700 | rgba(255, 215, 0, 0.15) |
| Platinum | #E5E4E2 | rgba(229, 228, 226, 0.15) |
| Diamond | #B9F2FF | rgba(185, 242, 255, 0.15) |
| Icon | #FF00FF | rgba(255, 0, 255, 0.15) |

---

## 3. Tipografia

### 3.1 Famílias Tipográficas

| Uso | Font Family |
|-----|-------------|
| UI Principal | Inter |
| Números/KPIs | Space Grotesk |
| Código/CNPJ | JetBrains Mono |

### 3.2 Escala Tipográfica

| Token | Tamanho |
|-------|---------|
| --text-xs | 0.75rem (12px) |
| --text-sm | 0.875rem (14px) |
| --text-base | 1rem (16px) |
| --text-lg | 1.125rem (18px) |
| --text-xl | 1.25rem (20px) |
| --text-2xl | 1.5rem (24px) |
| --text-3xl | 1.875rem (30px) |
| --text-4xl | 2.25rem (36px) |
| --text-5xl | 3rem (48px) |
| --text-7xl | 4.5rem (72px - Level Up) |

---

## 4. Espaçamento & Layout

### 4.1 Sistema de Espaçamento

| Token | Valor |
|-------|-------|
| --space-1 | 0.25rem (4px) |
| --space-2 | 0.5rem (8px) |
| --space-4 | 1rem (16px) |
| --space-6 | 1.5rem (24px) |
| --space-8 | 2rem (32px) |
| --space-12 | 3rem (48px) |

### 4.2 Layout Dimensions

| Token | Valor |
|-------|-------|
| --sidebar-width | 240px |
| --header-height | 64px |
| --kanban-column-width | 320px |
| --gauge-size-lg | 240px |
| --player-card-width | 280px |
| --sheet-width | 540px |

### 4.3 Border Radius

| Token | Valor |
|-------|-------|
| --radius-sm | 0.25rem (4px) |
| --radius-md | 0.5rem (8px) |
| --radius-lg | 0.75rem (12px) |
| --radius-xl | 1rem (16px) |
| --radius-full | 9999px |

---

## 5. Componentes Base

### 5.1 Button Variants

| Variante | Background | Text |
|----------|------------|------|
| primary | Champagne (#DECCA8) | Dark |
| secondary | #222 + border | White |
| ghost | Transparent | Muted |
| destructive | Red/15% | Red |
| xp | Green glow | Green |

### 5.2 Badge Variants

| Tipo | Uso |
|------|-----|
| success | Positivo, ganhos |
| warning | Alertas |
| error | Erros |
| bronze/silver/gold/platinum/diamond | Ranks RPG |
| xp | +XP ganho |

---

## 6. Sistema de Níveis RPG

### 6.1 XP por Ação

| Ação | XP |
|------|-----|
| MOVE_CARD | 2 |
| ADD_NOTE | 5 |
| MAKE_CALL | 5 |
| SCHEDULE_MEETING | 25 |
| COMPLETE_MEETING | 30 |
| CLOSE_SALE_SMALL | 100 |
| CLOSE_SALE_LARGE | 200 |
| STREAK_7_DAYS | 200 |
| BEAT_MONTHLY_GOAL | 500 |

### 6.2 Ranks por Nível

| Rank | Níveis |
|------|--------|
| Bronze | 1-9 |
| Silver | 10-19 |
| Gold | 20-29 |
| Platinum | 30-39 |
| Diamond | 40-49 |
| Icon | 50 |

### 6.3 Títulos por Nível

| Nível | Título | Ícone |
|-------|--------|-------|
| 1 | Novato | 🌱 |
| 5 | Vendedor Jr. | 💼 |
| 10 | Vendedor | 💼✨ |
| 20 | Consultor | 🏅 |
| 30 | Hunter | 🦅 |
| 40 | Lenda | 🏆 |
| 50 | ÍCONE | 💎 |

---

## 7. Componentes de Gamificação

- **XPCard**: Card com sistema de XP e glow colorido
- **PlayerCard**: Estilo FIFA/RPG com avatar, nível, XP ring
- **Leaderboard**: Ranking com posições e badges
- **DailyQuestCard**: Missões diárias com progresso
- **XPFeed**: Feed live de atividades
- **BadgeDisplay**: Grid de badges conquistados
- **StreakCounter**: Contador de dias consecutivos
- **LevelProgress**: Barra de progresso para próximo nível

---

## 8. Superdash (Performance Cockpit)

- **Gauge**: Velocímetro com gradiente (vermelho→verde)
- **InsightAlert**: Alertas inteligentes em pill
- **TrendChart**: Gráficos de tendência com Recharts

---

## 9. Animações

### Durações

| Token | Valor |
|-------|-------|
| --duration-fast | 150ms |
| --duration-normal | 250ms |
| --duration-slow | 400ms |

### Easings

| Token | Valor |
|-------|-------|
| --ease-default | cubic-bezier(0.4, 0, 0.2, 1) |
| --ease-bounce | cubic-bezier(0.34, 1.56, 0.64, 1) |
| --ease-spring | cubic-bezier(0.32, 0.72, 0, 1) |

---

## Checklist de Implementação

**Componentes Base:**
- [ ] Button (todas variantes + XP)
- [ ] Input, Select, Checkbox, RadioGroup, Slider
- [ ] Badge (status + ranks + XP)
- [ ] Card, CardGlass, CardGame
- [ ] Progress (todos tamanhos + XP)
- [ ] Avatar (com ring de level)
- [ ] Dialog, Sheet, Dropdown
- [ ] Table, Tabs, Toast

**Componentes Gamificação:**
- [ ] XPCard
- [ ] PlayerCard
- [ ] Leaderboard
- [ ] DailyQuestCard
- [ ] XPFeed
- [ ] BadgeDisplay
- [ ] StreakCounter
- [ ] LevelProgress

**Superdash:**
- [ ] Gauge (velocímetro)
- [ ] InsightAlert
- [ ] TrendChart

**Animações:**
- [ ] LevelUpCelebration
- [ ] XPPopup
- [ ] Confetti integration

---

**Versão:** 2.0.0  
**Data:** Janeiro 2026
