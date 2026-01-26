# Dashformance Design System v2.0

> **Plataforma de Aceleração Comercial B2B**  
> **Versão:** 2.0.0  
> **Última Atualização:** Janeiro 2026  
> **Stack:** Next.js 15+ | React 19 | TailwindCSS v4 | Radix UI | Framer Motion | Recharts + ApexCharts

---

## Changelog v2.0

```diff
+ Sistema de Gamificação RPG completo (níveis, XP, ranks, badges)
+ Superdash: Cockpit de Performance com Gauges
+ Componentes de Arena (Player Cards, Leaderboards)
+ Sistema de Alertas Inteligentes
+ Live Feed de Atividades
+ Daily Quests e Streaks
+ Animações de Level Up e Celebrações
+ Paleta expandida para status de gamificação
+ Tipografia adicional (Space Grotesk para números)
+ Microinterações avançadas
```

---

## Sumário

1. [Fundamentos](#1-fundamentos)
2. [Paleta de Cores](#2-paleta-de-cores)
3. [Tipografia](#3-tipografia)
4. [Espaçamento & Grid](#4-espaçamento--grid)
5. [Componentes Base](#5-componentes-base)
6. [Componentes de CRM](#6-componentes-de-crm)
7. [Componentes de Gamificação](#7-componentes-de-gamificação)
8. [Superdash (Performance Cockpit)](#8-superdash-performance-cockpit)
9. [Sistema de Níveis RPG](#9-sistema-de-níveis-rpg)
10. [Animações & Microinterações](#10-animações--microinterações)
11. [Estados & Feedback](#11-estados--feedback)
12. [Acessibilidade](#12-acessibilidade)
13. [Tokens CSS Completos](#13-tokens-css-completos)

---

## 1. Fundamentos

### 1.1 Filosofia de Design

O Dashformance v2.0 evolui a estética **"Dark Glassmorphism + Champagne"** para incorporar elementos de **gamificação visual** inspirados em games AAA, mantendo a sofisticação de uma aplicação SaaS premium.

```
┌─────────────────────────────────────────────────────────────┐
│                    PILARES DO DESIGN                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   🎮 GAMIFICAÇÃO          💎 PREMIUM           ⚡ PERFORMANCE │
│   Níveis, XP, Badges      Dark + Champagne    Tempo real    │
│   Competição saudável     Glassmorphism       Gauges/KPIs   │
│   Celebrações             Elegância           Insights      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Princípios de Design

| Princípio | Descrição | Aplicação |
|-----------|-----------|-----------|
| **Clareza** | Informação hierarquizada sem ruído | KPIs no topo, detalhes em drill-down |
| **Engajamento** | Feedback constante de progresso | XP visível, animações de conquista |
| **Competição** | Comparação saudável entre pares | Leaderboards, rankings, badges |
| **Momentum** | Sensação de progresso contínuo | Barras de XP, streaks, level ups |
| **Celebração** | Reconhecimento de conquistas | Animações, confetti, sons opcionais |

### 1.3 Camadas de Informação (Top-Down)

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 1: PULSO (Hero)                                        │
│ Gauges, KPIs totais, alertas inteligentes                   │
│ → Responde: "Como está a empresa AGORA?"                    │
├─────────────────────────────────────────────────────────────┤
│ TIER 2: TENDÊNCIAS (Meio)                                   │
│ Gráficos de fluxo, comparativos temporais                   │
│ → Responde: "Para onde estamos indo?"                       │
├─────────────────────────────────────────────────────────────┤
│ TIER 3: ARENA (Individual)                                  │
│ Player cards, rankings, performance individual              │
│ → Responde: "Quem está performando?"                        │
├─────────────────────────────────────────────────────────────┤
│ TIER 4: DETALHE (Drill-down)                                │
│ Kanban, leads, histórico de atividades                      │
│ → Responde: "O que preciso fazer agora?"                    │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Diretrizes Gerais

```
✓ Fundos escuros (#0F0F0F a #222222) para reduzir fadiga
✓ Champagne (#DECCA8) reservado para CTAs e destaques premium
✓ Cores neon funcionais para gamificação (verde, amarelo, vermelho, cyan)
✓ Glassmorphism sutil para elevação (backdrop-blur + transparência)
✓ Bordas sutis (white/5 a white/10) para separação
✓ Números importantes em Space Grotesk (impacto visual)
✓ Animações suaves com Framer Motion (spring physics)

✗ Evitar gradientes coloridos em excesso
✗ Evitar sombras pesadas (preferir glow sutil)
✗ Nunca usar branco puro (#FFFFFF) em grandes áreas
✗ Evitar mais de 3 cores de destaque por tela
```

---

## 2. Paleta de Cores

### 2.1 Cores de Fundo (Background)

```css
/* Hierarquia de profundidade */
--bg-void: #050505;              /* Fundo absoluto (modais overlay) */
--bg-base: #0A0A0A;              /* Fundo da aplicação */
--bg-deep: #0F0F0F;              /* Fundo de seções */
--bg-primary: #181818;           /* Fundo principal */
--bg-elevated: #222222;          /* Cards, inputs */
--bg-surface: #1C1C1C;           /* Superfícies intermediárias */
--bg-hover: #2A2A2A;             /* Estado hover */
--bg-active: #333333;            /* Estado pressed */

/* Glass Effect */
--glass-bg: rgba(255, 255, 255, 0.03);
--glass-bg-hover: rgba(255, 255, 255, 0.06);
--glass-border: rgba(255, 255, 255, 0.08);
--glass-blur: 12px;
```

### 2.2 Cor de Destaque Principal (Champagne)

```css
/* Champagne - Identidade da marca */
--accent: #DECCA8;
--accent-light: #E8DBC4;
--accent-dark: #B8A882;
--accent-muted: rgba(222, 204, 168, 0.15);
--accent-glow: rgba(222, 204, 168, 0.30);

/* Gradiente principal */
--gradient-accent: linear-gradient(135deg, #DECCA8 0%, #B8A882 100%);
```

### 2.3 Cores Funcionais (Neon para Gamificação)

```css
/* Verde - Sucesso, Positivo, XP ganho */
--neon-green: #00FF88;
--neon-green-soft: #22C55E;
--neon-green-bg: rgba(0, 255, 136, 0.10);
--neon-green-glow: rgba(0, 255, 136, 0.40);

/* Amarelo - Alerta, Atenção, Ouro */
--neon-yellow: #FFE066;
--neon-yellow-soft: #F59E0B;
--neon-yellow-bg: rgba(255, 224, 102, 0.10);
--neon-yellow-glow: rgba(255, 224, 102, 0.40);

/* Laranja - Warning, Streak */
--neon-orange: #FF9F43;
--neon-orange-bg: rgba(255, 159, 67, 0.10);
--neon-orange-glow: rgba(255, 159, 67, 0.40);

/* Vermelho - Erro, Crítico, Urgente */
--neon-red: #FF4757;
--neon-red-soft: #EF4444;
--neon-red-bg: rgba(255, 71, 87, 0.10);
--neon-red-glow: rgba(255, 71, 87, 0.40);

/* Cyan - Info, Contatos, Neutro positivo */
--neon-cyan: #00D4FF;
--neon-cyan-soft: #3B82F6;
--neon-cyan-bg: rgba(0, 212, 255, 0.10);
--neon-cyan-glow: rgba(0, 212, 255, 0.40);

/* Roxo - Premium, Reuniões, Especial */
--neon-purple: #A855F7;
--neon-purple-soft: #8B5CF6;
--neon-purple-bg: rgba(168, 85, 247, 0.10);
--neon-purple-glow: rgba(168, 85, 247, 0.40);
```

### 2.4 Cores de Texto

```css
--text-primary: #FFFFFF;
--text-secondary: #B0B0B0;
--text-muted: #888888;
--text-disabled: #555555;
--text-inverse: #0F0F0F;
--text-accent: #DECCA8;
```

### 2.5 Cores de Borda

```css
--border-subtle: rgba(255, 255, 255, 0.05);
--border-default: rgba(255, 255, 255, 0.10);
--border-strong: rgba(255, 255, 255, 0.20);
--border-accent: rgba(222, 204, 168, 0.30);
--border-focus: rgba(222, 204, 168, 0.50);
```

### 2.6 Cores de Status (Pipeline CRM)

```css
--status-inbox: #6B7280;        /* Lista Fria */
--status-qualified: #22C55E;    /* Qualificado */
--status-attempted: #F59E0B;    /* Tentativa */
--status-contacted: #3B82F6;    /* Contatado */
--status-meeting: #8B5CF6;      /* Reunião */
--status-won: #10B981;          /* Ganho */
--status-lost: #EF4444;         /* Perdido */
--status-disqualified: #6B7280; /* Desqualificado */
```

### 2.7 Cores de Rank (Sistema RPG)

```css
--rank-bronze: #CD7F32;
--rank-bronze-bg: rgba(205, 127, 50, 0.15);

--rank-silver: #C0C0C0;
--rank-silver-bg: rgba(192, 192, 192, 0.15);

--rank-gold: #FFD700;
--rank-gold-bg: rgba(255, 215, 0, 0.15);

--rank-platinum: #E5E4E2;
--rank-platinum-bg: rgba(229, 228, 226, 0.15);

--rank-diamond: #B9F2FF;
--rank-diamond-bg: rgba(185, 242, 255, 0.15);

--rank-icon: #FF00FF;
--rank-icon-bg: rgba(255, 0, 255, 0.15);
```

### 2.8 Gradientes do Gauge

```css
/* Gradiente do arco do velocímetro */
--gauge-gradient: linear-gradient(
  90deg,
  #FF4757 0%,      /* 0-30%: Crítico */
  #FF9F43 30%,     /* 30-50%: Alerta */
  #FFE066 50%,     /* 50-70%: Atenção */
  #00FF88 70%,     /* 70-100%: Excelente */
  #00FF88 100%
);

/* Color stops para ApexCharts/SVG */
--gauge-stop-1: { offset: 0, color: '#FF4757' };
--gauge-stop-2: { offset: 30, color: '#FF9F43' };
--gauge-stop-3: { offset: 50, color: '#FFE066' };
--gauge-stop-4: { offset: 70, color: '#00FF88' };
```

---

## 3. Tipografia

### 3.1 Famílias Tipográficas

```css
/* UI Principal */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Números de destaque (KPIs, níveis, XP) */
--font-display: 'Space Grotesk', 'Inter', sans-serif;

/* Código, CNPJs, IDs */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 3.2 Escala Tipográfica

```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
--text-7xl: 4.5rem;      /* 72px - Level Up */

--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;

--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### 3.3 Estilos de Texto

| Estilo | Font | Tamanho | Peso | Uso |
|--------|------|---------|------|-----|
| **Display XL** | Space Grotesk | 7xl | Black | Level Up animation |
| **Display** | Space Grotesk | 5xl | Bold | KPIs principais, XP total |
| **Metric** | Space Grotesk | 4xl | Bold | Valores nos cards |
| **H1** | Inter | 2xl | Semibold | Títulos de página |
| **H2** | Inter | xl | Semibold | Títulos de seção |
| **H3** | Inter | lg | Medium | Subtítulos, cards |
| **Body** | Inter | base | Normal | Texto corrido |
| **Body Small** | Inter | sm | Normal | Descrições |
| **Caption** | Inter | xs | Medium | Labels, metadados |
| **Mono** | JetBrains Mono | sm | Normal | CNPJs, códigos |
| **XP Badge** | Space Grotesk | xs | Bold | "+25 XP" |

### 3.4 Aplicação por Contexto

```tsx
// KPIs e Números importantes
<span className="font-display text-5xl font-bold text-accent">
  18.500
</span>

// Nível do jogador
<span className="font-display text-2xl font-black text-white">
  Nível 12
</span>

// XP ganho
<span className="font-display text-sm font-bold text-neon-green">
  +100 XP
</span>

// Porcentagem no Gauge
<span className="font-display text-4xl font-bold">
  70%
</span>

// Texto normal
<p className="font-sans text-sm text-secondary">
  Descrição do lead
</p>

// CNPJ
<span className="font-mono text-sm text-muted">
  12.345.678/0001-90
</span>
```

---

## 4. Espaçamento & Grid

### 4.1 Sistema de Espaçamento

```css
--space-0: 0;
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

### 4.2 Layout Dimensions

```css
/* Estrutura */
--sidebar-width: 240px;
--sidebar-collapsed: 72px;
--header-height: 64px;
--content-max-width: 1440px;

/* Kanban */
--kanban-column-width: 320px;
--kanban-column-gap: 16px;
--kanban-card-gap: 12px;

/* Superdash */
--gauge-size-sm: 160px;
--gauge-size-md: 200px;
--gauge-size-lg: 240px;
--kpi-card-min-width: 180px;
--player-card-width: 280px;

/* Modais */
--modal-sm: 400px;
--modal-md: 540px;
--modal-lg: 720px;
--sheet-width: 540px;
```

### 4.3 Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - badges pequenos */
--radius-md: 0.5rem;    /* 8px - buttons, inputs */
--radius-lg: 0.75rem;   /* 12px - cards */
--radius-xl: 1rem;      /* 16px - modais, sheets */
--radius-2xl: 1.5rem;   /* 24px - cards especiais */
--radius-full: 9999px;  /* Pills, avatares */
```

### 4.4 Breakpoints

```css
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
--bp-2xl: 1536px;
--bp-tv: 1920px;   /* War Room Mode */
```

### 4.5 Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 50;
--z-sticky: 100;
--z-modal-backdrop: 150;
--z-modal: 200;
--z-popover: 250;
--z-toast: 300;
--z-tooltip: 350;
--z-level-up: 400;   /* Animação de level up */
--z-max: 9999;
```

---

## 5. Componentes Base

### 5.1 Button

**Variantes:**

| Variante | Uso | Background | Text |
|----------|-----|------------|------|
| `primary` | CTAs principais | Champagne | Dark |
| `secondary` | Ações secundárias | #222 + border | White |
| `ghost` | Ações terciárias | Transparent | Muted |
| `destructive` | Ações destrutivas | Red/15% | Red |
| `success` | Confirmações | Green/15% | Green |
| `xp` | Ações que dão XP | Green glow | Green |

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 150ms ease;
  cursor: pointer;
}

.btn-primary {
  background: var(--accent);
  color: var(--text-inverse);
}
.btn-primary:hover {
  background: var(--accent-light);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}
.btn-secondary:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
}

.btn-ghost {
  background: transparent;
  color: var(--text-muted);
}
.btn-ghost:hover {
  background: var(--glass-bg);
  color: var(--text-primary);
}

.btn-xp {
  background: var(--neon-green-bg);
  color: var(--neon-green);
  border: 1px solid rgba(0, 255, 136, 0.30);
}
.btn-xp:hover {
  background: rgba(0, 255, 136, 0.20);
  box-shadow: var(--neon-green-glow);
}

/* Tamanhos */
.btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
.btn-md { padding: 0.5rem 1rem; font-size: 0.875rem; }
.btn-lg { padding: 0.75rem 1.5rem; font-size: 1rem; }

/* Com ícone de XP */
.btn-xp::after {
  content: attr(data-xp);
  font-family: var(--font-display);
  font-weight: 700;
  margin-left: 0.25rem;
}
```

### 5.2 Input

```css
.input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 150ms ease;
}

.input::placeholder {
  color: var(--text-muted);
}

.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-muted);
}

.input-error {
  border-color: var(--neon-red);
  box-shadow: 0 0 0 3px var(--neon-red-bg);
}

.input-success {
  border-color: var(--neon-green-soft);
}
```

### 5.3 Card

```css
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;
  overflow: hidden;
}

.card-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
}

.card-header {
  padding: 1.25rem 1.5rem 0;
}

.card-content {
  padding: 1.25rem 1.5rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
}

/* Card com glow (hover ou destaque) */
.card-glow:hover {
  border-color: var(--accent-muted);
  box-shadow: 0 0 30px var(--accent-glow);
}

/* Card de gamificação */
.card-game {
  background: linear-gradient(180deg, var(--glass-bg), transparent);
  border: 1px solid var(--border-subtle);
  transition: all 200ms ease;
}

.card-game:hover {
  transform: translateY(-4px);
  border-color: var(--border-default);
}
```

### 5.4 Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}

/* Status */
.badge-success { background: var(--neon-green-bg); color: var(--neon-green-soft); }
.badge-warning { background: var(--neon-yellow-bg); color: var(--neon-yellow-soft); }
.badge-error { background: var(--neon-red-bg); color: var(--neon-red-soft); }
.badge-info { background: var(--neon-cyan-bg); color: var(--neon-cyan-soft); }
.badge-neutral { background: var(--glass-bg); color: var(--text-muted); }

/* Ranks */
.badge-bronze { background: var(--rank-bronze-bg); color: var(--rank-bronze); }
.badge-silver { background: var(--rank-silver-bg); color: var(--rank-silver); }
.badge-gold { background: var(--rank-gold-bg); color: var(--rank-gold); }
.badge-platinum { background: var(--rank-platinum-bg); color: var(--rank-platinum); }
.badge-diamond { background: var(--rank-diamond-bg); color: var(--rank-diamond); }

/* XP Badge */
.badge-xp {
  font-family: var(--font-display);
  font-weight: 700;
  background: var(--neon-green-bg);
  color: var(--neon-green);
  padding: 0.25rem 0.625rem;
}

/* Level Badge */
.badge-level {
  font-family: var(--font-display);
  font-weight: 900;
  background: var(--accent);
  color: var(--text-inverse);
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 5.5 Progress Bar

```css
.progress {
  width: 100%;
  height: 0.5rem;
  background: var(--glass-bg);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 500ms ease;
}

/* Variantes */
.progress-accent .progress-fill { background: var(--accent); }
.progress-green .progress-fill { background: var(--neon-green); }
.progress-yellow .progress-fill { background: var(--neon-yellow); }
.progress-red .progress-fill { background: var(--neon-red); }

/* XP Progress (com glow) */
.progress-xp .progress-fill {
  background: linear-gradient(90deg, var(--neon-green), var(--neon-cyan));
  box-shadow: 0 0 10px var(--neon-green-glow);
}

/* Tamanhos */
.progress-sm { height: 0.25rem; }
.progress-md { height: 0.5rem; }
.progress-lg { height: 0.75rem; }
```

### 5.6 Avatar

```css
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--bg-surface);
  color: var(--text-muted);
  font-weight: 600;
  overflow: hidden;
}

.avatar-sm { width: 2rem; height: 2rem; font-size: 0.75rem; }
.avatar-md { width: 2.5rem; height: 2.5rem; font-size: 0.875rem; }
.avatar-lg { width: 3rem; height: 3rem; font-size: 1rem; }
.avatar-xl { width: 4rem; height: 4rem; font-size: 1.5rem; }

/* Avatar com ring de XP */
.avatar-ring {
  position: relative;
}

.avatar-ring::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 9999px;
  border: 3px solid var(--border-subtle);
}

.avatar-ring::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 9999px;
  border: 3px solid transparent;
  border-top-color: var(--accent);
  transform: rotate(var(--ring-progress, 0deg));
}

/* Borda por rank */
.avatar-bronze { border: 2px solid var(--rank-bronze); }
.avatar-silver { border: 2px solid var(--rank-silver); }
.avatar-gold { border: 2px solid var(--rank-gold); }
.avatar-platinum { border: 2px solid var(--rank-platinum); }
.avatar-diamond { border: 2px solid var(--rank-diamond); }
```

### 5.7 Tooltip

```css
.tooltip {
  position: relative;
}

.tooltip-content {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 0.75rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-primary);
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transition: all 150ms ease;
}

.tooltip:hover .tooltip-content {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-4px);
}

/* Tooltip rico (com XP info) */
.tooltip-rich {
  padding: 0.75rem;
  min-width: 150px;
}

.tooltip-rich-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.tooltip-rich-xp {
  font-family: var(--font-display);
  color: var(--neon-green);
}
```

---

## 6. Componentes de CRM

### 6.1 Kanban Board

```css
.kanban-board {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height));
  background: var(--bg-deep);
}

.kanban-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-primary);
}

.kanban-columns {
  display: flex;
  gap: var(--kanban-column-gap);
  padding: 1.5rem;
  overflow-x: auto;
  flex: 1;
}
```

### 6.2 Kanban Column

```css
.kanban-column {
  flex-shrink: 0;
  width: var(--kanban-column-width);
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.kanban-column-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kanban-column-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.kanban-column-count {
  font-family: var(--font-display);
  font-size: 0.875rem;
  color: var(--text-muted);
}

.kanban-column-content {
  padding: 0.75rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--kanban-card-gap);
}

/* Drop zone ativa */
.kanban-column.drag-over {
  background: var(--accent-muted);
  border-color: var(--accent);
}
```

### 6.3 Kanban Card (Lead)

```css
.kanban-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 0.5rem;
  padding: 0.875rem;
  cursor: grab;
  transition: all 150ms ease;
}

.kanban-card:hover {
  border-color: var(--border-default);
  transform: translateY(-2px);
}

.kanban-card:active {
  cursor: grabbing;
}

/* Score indicator (borda esquerda) */
.kanban-card.score-high { border-left: 3px solid var(--neon-green-soft); }
.kanban-card.score-medium { border-left: 3px solid var(--neon-yellow-soft); }
.kanban-card.score-low { border-left: 3px solid var(--neon-red-soft); }

/* Favorito (glow champagne) */
.kanban-card.starred {
  box-shadow: 0 0 20px var(--accent-glow);
}

/* XP Indicator (quando ação dá XP) */
.kanban-card.xp-action::after {
  content: '+5 XP';
  position: absolute;
  top: -8px;
  right: 8px;
  font-family: var(--font-display);
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--neon-green);
  background: var(--neon-green-bg);
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
}

.kanban-card-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.kanban-card-meta {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.kanban-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
}
```

### 6.4 Lead Sheet (Painel Lateral)

```css
.lead-sheet {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  max-width: var(--sheet-width);
  background: var(--bg-surface);
  border-left: 1px solid var(--border-default);
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.3);
  z-index: var(--z-modal);
  overflow-y: auto;
}

.lead-sheet-header {
  position: sticky;
  top: 0;
  padding: 1.5rem;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  z-index: 1;
}

.lead-sheet-content {
  padding: 1.5rem;
}

.lead-sheet-section {
  margin-bottom: 2rem;
}

.lead-sheet-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}
```

### 6.5 Activity Timeline

```css
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
  position: relative;
}

/* Linha conectora */
.activity-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 1rem;
  top: 2.5rem;
  bottom: -1rem;
  width: 1px;
  background: var(--border-subtle);
}

.activity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.type-call { background: var(--neon-cyan-bg); color: var(--neon-cyan); }
.activity-icon.type-email { background: var(--neon-purple-bg); color: var(--neon-purple); }
.activity-icon.type-whatsapp { background: var(--neon-green-bg); color: var(--neon-green); }
.activity-icon.type-meeting { background: var(--accent-muted); color: var(--accent); }
.activity-icon.type-note { background: var(--glass-bg); color: var(--text-muted); }

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* XP ganho na atividade */
.activity-xp {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--neon-green);
}
```

### 6.6 KPI Card (CRM)

```css
.kpi-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.kpi-card-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.kpi-card-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.kpi-card-value {
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.kpi-card-change {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.kpi-card-change.positive { color: var(--neon-green-soft); }
.kpi-card-change.negative { color: var(--neon-red-soft); }

/* Variantes por cor */
.kpi-card.variant-accent .kpi-card-icon {
  background: var(--accent-muted);
  color: var(--accent);
}

.kpi-card.variant-success .kpi-card-icon {
  background: var(--neon-green-bg);
  color: var(--neon-green);
}

.kpi-card.variant-warning .kpi-card-icon {
  background: var(--neon-yellow-bg);
  color: var(--neon-yellow);
}

.kpi-card.variant-error .kpi-card-icon {
  background: var(--neon-red-bg);
  color: var(--neon-red);
}
```

---

## 7. Componentes de Gamificação

### 7.1 XP Card (Card com Sistema de XP)

```css
.xp-card {
  position: relative;
  background: linear-gradient(180deg, var(--glass-bg), transparent);
  border: 1px solid var(--border-subtle);
  border-radius: 1rem;
  padding: 1.5rem;
  overflow: hidden;
  transition: all 200ms ease;
}

.xp-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Glow por cor do card */
.xp-card.color-green {
  border-color: rgba(0, 255, 136, 0.20);
}
.xp-card.color-green:hover {
  box-shadow: 0 20px 40px var(--neon-green-glow);
}

.xp-card.color-yellow {
  border-color: rgba(255, 224, 102, 0.20);
}
.xp-card.color-yellow:hover {
  box-shadow: 0 20px 40px var(--neon-yellow-glow);
}

.xp-card.color-cyan {
  border-color: rgba(0, 212, 255, 0.20);
}

.xp-card.color-red {
  border-color: rgba(255, 71, 87, 0.20);
}

.xp-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.xp-card-icon {
  font-size: 1.25rem;
}

.xp-card-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.xp-card-value {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.75rem;
}

.xp-card-value.color-green { color: var(--neon-green); text-shadow: 0 0 30px var(--neon-green-glow); }
.xp-card-value.color-yellow { color: var(--neon-yellow); text-shadow: 0 0 30px var(--neon-yellow-glow); }
.xp-card-value.color-cyan { color: var(--neon-cyan); text-shadow: 0 0 30px var(--neon-cyan-glow); }
.xp-card-value.color-red { color: var(--neon-red); text-shadow: 0 0 30px var(--neon-red-glow); }

.xp-card-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.xp-card-progress-bar {
  flex: 1;
  height: 4px;
  background: var(--glass-bg);
  border-radius: 9999px;
  overflow: hidden;
}

.xp-card-progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 500ms ease;
}

.xp-card-xp {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
}

.xp-card-action {
  width: 100%;
  padding: 0.625rem;
  background: var(--glass-bg);
  border: 1px solid var(--border-subtle);
  border-radius: 0.5rem;
  color: var(--text-muted);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 150ms ease;
}

.xp-card-action:hover {
  background: var(--glass-bg-hover);
  color: var(--text-primary);
}
```

### 7.2 Player Card (Estilo FIFA/RPG)

```css
.player-card {
  position: relative;
  background: linear-gradient(180deg, var(--glass-bg), rgba(255,255,255,0.01));
  border: 1px solid var(--border-subtle);
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 200ms ease;
}

.player-card:hover {
  transform: scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

/* Rank Badge (posição no ranking) */
.player-card-rank {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 1;
}

.player-card-rank.rank-1 { background: var(--rank-gold); color: var(--text-inverse); }
.player-card-rank.rank-2 { background: var(--rank-silver); color: var(--text-inverse); }
.player-card-rank.rank-3 { background: var(--rank-bronze); color: white; }
.player-card-rank.rank-other { background: var(--glass-bg); color: var(--text-muted); }

/* Liga Badge */
.player-card-league {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
}

.player-card-content {
  padding: 1.25rem;
}

.player-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

/* Avatar com Ring de XP */
.player-card-avatar {
  position: relative;
  width: 3.5rem;
  height: 3.5rem;
}

.player-card-avatar-ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
}

.player-card-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: var(--bg-surface);
  border: 2px solid var(--border-default);
}

.player-card-level {
  position: absolute;
  bottom: -4px;
  right: -4px;
  min-width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.625rem;
  font-weight: 900;
}

.player-card-info {
  flex: 1;
  min-width: 0;
}

.player-card-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-card-title {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.player-card-title-icon {
  font-size: 0.875rem;
}

.player-card-xp-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.375rem;
}

.player-card-xp-progress {
  flex: 1;
  height: 4px;
  background: var(--glass-bg);
  border-radius: 9999px;
  overflow: hidden;
}

.player-card-xp-fill {
  height: 100%;
  border-radius: 9999px;
}

.player-card-xp-percent {
  font-size: 0.625rem;
  color: var(--text-muted);
}

/* XP Total */
.player-card-xp-total {
  padding: 0.5rem;
  background: var(--glass-bg);
  border-radius: 0.5rem;
  text-align: center;
  margin-bottom: 0.75rem;
}

.player-card-xp-value {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
}

.player-card-xp-label {
  font-size: 0.625rem;
  color: var(--text-muted);
}

/* Mini Funil */
.player-card-funnel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.5rem;
}

.player-card-stat {
  text-align: center;
}

.player-card-stat-value {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
}

.player-card-stat-value.contacts { color: var(--neon-cyan); }
.player-card-stat-value.meetings { color: var(--neon-yellow); }
.player-card-stat-value.sales { color: var(--neon-green); }

.player-card-stat-label {
  font-size: 0.5rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.player-card-funnel-arrow {
  color: var(--text-muted);
  opacity: 0.3;
}

/* Badges */
.player-card-badges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.75rem;
  border-top: 1px solid var(--border-subtle);
}

.player-card-badge {
  font-size: 1rem;
}

/* Status indicator */
.player-card-status {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
}

.player-card-status.on-fire { background: var(--neon-orange); animation: pulse 1s infinite; }
.player-card-status.on-pace { background: var(--neon-green); }
.player-card-status.slow { background: var(--neon-yellow); animation: pulse 1s infinite; }
.player-card-status.offline { background: var(--text-disabled); }
```

### 7.3 Leaderboard

```css
.leaderboard {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;
  overflow: hidden;
}

.leaderboard-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.leaderboard-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.leaderboard-list {
  padding: 0.5rem;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.5rem;
  border-radius: 0.5rem;
  transition: background 150ms ease;
}

.leaderboard-item:hover {
  background: var(--glass-bg);
}

.leaderboard-item.rank-1 {
  background: var(--rank-gold-bg);
}

.leaderboard-position {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.625rem;
  font-weight: 700;
}

.leaderboard-position.rank-1 { background: var(--rank-gold); color: var(--text-inverse); }
.leaderboard-position.rank-2 { background: var(--rank-silver); color: var(--text-inverse); }
.leaderboard-position.rank-3 { background: var(--rank-bronze); color: white; }
.leaderboard-position.rank-other { background: var(--glass-bg); color: var(--text-muted); }

.leaderboard-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
}

.leaderboard-info {
  flex: 1;
  min-width: 0;
}

.leaderboard-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.leaderboard-meta {
  font-size: 0.625rem;
  color: var(--text-muted);
}

.leaderboard-score {
  text-align: right;
}

.leaderboard-score-value {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 700;
}

.leaderboard-score-label {
  font-size: 0.5rem;
  color: var(--text-muted);
}
```

### 7.4 Daily Quest Card

```css
.quest-card {
  background: var(--glass-bg);
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 150ms ease;
}

.quest-card.completed {
  background: var(--neon-green-bg);
  border-color: rgba(0, 255, 136, 0.20);
}

.quest-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.quest-card-task {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.quest-card.completed .quest-card-task {
  text-decoration: line-through;
  color: var(--neon-green);
}

.quest-card-reward {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent);
}

.quest-card-progress {
  height: 0.375rem;
  background: var(--glass-bg);
  border-radius: 9999px;
  overflow: hidden;
}

.quest-card-progress-fill {
  height: 100%;
  border-radius: 9999px;
  background: var(--accent);
  transition: width 300ms ease;
}

.quest-card.completed .quest-card-progress-fill {
  background: var(--neon-green);
}
```

### 7.5 XP Feed (Live Activity)

```css
.xp-feed {
  max-height: 300px;
  overflow-y: auto;
}

.xp-feed-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  background: var(--bg-elevated);
}

.xp-feed-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--neon-green);
  animation: pulse 1s infinite;
}

.xp-feed-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.xp-feed-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.xp-feed-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--border-subtle);
  border-radius: 0.5rem;
  animation: slideIn 300ms ease;
}

.xp-feed-avatar {
  font-size: 1rem;
}

.xp-feed-text {
  flex: 1;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.xp-feed-xp {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--neon-green);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### 7.6 Badge Display

```css
.badge-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge-item {
  position: relative;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  border: 1px solid var(--border-default);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 150ms ease;
}

.badge-item:hover {
  transform: scale(1.1) rotate(5deg);
}

/* Raridade */
.badge-item.legendary {
  border-color: var(--rank-gold);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
}

.badge-item.epic {
  border-color: var(--neon-purple);
  box-shadow: 0 0 15px var(--neon-purple-glow);
}

.badge-item.rare {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 10px var(--neon-cyan-glow);
}

.badge-item.common {
  border-color: var(--border-default);
}

/* Locked */
.badge-item.locked {
  opacity: 0.3;
  filter: grayscale(1);
}

.badge-item.locked::after {
  content: '🔒';
  position: absolute;
  font-size: 0.75rem;
}
```

### 7.7 Streak Counter

```css
.streak-counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--neon-orange-bg);
  border: 1px solid rgba(255, 159, 67, 0.30);
  border-radius: 9999px;
}

.streak-icon {
  font-size: 1rem;
}

.streak-value {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--neon-orange);
}

.streak-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Animação de fogo */
.streak-counter.active .streak-icon {
  animation: flame 0.5s ease infinite alternate;
}

@keyframes flame {
  from { transform: scale(1) rotate(-5deg); }
  to { transform: scale(1.1) rotate(5deg); }
}
```

---

## 8. Superdash (Performance Cockpit)

### 8.1 Gauge (Velocímetro)

```css
.gauge {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.75rem;
}

.gauge-svg {
  overflow: visible;
}

/* Arco de fundo */
.gauge-track {
  fill: none;
  stroke: var(--glass-bg);
  stroke-width: 14;
  stroke-linecap: round;
}

/* Arco de progresso */
.gauge-progress {
  fill: none;
  stroke: url(#gaugeGradient);
  stroke-width: 14;
  stroke-linecap: round;
  filter: drop-shadow(0 0 6px var(--neon-green-glow));
  transition: stroke-dashoffset 1.5s cubic-bezier(0.32, 0.72, 0, 1);
}

/* Labels numéricos */
.gauge-label {
  font-size: 0.625rem;
  fill: var(--text-muted);
  text-anchor: middle;
}

/* Ponteiro */
.gauge-pointer {
  transform-origin: center;
  transition: transform 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.gauge-pointer-line {
  stroke: white;
  stroke-width: 2.5;
  stroke-linecap: round;
}

.gauge-pointer-center-outer {
  fill: var(--bg-deep);
  stroke: var(--border-default);
  stroke-width: 2;
}

.gauge-pointer-center-inner {
  fill: var(--neon-green);
}

/* Valor central */
.gauge-value-container {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.gauge-value {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

.gauge-value.status-critical { color: var(--neon-red); text-shadow: 0 0 30px var(--neon-red-glow); }
.gauge-value.status-warning { color: var(--neon-orange); text-shadow: 0 0 30px var(--neon-orange-glow); }
.gauge-value.status-attention { color: var(--neon-yellow); text-shadow: 0 0 30px var(--neon-yellow-glow); }
.gauge-value.status-good { color: var(--neon-green); text-shadow: 0 0 30px var(--neon-green-glow); }

.gauge-status {
  font-size: 0.625rem;
  margin-top: 0.25rem;
}

.gauge-detail {
  font-size: 0.625rem;
  color: var(--text-muted);
}
```

### 8.2 Insight Alert Bar

```css
.insight-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: 9999px;
  backdrop-filter: blur(8px);
  max-width: fit-content;
  margin: 0 auto;
}

.insight-alert.type-warning {
  background: var(--neon-yellow-bg);
  border: 1px solid rgba(255, 224, 102, 0.30);
}

.insight-alert.type-insight {
  background: var(--accent-muted);
  border: 1px solid var(--border-accent);
}

.insight-alert.type-success {
  background: var(--neon-green-bg);
  border: 1px solid rgba(0, 255, 136, 0.30);
}

.insight-alert.type-critical {
  background: var(--neon-red-bg);
  border: 1px solid rgba(255, 71, 87, 0.30);
}

.insight-alert-icon {
  font-size: 1rem;
}

.insight-alert-message {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
```

### 8.3 Superdash Layout

```css
.superdash {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-void) 0%, var(--bg-deep) 50%, var(--bg-void) 100%);
  padding: 1.5rem;
}

.superdash-container {
  max-width: 1400px;
  margin: 0 auto;
}

.superdash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.superdash-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.superdash-title h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.superdash-live-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: var(--neon-green-bg);
  border: 1px solid rgba(0, 255, 136, 0.30);
  border-radius: 9999px;
  font-size: 0.75rem;
  color: var(--neon-green);
}

.superdash-live-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
  background: var(--neon-green);
  animation: pulse 1s infinite;
}

/* Tier 1: Hero Section (Gauges) */
.superdash-hero {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 1.5rem;
  padding: 2rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(var(--glass-blur));
}

.superdash-hero-title {
  text-align: center;
  margin-bottom: 1.5rem;
}

.superdash-hero-title h2 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.superdash-hero-title p {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.superdash-gauges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4rem;
  margin-bottom: 1.5rem;
}

/* Tier 2: Grid principal */
.superdash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .superdash-grid {
    grid-template-columns: 1fr;
  }
}

.superdash-main {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.superdash-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Seções */
.superdash-section {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  padding: 1.25rem;
}

.superdash-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}
```

### 8.4 Trend Chart

```css
.trend-chart {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  padding: 1.25rem;
}

.trend-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.trend-chart-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.trend-chart-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.trend-chart-change {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.trend-chart-change-value {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 600;
}

.trend-chart-change-value.positive { color: var(--neon-green-soft); }
.trend-chart-change-value.negative { color: var(--neon-red-soft); }

.trend-chart-change-label {
  font-size: 0.625rem;
  color: var(--text-muted);
}

/* Recharts customization */
.trend-chart .recharts-cartesian-grid-horizontal line {
  stroke: var(--border-subtle);
}

.trend-chart .recharts-cartesian-grid-vertical line {
  display: none;
}

.trend-chart .recharts-text {
  fill: var(--text-muted);
  font-size: 0.75rem;
}

.trend-chart-tooltip {
  background: var(--bg-elevated) !important;
  border: 1px solid var(--border-default) !important;
  border-radius: 0.5rem !important;
  padding: 0.75rem !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
}
```

---

## 9. Sistema de Níveis RPG

### 9.1 Configuração de Progressão

```typescript
// Curva de XP balanceada (estilo games AAA)
const LEVEL_CONFIG = {
  BASE_XP: 50,
  EXPONENT: 1.5,
  MAX_LEVEL: 50,
};

// XP por ação
const XP_ACTIONS = {
  // Input (Esforço)
  MOVE_CARD: 2,
  ADD_NOTE: 5,
  MAKE_CALL: 5,
  SEND_WHATSAPP: 3,
  SEND_EMAIL: 4,
  FIRST_CONTACT_DAY: 10,
  
  // Output (Resultado)
  SCHEDULE_MEETING: 25,
  COMPLETE_MEETING: 30,
  SEND_PROPOSAL: 20,
  CLOSE_SALE_SMALL: 100,    // < R$ 5k
  CLOSE_SALE_MEDIUM: 150,   // R$ 5k - 20k
  CLOSE_SALE_LARGE: 200,    // R$ 20k - 50k
  CLOSE_SALE_ENTERPRISE: 300, // > R$ 50k
  
  // Streaks
  STREAK_3_DAYS: 50,
  STREAK_5_DAYS: 100,
  STREAK_7_DAYS: 200,
  PERFECT_WEEK: 300,
  
  // Bônus
  FIRST_SALE_OF_DAY: 25,
  BEAT_WEEKLY_GOAL: 150,
  BEAT_MONTHLY_GOAL: 500,
};

// Ranks por faixa de nível
const RANKS = {
  BRONZE: { min: 1, max: 9 },
  SILVER: { min: 10, max: 19 },
  GOLD: { min: 20, max: 29 },
  PLATINUM: { min: 30, max: 39 },
  DIAMOND: { min: 40, max: 49 },
  ICON: { min: 50, max: 50 },
};

// Títulos por nível
const TITLES = {
  1: { title: 'Novato', icon: '🌱' },
  3: { title: 'Aprendiz', icon: '📗' },
  5: { title: 'Vendedor Jr.', icon: '💼' },
  10: { title: 'Vendedor', icon: '💼✨' },
  15: { title: 'Especialista', icon: '🎯' },
  20: { title: 'Consultor', icon: '🏅' },
  25: { title: 'Closer', icon: '🔥' },
  30: { title: 'Hunter', icon: '🦅' },
  35: { title: 'Mestre', icon: '⚔️' },
  40: { title: 'Lenda', icon: '🏆' },
  45: { title: 'Lenda Viva', icon: '🏆✨' },
  50: { title: 'ÍCONE', icon: '💎' },
};
```

### 9.2 Tabela de Progressão

| Nível | XP p/ Subir | XP Total | Tempo Est. | Título | Rank |
|-------|-------------|----------|------------|--------|------|
| 1→2 | 25 | 25 | 5 min | Novato | Bronze |
| 2→3 | 50 | 75 | 15 min | Novato | Bronze |
| 3→4 | 75 | 150 | 30 min | Aprendiz | Bronze |
| 4→5 | 100 | 250 | 1 hora | Aprendiz | Bronze |
| 5→6 | 150 | 400 | 2 horas | **Vendedor Jr.** | Bronze |
| ... | ... | ... | ... | ... | ... |
| 9→10 | 450 | 1.675 | **1 dia** | Vendedor Jr. | Bronze |
| 10→11 | 550 | 2.225 | 1.5 dias | **Vendedor** | **Prata** |
| ... | ... | ... | ... | ... | ... |
| 19→20 | 2.300 | 14.600 | **~2 semanas** | Consultor | Prata |
| 20→21 | 2.700 | 17.300 | 2.5 semanas | **Consultor** | **Ouro** |
| ... | ... | ... | ... | ... | ... |
| 29→30 | 5.500 | 50.000 | **~2 meses** | Hunter | Ouro |
| 30→31 | 6.200 | 56.200 | 2.5 meses | **Hunter** | **Platina** |
| ... | ... | ... | ... | ... | ... |
| 39→40 | 12.000 | 150.000 | **~6 meses** | Mestre | Platina |
| 40→41 | 14.000 | 164.000 | 7 meses | **Lenda** | **Diamante** |
| ... | ... | ... | ... | ... | ... |
| 49→50 | 35.000 | 500.000 | **~2 anos** | Lenda Viva | Diamante |
| 50 | — | 500.000+ | — | **ÍCONE** | **Ícone** |

### 9.3 Level Up Animation

```css
.level-up-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-level-up);
}

.level-up-content {
  text-align: center;
  position: relative;
}

/* Partículas de fundo */
.level-up-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.level-up-particle {
  position: absolute;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  animation: particleRise 2s ease-out infinite;
}

@keyframes particleRise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) scale(0.5);
    opacity: 0;
  }
}

/* Ícone animado */
.level-up-icon {
  font-size: 5rem;
  animation: levelUpBounce 1s ease infinite;
}

@keyframes levelUpBounce {
  0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
  25% { transform: translateY(-15px) scale(1.1) rotate(-5deg); }
  75% { transform: translateY(-15px) scale(1.1) rotate(5deg); }
}

/* Texto principal */
.level-up-title {
  font-family: var(--font-display);
  font-size: 4rem;
  font-weight: 900;
  margin: 1rem 0;
  animation: levelUpGlow 1s ease infinite alternate;
}

@keyframes levelUpGlow {
  from { text-shadow: 0 0 20px currentColor; }
  to { text-shadow: 0 0 40px currentColor, 0 0 60px currentColor; }
}

.level-up-subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.level-up-level {
  font-family: var(--font-display);
  font-size: 5rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.level-up-new-title {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Badge de rank (se mudou) */
.level-up-rank-badge {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 600;
  animation: rankPop 0.5s ease 0.5s both;
}

@keyframes rankPop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.level-up-dismiss {
  margin-top: 2rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  animation: fadeIn 1s ease 1s both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### 9.4 Level Progress Component

```css
.level-progress {
  text-align: center;
}

.level-progress-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.level-progress-level {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.level-progress-title {
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.level-progress-bar-container {
  margin-bottom: 0.5rem;
}

.level-progress-bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.625rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.level-progress-bar {
  height: 0.75rem;
  background: var(--glass-bg);
  border-radius: 9999px;
  overflow: hidden;
}

.level-progress-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 1s ease;
}

.level-progress-xp-text {
  font-size: 0.625rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.level-progress-next {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
}

.level-progress-next-label {
  font-size: 0.625rem;
  color: var(--text-muted);
}

.level-progress-next-value {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
}
```

---

## 10. Animações & Microinterações

### 10.1 Durations & Easings

```css
/* Durações */
--duration-instant: 50ms;
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--duration-slower: 600ms;
--duration-slowest: 1000ms;

/* Easings */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-spring: cubic-bezier(0.32, 0.72, 0, 1);

/* Framer Motion defaults */
--spring-default: { type: "spring", stiffness: 300, damping: 30 };
--spring-bouncy: { type: "spring", stiffness: 400, damping: 25 };
--spring-gentle: { type: "spring", stiffness: 200, damping: 40 };
```

### 10.2 Animações Reutilizáveis

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide In (várias direções) */
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Scale In */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Spin */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Shake (erro) */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Bounce */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Glow pulse */
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px currentColor; }
  50% { box-shadow: 0 0 40px currentColor; }
}

/* Number count up (via Framer Motion ou JS) */
.animate-count-up {
  transition: none;
}
```

### 10.3 Microinterações Específicas

```css
/* Hover lift */
.hover-lift {
  transition: transform var(--duration-fast) var(--ease-out);
}
.hover-lift:hover {
  transform: translateY(-2px);
}

/* Hover glow */
.hover-glow {
  transition: box-shadow var(--duration-normal) var(--ease-out);
}
.hover-glow:hover {
  box-shadow: 0 0 30px var(--accent-glow);
}

/* Press scale */
.press-scale:active {
  transform: scale(0.98);
}

/* XP popup animation */
.xp-popup {
  animation: xpPopup 1s var(--ease-out) forwards;
}

@keyframes xpPopup {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(0.8);
  }
}

/* Card drag feedback */
.dragging {
  transform: rotate(3deg) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  cursor: grabbing;
}

/* Level ring fill */
.level-ring-animate {
  stroke-dashoffset: var(--ring-circumference);
  animation: ringFill 1.5s var(--ease-spring) forwards;
}

@keyframes ringFill {
  to {
    stroke-dashoffset: var(--ring-target);
  }
}

/* Gauge pointer spring */
.gauge-pointer-animate {
  animation: gaugePointer 1.5s var(--ease-bounce) forwards;
}

@keyframes gaugePointer {
  0% { transform: rotate(-135deg); }
  100% { transform: rotate(var(--pointer-angle)); }
}

/* Confetti burst (via canvas-confetti library) */
.confetti-trigger {
  /* Triggered via JS: confetti({ particleCount: 100, spread: 70 }) */
}
```

### 10.4 Framer Motion Presets

```typescript
// Presets para uso com Framer Motion

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { type: "spring", stiffness: 300, damping: 30 },
};

export const staggerChildren = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export const levelUp = {
  initial: { scale: 0, rotate: -10 },
  animate: { scale: 1, rotate: 0 },
  exit: { scale: 0, rotate: 10 },
  transition: { type: "spring", stiffness: 200, damping: 15 },
};

export const gaugePointer = (angle: number) => ({
  initial: { rotate: -135 },
  animate: { rotate: angle },
  transition: { type: "spring", stiffness: 50, damping: 15, delay: 0.3 },
});

export const xpCounter = (target: number) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 },
  // Use useMotionValue + animate para contador
});
```

---

## 11. Estados & Feedback

### 11.1 Loading States

```css
/* Skeleton shimmer */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--glass-bg) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    var(--glass-bg) 75%
  );
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s infinite;
  border-radius: 0.25rem;
}

@keyframes skeletonShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-text { height: 1rem; width: 100%; }
.skeleton-text-sm { height: 0.75rem; width: 80%; }
.skeleton-avatar { width: 2.5rem; height: 2.5rem; border-radius: 9999px; }
.skeleton-card { height: 120px; }

/* Spinner */
.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid var(--glass-bg);
  border-top-color: var(--accent);
  border-radius: 9999px;
  animation: spin 0.8s linear infinite;
}

.spinner-sm { width: 1rem; height: 1rem; }
.spinner-lg { width: 2rem; height: 2rem; }

/* Dots loader */
.dots-loader {
  display: flex;
  gap: 0.25rem;
}

.dots-loader span {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--accent);
  animation: dotPulse 1s ease infinite;
}

.dots-loader span:nth-child(2) { animation-delay: 0.2s; }
.dots-loader span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.5); opacity: 0.5; }
}
```

### 11.2 Empty States

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state-icon {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1.5rem;
  color: var(--text-muted);
  opacity: 0.5;
}

.empty-state-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state-description {
  font-size: 0.875rem;
  color: var(--text-muted);
  max-width: 300px;
  margin-bottom: 1.5rem;
}

.empty-state-action {
  /* Use .btn-primary ou .btn-secondary */
}
```

### 11.3 Error States

```css
.error-state {
  text-align: center;
  padding: 2rem;
}

.error-state-icon {
  width: 3rem;
  height: 3rem;
  color: var(--neon-red);
  margin-bottom: 1rem;
}

.error-state-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.error-state-message {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

/* Inline error */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--neon-red);
  margin-top: 0.5rem;
}

.error-message-icon {
  width: 0.875rem;
  height: 0.875rem;
}
```

### 11.4 Success States

```css
.success-message {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--neon-green-soft);
}

/* XP Gained feedback */
.xp-gained {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--neon-green-bg);
  border: 1px solid rgba(0, 255, 136, 0.30);
  border-radius: 0.75rem;
  animation: xpGainedSlide 3s ease forwards;
  z-index: var(--z-toast);
}

.xp-gained-icon {
  font-size: 1.25rem;
}

.xp-gained-text {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--neon-green);
}

.xp-gained-action {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@keyframes xpGainedSlide {
  0% { opacity: 0; transform: translateX(100%); }
  10% { opacity: 1; transform: translateX(0); }
  90% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(100%); }
}
```

### 11.5 Toast Notifications

```css
.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  max-width: 400px;
  animation: toastSlide 0.3s ease;
}

@keyframes toastSlide {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.toast-description {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.toast-close {
  color: var(--text-muted);
  cursor: pointer;
}

.toast-close:hover {
  color: var(--text-primary);
}

/* Variantes */
.toast-success { border-left: 3px solid var(--neon-green-soft); }
.toast-success .toast-icon { color: var(--neon-green-soft); }

.toast-error { border-left: 3px solid var(--neon-red-soft); }
.toast-error .toast-icon { color: var(--neon-red-soft); }

.toast-warning { border-left: 3px solid var(--neon-yellow-soft); }
.toast-warning .toast-icon { color: var(--neon-yellow-soft); }

.toast-info { border-left: 3px solid var(--neon-cyan-soft); }
.toast-info .toast-icon { color: var(--neon-cyan-soft); }

/* Toast de XP */
.toast-xp {
  background: var(--neon-green-bg);
  border: 1px solid rgba(0, 255, 136, 0.30);
}

.toast-xp .toast-icon {
  font-size: 1.5rem;
}

.toast-xp .toast-title {
  font-family: var(--font-display);
  color: var(--neon-green);
}
```

---

## 12. Acessibilidade

### 12.1 Contraste

| Combinação | Ratio | Status |
|------------|-------|--------|
| #FFFFFF / #0F0F0F | 19.6:1 | ✅ AAA |
| #FFFFFF / #181818 | 14.5:1 | ✅ AAA |
| #FFFFFF / #222222 | 11.5:1 | ✅ AAA |
| #B0B0B0 / #181818 | 8.1:1 | ✅ AAA |
| #888888 / #181818 | 4.6:1 | ✅ AA |
| #DECCA8 / #0F0F0F | 9.8:1 | ✅ AAA |
| #00FF88 / #0F0F0F | 12.3:1 | ✅ AAA |
| #FF4757 / #0F0F0F | 5.2:1 | ✅ AA |

### 12.2 Focus States

```css
/* Focus visible padrão */
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--accent);
}

/* Focus em inputs */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-muted);
}

/* Focus em cards interativos */
.card:focus-visible,
.kanban-card:focus-visible,
.player-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Focus em botões */
.btn:focus-visible {
  box-shadow: 0 0 0 3px var(--accent-muted);
}
```

### 12.3 ARIA Labels

```tsx
// Kanban
<div role="region" aria-label="Pipeline de vendas">
  <div role="list" aria-label={`Coluna ${status.name}`}>
    <div 
      role="listitem" 
      aria-label={`Lead: ${lead.name}, Score: ${lead.score}`}
      tabIndex={0}
    />
  </div>
</div>

// Gauge
<div 
  role="meter" 
  aria-valuenow={70} 
  aria-valuemin={0} 
  aria-valuemax={100}
  aria-label="Empenho Comercial: 70%"
/>

// Player Card
<div 
  role="article" 
  aria-label={`${player.name}, Nível ${player.level}, ${player.title}`}
/>

// Progress
<div 
  role="progressbar" 
  aria-valuenow={78} 
  aria-valuemin={0} 
  aria-valuemax={100}
  aria-label="Progresso para próximo nível: 78%"
/>

// Screen reader only
<span className="sr-only">Novo badge desbloqueado</span>
```

### 12.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Manter funcionalidade de progresso */
  .progress-fill,
  .level-ring,
  .gauge-progress {
    transition: none;
  }
}
```

### 12.5 Keyboard Navigation

```css
/* Skip link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  padding: 1rem;
  background: var(--accent);
  color: var(--text-inverse);
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
}
```

| Atalho | Ação |
|--------|------|
| `Tab` | Navegar entre elementos |
| `Shift + Tab` | Navegar para trás |
| `Enter` / `Space` | Ativar elemento |
| `Escape` | Fechar modal/dropdown |
| `Arrow Keys` | Navegar em listas |
| `Home` / `End` | Ir para início/fim |

---

## 13. Tokens CSS Completos

```css
:root {
  /* ========== CORES ========== */
  
  /* Fundos */
  --bg-void: #050505;
  --bg-base: #0A0A0A;
  --bg-deep: #0F0F0F;
  --bg-primary: #181818;
  --bg-elevated: #222222;
  --bg-surface: #1C1C1C;
  --bg-hover: #2A2A2A;
  --bg-active: #333333;
  
  /* Glass */
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-bg-hover: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur: 12px;
  
  /* Accent (Champagne) */
  --accent: #DECCA8;
  --accent-light: #E8DBC4;
  --accent-dark: #B8A882;
  --accent-muted: rgba(222, 204, 168, 0.15);
  --accent-glow: rgba(222, 204, 168, 0.30);
  
  /* Neon */
  --neon-green: #00FF88;
  --neon-green-soft: #22C55E;
  --neon-green-bg: rgba(0, 255, 136, 0.10);
  --neon-green-glow: rgba(0, 255, 136, 0.40);
  
  --neon-yellow: #FFE066;
  --neon-yellow-soft: #F59E0B;
  --neon-yellow-bg: rgba(255, 224, 102, 0.10);
  --neon-yellow-glow: rgba(255, 224, 102, 0.40);
  
  --neon-orange: #FF9F43;
  --neon-orange-bg: rgba(255, 159, 67, 0.10);
  --neon-orange-glow: rgba(255, 159, 67, 0.40);
  
  --neon-red: #FF4757;
  --neon-red-soft: #EF4444;
  --neon-red-bg: rgba(255, 71, 87, 0.10);
  --neon-red-glow: rgba(255, 71, 87, 0.40);
  
  --neon-cyan: #00D4FF;
  --neon-cyan-soft: #3B82F6;
  --neon-cyan-bg: rgba(0, 212, 255, 0.10);
  --neon-cyan-glow: rgba(0, 212, 255, 0.40);
  
  --neon-purple: #A855F7;
  --neon-purple-soft: #8B5CF6;
  --neon-purple-bg: rgba(168, 85, 247, 0.10);
  --neon-purple-glow: rgba(168, 85, 247, 0.40);
  
  /* Texto */
  --text-primary: #FFFFFF;
  --text-secondary: #B0B0B0;
  --text-muted: #888888;
  --text-disabled: #555555;
  --text-inverse: #0F0F0F;
  --text-accent: #DECCA8;
  
  /* Bordas */
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.20);
  --border-accent: rgba(222, 204, 168, 0.30);
  --border-focus: rgba(222, 204, 168, 0.50);
  
  /* Status Pipeline */
  --status-inbox: #6B7280;
  --status-qualified: #22C55E;
  --status-attempted: #F59E0B;
  --status-contacted: #3B82F6;
  --status-meeting: #8B5CF6;
  --status-won: #10B981;
  --status-lost: #EF4444;
  --status-disqualified: #6B7280;
  
  /* Ranks */
  --rank-bronze: #CD7F32;
  --rank-bronze-bg: rgba(205, 127, 50, 0.15);
  --rank-silver: #C0C0C0;
  --rank-silver-bg: rgba(192, 192, 192, 0.15);
  --rank-gold: #FFD700;
  --rank-gold-bg: rgba(255, 215, 0, 0.15);
  --rank-platinum: #E5E4E2;
  --rank-platinum-bg: rgba(229, 228, 226, 0.15);
  --rank-diamond: #B9F2FF;
  --rank-diamond-bg: rgba(185, 242, 255, 0.15);
  --rank-icon: #FF00FF;
  --rank-icon-bg: rgba(255, 0, 255, 0.15);
  
  /* ========== TIPOGRAFIA ========== */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Space Grotesk', 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  --text-6xl: 3.75rem;
  --text-7xl: 4.5rem;
  
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-black: 900;
  
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* ========== ESPAÇAMENTO ========== */
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  
  /* ========== LAYOUT ========== */
  --sidebar-width: 240px;
  --sidebar-collapsed: 72px;
  --header-height: 64px;
  --content-max-width: 1440px;
  --kanban-column-width: 320px;
  --kanban-column-gap: 16px;
  --kanban-card-gap: 12px;
  --gauge-size-sm: 160px;
  --gauge-size-md: 200px;
  --gauge-size-lg: 240px;
  --kpi-card-min-width: 180px;
  --player-card-width: 280px;
  --modal-sm: 400px;
  --modal-md: 540px;
  --modal-lg: 720px;
  --sheet-width: 540px;
  
  /* ========== BORDAS ========== */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
  
  /* ========== BREAKPOINTS ========== */
  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
  --bp-2xl: 1536px;
  --bp-tv: 1920px;
  
  /* ========== Z-INDEX ========== */
  --z-base: 0;
  --z-dropdown: 50;
  --z-sticky: 100;
  --z-modal-backdrop: 150;
  --z-modal: 200;
  --z-popover: 250;
  --z-toast: 300;
  --z-tooltip: 350;
  --z-level-up: 400;
  --z-max: 9999;
  
  /* ========== ANIMAÇÕES ========== */
  --duration-instant: 50ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-slower: 600ms;
  --duration-slowest: 1000ms;
  
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring: cubic-bezier(0.32, 0.72, 0, 1);
  
  /* ========== SOMBRAS ========== */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 20px 50px rgba(0, 0, 0, 0.5);
  --glow-accent: 0 0 20px var(--accent-glow);
  --glow-green: 0 0 20px var(--neon-green-glow);
  --glow-yellow: 0 0 20px var(--neon-yellow-glow);
  --glow-red: 0 0 20px var(--neon-red-glow);
}

/* ========== UTILITÁRIOS TAILWIND ========== */
@layer utilities {
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
  }
  
  .glass-hover:hover {
    background: var(--glass-bg-hover);
  }
  
  .text-gradient-accent {
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .font-display {
    font-family: var(--font-display);
  }
  
  .glow-accent {
    box-shadow: var(--glow-accent);
  }
  
  .glow-green {
    box-shadow: var(--glow-green);
  }
  
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: var(--glass-bg);
    border-radius: 3px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: var(--glass-bg-hover);
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}
```

---

## Apêndice A: Mapeamento de Status

| Status | ID | Cor | Ícone |
|--------|-----|-----|-------|
| Lista Fria | INBOX | #6B7280 | Inbox |
| Qualificado | NEW | #22C55E | CheckCircle |
| Tentativa | ATTEMPTED | #F59E0B | PhoneOutgoing |
| Contatado | CONTACTED | #3B82F6 | MessageCircle |
| Reunião | MEETING | #8B5CF6 | Calendar |
| Ganho | WON | #10B981 | Trophy |
| Perdido | LOST | #EF4444 | XCircle |
| Desqualificado | DISQUALIFIED | #6B7280 | Ban |

## Apêndice B: Mapeamento de Badges

| Badge | ID | Ícone | Raridade | Requisito |
|-------|-----|-------|----------|-----------|
| The Closer | closer | 🎯 | Legendary | Maior conversão da semana |
| Machine Gun | machine | ⚡ | Epic | Mais contatos da semana |
| On Fire | streak | 🔥 | Rare | 5 dias consecutivos |
| Early Bird | early | 🐦 | Common | Primeiro contato antes 9h |
| First Blood | first | 🩸 | Common | Primeira venda do dia |
| Comeback Kid | comeback | 💪 | Epic | Superou meta após início ruim |
| Perfect Week | perfect | ⭐ | Epic | 5/5 dias no ritmo |

## Apêndice C: Checklist de Implementação

**Componentes Base:**
- [ ] Button (todas variantes + XP)
- [ ] Input, Select, Checkbox, RadioGroup, Slider
- [ ] Badge (status + ranks + XP)
- [ ] Card, CardGlass, CardGame
- [ ] Progress (todos tamanhos + XP)
- [ ] Avatar (com ring de level)
- [ ] Tooltip (básico + rico)
- [ ] Dialog, Sheet, Dropdown
- [ ] Table, Tabs, Toast

**Componentes CRM:**
- [ ] KanbanBoard, Column, Card
- [ ] LeadSheet, QualificationForm
- [ ] ActivityTimeline
- [ ] KPICard

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
- [ ] SuperdashLayout

**Animações:**
- [ ] LevelUpCelebration
- [ ] XPPopup
- [ ] Confetti integration
- [ ] Framer Motion presets

**Estados:**
- [ ] Skeleton loaders
- [ ] Spinners
- [ ] Empty states
- [ ] Error states
- [ ] Toast notifications

---

**Versão:** 2.0.0  
**Data:** Janeiro 2026  
**Mantido por:** Equipe Dashformance  
**Stack:** Next.js 15+ | React 19 | TailwindCSS v4 | Radix UI | Framer Motion