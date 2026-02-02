# Dashformance Design System v1.0

> **CRM de Prospecção B2B para o Mercado Brasileiro**  
> **Versão:** 1.0.0  
> **Última Atualização:** Janeiro 2026  
> **Stack:** Next.js 16 + React 19 + TailwindCSS v4 + Radix UI

---

## Sumário

1. [Fundamentos](#1-fundamentos)
2. [Paleta de Cores](#2-paleta-de-cores)
3. [Tipografia](#3-tipografia)
4. [Espaçamento & Grid](#4-espaçamento--grid)
5. [Componentes Base](#5-componentes-base)
6. [Componentes de Negócio](#6-componentes-de-negócio)
7. [Padrões de Interação](#7-padrões-de-interação)
8. [Estados & Feedback](#8-estados--feedback)
9. [Acessibilidade](#9-acessibilidade)
10. [Tokens CSS](#10-tokens-css)

---

## 1. Fundamentos

### 1.1 Filosofia de Design

O Dashformance adota a estética **"Liquid Glass + Champagne"**, caracterizada por:

- **Profundidade visual** através de camadas com transparência
- **Elegância minimalista** com tons escuros e acentos dourados
- **Glassmorphism sutil** para elevação de elementos
- **Microinterações fluidas** que guiam o usuário

### 1.2 Princípios

| Princípio | Aplicação |
|-----------|-----------|
| **Clareza** | Informação hierarquizada, sem ruído visual |
| **Eficiência** | Ações principais sempre acessíveis |
| **Consistência** | Padrões repetidos em toda a aplicação |
| **Feedback** | Toda ação tem resposta visual imediata |

### 1.3 Diretrizes Gerais

```
✓ Usar fundos escuros para reduzir fadiga visual
✓ Reservar cor de destaque (champagne) para CTAs e métricas importantes
✓ Manter contraste mínimo de 4.5:1 para texto
✓ Bordas sutis (white/5 a white/10) para separação de elementos
✗ Evitar gradientes coloridos em excesso
✗ Evitar sombras pesadas (preferir bordas e glassmorphism)
```

---

## 2. Paleta de Cores

### 2.1 Cores Primárias

```css
/* Fundos */
--color-bg-base: #0F0F0F;           /* Fundo da aplicação */
--color-bg-primary: #181818;        /* Fundo principal de seções */
--color-bg-elevated: #222222;       /* Cards, modais, inputs */
--color-bg-surface: #1C1C1C;        /* Superfícies intermediárias */
--color-bg-hover: #2A2A2A;          /* Estado hover */
--color-bg-active: #333333;         /* Estado active/pressed */

/* Acento - Champagne */
--color-accent: #DECCA8;            /* Cor principal de destaque */
--color-accent-light: #E8DBC4;      /* Variação clara */
--color-accent-dark: #B8A882;       /* Variação escura */
--color-accent-muted: rgba(222, 204, 168, 0.15); /* Para fundos sutis */

/* Texto */
--color-text-primary: #FFFFFF;      /* Texto principal */
--color-text-secondary: #B0B0B0;    /* Texto secundário */
--color-text-muted: #888888;        /* Texto desabilitado/sutil */
--color-text-inverse: #0F0F0F;      /* Texto sobre fundo claro */

/* Bordas */
--color-border-subtle: rgba(255, 255, 255, 0.05);  /* Divisórias sutis */
--color-border-default: rgba(255, 255, 255, 0.10); /* Bordas padrão */
--color-border-strong: rgba(255, 255, 255, 0.20);  /* Bordas de foco */
--color-border-accent: rgba(222, 204, 168, 0.30);  /* Bordas de destaque */
```

### 2.2 Cores Semânticas

```css
/* Status do Pipeline */
--color-status-inbox: #6B7280;      /* Lista Fria - Cinza */
--color-status-new: #22C55E;        /* Qualificado - Verde */
--color-status-attempted: #F59E0B;  /* Tentativa - Âmbar */
--color-status-contacted: #3B82F6;  /* Contatado - Azul */
--color-status-meeting: #8B5CF6;    /* Reunião - Roxo */
--color-status-won: #10B981;        /* Ganho - Esmeralda */
--color-status-lost: #EF4444;       /* Perdido - Vermelho */
--color-status-disqualified: #6B7280; /* Desqualificado - Cinza */

/* Feedback */
--color-success: #22C55E;
--color-success-bg: rgba(34, 197, 94, 0.15);
--color-warning: #F59E0B;
--color-warning-bg: rgba(245, 158, 11, 0.15);
--color-error: #EF4444;
--color-error-bg: rgba(239, 68, 68, 0.15);
--color-info: #3B82F6;
--color-info-bg: rgba(59, 130, 246, 0.15);

/* Score de Lead */
--color-score-high: #22C55E;        /* Score 8-10 */
--color-score-medium: #F59E0B;      /* Score 4-7 */
--color-score-low: #EF4444;         /* Score 0-3 */
```

### 2.3 Gradientes

```css
/* Gradiente principal (CTAs, destaques) */
--gradient-accent: linear-gradient(135deg, #DECCA8 0%, #B8A882 100%);

/* Gradiente de fundo (cards especiais) */
--gradient-surface: linear-gradient(180deg, #222222 0%, #1C1C1C 100%);

/* Glassmorphism */
--gradient-glass: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.05) 0%,
  rgba(255, 255, 255, 0.02) 100%
);

/* Glow effects */
--glow-accent: 0 0 20px rgba(222, 204, 168, 0.3);
--glow-success: 0 0 15px rgba(34, 197, 94, 0.25);
--glow-warning: 0 0 15px rgba(245, 158, 11, 0.25);
--glow-error: 0 0 15px rgba(239, 68, 68, 0.25);
```

### 2.4 Aplicação por Contexto

| Contexto | Fundo | Texto | Borda | Acento |
|----------|-------|-------|-------|--------|
| **Página** | bg-base | text-primary | - | - |
| **Card** | bg-elevated | text-primary | border-subtle | - |
| **Input** | bg-elevated | text-primary | border-default | accent (focus) |
| **Modal** | bg-surface | text-primary | border-default | - |
| **Dropdown** | bg-elevated | text-secondary | border-subtle | bg-hover |

---

## 3. Tipografia

### 3.1 Família Tipográfica

```css
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 3.2 Escala Tipográfica

```css
--font-size-xs: 0.75rem;     /* 12px */
--font-size-sm: 0.875rem;    /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg: 1.125rem;    /* 18px */
--font-size-xl: 1.25rem;     /* 20px */
--font-size-2xl: 1.5rem;     /* 24px */
--font-size-3xl: 1.875rem;   /* 30px */
--font-size-4xl: 2.25rem;    /* 36px */

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### 3.3 Estilos de Texto

| Estilo | Tamanho | Peso | Uso |
|--------|---------|------|-----|
| **Display** | 4xl | Bold | KPIs, números de destaque |
| **H1** | 2xl | Semibold | Títulos de página |
| **H2** | xl | Semibold | Títulos de seção |
| **H3** | lg | Medium | Subtítulos, cards |
| **Body** | base | Normal | Texto corrido |
| **Body Small** | sm | Normal | Descrições |
| **Caption** | xs | Medium | Labels, metadados |
| **Mono** | sm | Normal | CNPJs, códigos |

---

## 4. Espaçamento & Grid

### 4.1 Sistema de Espaçamento

```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
```

### 4.2 Grid do Layout

```css
--sidebar-width: 240px;
--header-height: 64px;
--content-max-width: 1440px;
--kanban-column-width: 320px;
--kanban-column-gap: 16px;
--kanban-card-gap: 12px;
```

### 4.3 Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

---

## 5. Componentes Base

### 5.1 Button

**Variantes:**

```tsx
<Button variant="primary">Salvar Lead</Button>      // Fundo champagne
<Button variant="secondary">Cancelar</Button>       // Fundo #222, borda
<Button variant="ghost">Ver mais</Button>           // Transparente
<Button variant="destructive">Excluir</Button>      // Vermelho sutil
<Button variant="accent">Importar Leads</Button>    // Gradiente accent
```

**Especificação:**

```css
.button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 150ms ease;
}

.button-primary {
  background: #DECCA8;
  color: #0F0F0F;
}
.button-primary:hover {
  background: #E8DBC4;
}

.button-secondary {
  background: #222222;
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.10);
}

.button-ghost {
  background: transparent;
  color: #B0B0B0;
}
.button-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #FFFFFF;
}

.button-destructive {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}
```

**Tamanhos:**

| Tamanho | Padding | Font Size |
|---------|---------|-----------|
| sm | 6px 12px | 12px |
| md | 8px 16px | 14px |
| lg | 12px 24px | 16px |

### 5.2 Input

```css
.input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: #222222;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 0.5rem;
  color: #FFFFFF;
  font-size: 0.875rem;
}

.input::placeholder {
  color: #888888;
}

.input:focus {
  border-color: #DECCA8;
  box-shadow: 0 0 0 3px rgba(222, 204, 168, 0.15);
}

.input-error {
  border-color: #EF4444;
}
```

### 5.3 Badge

```css
.badge {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}

.badge-success { background: rgba(34, 197, 94, 0.15); color: #22C55E; }
.badge-warning { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }
.badge-error { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
.badge-info { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
.badge-neutral { background: rgba(255, 255, 255, 0.10); color: #888888; }
```

### 5.4 Card

```css
.card {
  background: #222222;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
}

.card-header { padding: 1.25rem 1.5rem 0; }
.card-content { padding: 1.25rem 1.5rem; }
.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
```

### 5.5 Dialog / Modal

```css
.dialog-overlay {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.dialog-content {
  background: #1C1C1C;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 0.75rem;
  padding: 1.5rem;
  max-width: 500px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}
```

### 5.6 Sheet (Painel Lateral)

```css
.sheet-content {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  max-width: 540px;
  background: #1C1C1C;
  border-left: 1px solid rgba(255, 255, 255, 0.10);
  padding: 1.5rem;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.3);
}
```

### 5.7 Table

```css
.table-header {
  background: rgba(255, 255, 255, 0.02);
}

.table-head {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.table-cell {
  padding: 1rem;
  font-size: 0.875rem;
  color: #FFFFFF;
}
```

### 5.8 Tabs

```css
.tabs-list {
  background: #181818;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.tabs-trigger {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #888888;
  border-radius: 0.375rem;
}

.tabs-trigger[data-state="active"] {
  background: #222222;
  color: #FFFFFF;
}
```

### 5.9 Toast

```css
.toast {
  background: #222222;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.toast-success { border-left: 3px solid #22C55E; }
.toast-error { border-left: 3px solid #EF4444; }
.toast-info { border-left: 3px solid #3B82F6; }
```

---

## 6. Componentes de Negócio

### 6.1 KanbanBoard

```css
.kanban-board {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
}

.kanban-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
}

.kanban-columns {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  overflow-x: auto;
  flex: 1;
}
```

### 6.2 KanbanColumn

```css
.kanban-column {
  flex-shrink: 0;
  width: 320px;
  background: #181818;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.kanban-column-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.kanban-column-content {
  padding: 0.75rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kanban-column.drag-over {
  background: rgba(222, 204, 168, 0.05);
  border-color: rgba(222, 204, 168, 0.20);
}
```

### 6.3 KanbanCard

```css
.kanban-card {
  background: #222222;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 0.875rem;
  cursor: grab;
  transition: all 150ms ease;
}

.kanban-card:hover {
  border-color: rgba(255, 255, 255, 0.10);
  transform: translateY(-1px);
}

/* Borda por score */
.kanban-card.score-high { border-left: 3px solid #22C55E; }
.kanban-card.score-medium { border-left: 3px solid #F59E0B; }
.kanban-card.score-low { border-left: 3px solid #EF4444; }

/* Glow para favoritos */
.kanban-card.starred {
  box-shadow: 0 0 20px rgba(222, 204, 168, 0.15);
}

.kanban-card-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #FFFFFF;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kanban-card-meta {
  font-family: var(--font-family-mono);
  font-size: 0.75rem;
  color: #888888;
}
```

### 6.4 LeadSheet

```css
.lead-sheet {
  max-width: 600px;
}

.lead-sheet-header {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.lead-info-form {
  display: grid;
  gap: 1.25rem;
}

.lead-info-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.lead-info-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### 6.5 QualificationForm

```css
.qualification-form {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.qualification-form h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 1rem;
}

.qualification-actions {
  display: flex;
  gap: 0.75rem;
}

.qualification-actions button {
  flex: 1;
}
```

### 6.6 KPI Card

```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.kpi-card {
  background: #222222;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.kpi-card-title {
  font-size: 0.875rem;
  color: #888888;
}

.kpi-card-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #FFFFFF;
}

.kpi-card-change.positive { color: #22C55E; }
.kpi-card-change.negative { color: #EF4444; }

/* Variantes de ícone */
.kpi-card.variant-success .kpi-card-icon {
  background: rgba(34, 197, 94, 0.15);
  color: #22C55E;
}

.kpi-card.variant-accent .kpi-card-icon {
  background: rgba(222, 204, 168, 0.15);
  color: #DECCA8;
}
```

### 6.7 Charts Theme (Recharts)

```tsx
const chartTheme = {
  background: 'transparent',
  textColor: '#888888',
  gridColor: 'rgba(255, 255, 255, 0.05)',
  tooltipBg: '#222222',
  tooltipBorder: 'rgba(255, 255, 255, 0.10)',
};

const statusColors = {
  INBOX: '#6B7280',
  NEW: '#22C55E',
  ATTEMPTED: '#F59E0B',
  CONTACTED: '#3B82F6',
  MEETING: '#8B5CF6',
  WON: '#10B981',
  LOST: '#EF4444',
};

const userColors = {
  João: '#DECCA8',
  Vitor: '#3B82F6',
};
```

### 6.8 ActivityTimeline

```css
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
}

.activity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  color: #888888;
}

.activity-icon.type-call { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
.activity-icon.type-email { background: rgba(139, 92, 246, 0.15); color: #8B5CF6; }
.activity-icon.type-whatsapp { background: rgba(34, 197, 94, 0.15); color: #22C55E; }
.activity-icon.type-meeting { background: rgba(222, 204, 168, 0.15); color: #DECCA8; }

.activity-time {
  font-size: 0.75rem;
  color: #888888;
}
```

---

## 7. Padrões de Interação

### 7.1 Drag and Drop

```css
/* Card sendo arrastado */
.kanban-card.is-dragging { opacity: 0.3; }

/* Preview (DragOverlay) */
.dragging-preview {
  transform: rotate(3deg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  cursor: grabbing;
}

/* Coluna recebendo item */
.kanban-column.drag-over {
  background: rgba(222, 204, 168, 0.05);
  border-color: rgba(222, 204, 168, 0.20);
}

/* Placeholder */
.drop-placeholder {
  height: 100px;
  border: 2px dashed rgba(222, 204, 168, 0.30);
  border-radius: 0.5rem;
  background: rgba(222, 204, 168, 0.05);
}
```

### 7.2 Seleção Múltipla

```css
.bulk-actions-bar {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: #222222;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  z-index: 50;
}
```

### 7.3 Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Esc` | Fechar modal/sheet |
| `Ctrl/Cmd + K` | Abrir busca |
| `Ctrl/Cmd + N` | Novo lead |
| `Delete` | Excluir selecionados |
| `Enter` | Abrir lead |
| `Space` | Selecionar/deselecionar |

### 7.4 Hover & Focus States

```css
/* Hover */
.button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.kanban-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* Focus */
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(222, 204, 168, 0.50);
}

input:focus {
  border-color: #DECCA8;
  box-shadow: 0 0 0 3px rgba(222, 204, 168, 0.15);
}
```

---

## 8. Estados & Feedback

### 8.1 Loading States

```css
/* Skeleton */
.skeleton-line {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.10) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 0.25rem;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Spinner */
.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.10);
  border-top-color: #DECCA8;
  border-radius: 9999px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 8.2 Empty States

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
  color: #888888;
}

.empty-state-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 0.5rem;
}
```

### 8.3 Error States

```css
.error-state-icon {
  width: 3rem;
  height: 3rem;
  color: #EF4444;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #EF4444;
}
```

### 8.4 Animações

```css
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;

--easing-default: cubic-bezier(0.4, 0, 0.2, 1);
--easing-out: cubic-bezier(0, 0, 0.2, 1);
--easing-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Modal enter */
@keyframes modal-enter {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

/* Sheet enter */
@keyframes sheet-enter {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

/* Toast enter */
@keyframes toast-enter {
  from { opacity: 0; transform: translateY(100%); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 9. Acessibilidade

### 9.1 Contraste

| Combinação | Ratio | Status |
|------------|-------|--------|
| #FFFFFF / #0F0F0F | 19.6:1 | ✅ AAA |
| #FFFFFF / #181818 | 14.5:1 | ✅ AAA |
| #FFFFFF / #222222 | 11.5:1 | ✅ AAA |
| #B0B0B0 / #181818 | 8.1:1 | ✅ AAA |
| #888888 / #181818 | 4.6:1 | ✅ AA |
| #DECCA8 / #0F0F0F | 9.8:1 | ✅ AAA |

### 9.2 Focus & ARIA

```tsx
// Skip link
<a href="#main" className="skip-link">Pular para o conteúdo</a>

// Kanban ARIA
<div role="region" aria-label="Pipeline de vendas">
  <div role="list" aria-label="Coluna Qualificado">
    <div role="listitem" aria-label="Lead: Empresa XYZ" tabIndex={0} />
  </div>
</div>

// Screen reader only
<span className="sr-only">Status: Qualificado</span>
```

### 9.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Tokens CSS

### 10.1 Variáveis Globais

```css
:root {
  /* Cores */
  --color-bg-base: #0F0F0F;
  --color-bg-primary: #181818;
  --color-bg-elevated: #222222;
  --color-bg-surface: #1C1C1C;
  --color-bg-hover: #2A2A2A;
  --color-accent: #DECCA8;
  --color-accent-light: #E8DBC4;
  --color-accent-dark: #B8A882;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #B0B0B0;
  --color-text-muted: #888888;
  --color-border-subtle: rgba(255, 255, 255, 0.05);
  --color-border-default: rgba(255, 255, 255, 0.10);
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* Tipografia */
  --font-family-sans: 'Inter', sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;

  /* Espaçamento */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;

  /* Layout */
  --header-height: 64px;
  --kanban-column-width: 320px;

  /* Bordas */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  /* Sombras */
  --glow-accent: 0 0 20px rgba(222, 204, 168, 0.3);

  /* Animações */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);

  /* Z-index */
  --z-dropdown: 50;
  --z-modal: 200;
  --z-toast: 300;
}
```

### 10.2 Utilitários Tailwind

```css
@layer utilities {
  .glass {
    background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
    backdrop-filter: blur(10px);
  }

  .scrollbar-thin::-webkit-scrollbar { width: 6px; }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .text-gradient-accent {
    background: linear-gradient(135deg, #DECCA8, #B8A882);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
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
    border: 0;
  }
}
```

---

## Apêndice: Mapeamento de Status

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

---

## Checklist de Implementação

**Componentes Base:**
- [ ] Button (todas variantes)
- [ ] Input, Select, Checkbox, RadioGroup, Slider
- [ ] Badge, Card, Dialog, Sheet
- [ ] Table, Tabs, Toast

**Componentes de Negócio:**
- [ ] KanbanBoard, Column, Card
- [ ] LeadSheet, QualificationForm
- [ ] KPICard, Charts
- [ ] ActivityTimeline

**Estados:**
- [ ] Skeleton loaders, Spinners
- [ ] Empty states, Error states

**Acessibilidade:**
- [ ] Focus states, ARIA labels
- [ ] Keyboard navigation
- [ ] Reduced motion

---

**Versão:** 1.0.0 | **Data:** Janeiro 2026  
**Mantido por:** Equipe Dashformance