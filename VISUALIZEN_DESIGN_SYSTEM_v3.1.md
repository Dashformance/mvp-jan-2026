# VISUALIZEN DESIGN SYSTEM v3.1
## Inter Display Edition — Dual Theme

---

## Índice

1. [Filosofia](#1-filosofia)
2. [Tipografia](#2-tipografia)
3. [Cores](#3-cores)
4. [Espaçamento](#4-espaçamento)
5. [Border Radius](#5-border-radius)
6. [Sombras](#6-sombras)
7. [Transições](#7-transições)
8. [Componentes](#8-componentes)
9. [Layouts](#9-layouts)
10. [Regras de Uso do Accent](#10-regras-de-uso-do-accent)
11. [Responsividade](#11-responsividade)
12. [Checklist de Implementação](#12-checklist-de-implementação)

---

## 1. Filosofia

### Conceito
**"Contraste Sofisticado"** — Um sistema de design premium que combina minimalismo funcional com elegância visual. Inspirado em Cartesia Sonic (dark) e V7 Labs (light).

### Princípios

| Princípio | Descrição |
|-----------|-----------|
| **Clareza** | Hierarquia visual clara com tipografia bem definida |
| **Respiração** | Espaçamento generoso entre elementos |
| **Contraste** | Botões brancos/pretos como destaque principal |
| **Consistência** | Uma família tipográfica (Inter) em todo o sistema |
| **Premium** | Visual sofisticado sem excessos decorativos |

### Referências Visuais
- **Dark Theme:** Cartesia.ai/sonic, Linear, Vercel
- **Light Theme:** V7Labs.com/agents, Notion, Stripe

---

## 2. Tipografia

### Font Stack

```css
/* Display & UI */
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Código (apenas quando necessário) */
--font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
```

### Google Fonts Import

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet">
```

> **Nota:** Inter com `opsz` (optical sizing) ativado otimiza automaticamente para tamanhos grandes, funcionando como "Inter Display".

---

### Escala Tipográfica

| Token | Tamanho | Uso |
|-------|---------|-----|
| `--text-xs` | 11px | Captions, metadata |
| `--text-sm` | 13px | Body principal (Cartesia) |
| `--text-base` | 14px | UI elements |
| `--text-md` | 15px | Body alternativo |
| `--text-lg` | 16px | Subheadings |
| `--text-xl` | 18px | Lead text |
| `--text-2xl` | 24px | Headings pequenos |
| `--text-3xl` | 32px | Section titles |
| `--text-4xl` | 48px | H2 (Cartesia) |
| `--text-5xl` | 56px | Display |
| `--text-6xl` | 68px | H1 (Cartesia) |
| `--text-7xl` | 80px | Hero display |

---

### Pesos

| Token | Valor | Uso |
|-------|-------|-----|
| `--weight-light` | 300 | Labels técnicos, overlines |
| `--weight-regular` | 400 | Body, headlines display |
| `--weight-medium` | 500 | Botões, links, nav |
| `--weight-semibold` | 600 | Títulos de cards, emphasis |
| `--weight-bold` | 700 | Logo highlight |

---

### Letter Spacing

| Token | Valor | Uso |
|-------|-------|-----|
| `--tracking-tighter` | -0.03em | Display 1 (68px+) |
| `--tracking-tight` | -0.02em | Display 2-3, headings |
| `--tracking-normal` | 0 | Body text |
| `--tracking-wide` | 0.02em | UI elements |
| `--tracking-wider` | 0.05em | Small labels |
| `--tracking-widest` | 0.1em | Overlines, badges |

---

### Estilos Tipográficos

#### Display (Headlines)

```css
.display-1 {
    font-family: var(--font-display);
    font-size: 68px;
    font-weight: 400;
    letter-spacing: -0.03em;
    line-height: 1.05;
}

.display-2 {
    font-family: var(--font-display);
    font-size: 48px;
    font-weight: 400;
    letter-spacing: -0.02em;
    line-height: 1.1;
}

.display-3 {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 400;
    letter-spacing: -0.02em;
    line-height: 1.15;
}
```

#### Headings

```css
.heading {
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.01em;
}

.subheading {
    font-family: var(--font-sans);
    font-size: 18px;
    font-weight: 500;
}
```

#### Body

```css
.body {
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.6;
}

.body-lg {
    font-family: var(--font-sans);
    font-size: 15px;
    font-weight: 400;
    line-height: 1.7;
}
```

#### Labels Técnicos (Inter Light — NÃO mono)

```css
.overline {
    font-family: var(--font-sans);
    font-size: 12px;
    font-weight: 300;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--green-light);
}

.label {
    font-family: var(--font-sans);
    font-size: 12px;
    font-weight: 300;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--fg-muted);
}

.caption {
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 300;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-subtle);
}
```

> ⚠️ **IMPORTANTE:** Labels e overlines usam **Inter Light (weight 300)**, não fonte monospace. Isso mantém elegância e consistência.

---

## 3. Cores

### Dark Theme (Default)
Baseado em **Cartesia Sonic**

#### Neutral Scale

| Token | Hex | Uso |
|-------|-----|-----|
| `--neutral-0` | #000000 | Pure black |
| `--neutral-1` | #0D0D0D | Darkest surfaces |
| `--neutral-2` | #181818 | **Background principal** |
| `--neutral-3` | #1C1C1C | Subtle background |
| `--neutral-4` | #262626 | Elevated surfaces |
| `--neutral-5` | #303030 | Hover states |
| `--neutral-6` | #444444 | Disabled elements |
| `--neutral-7` | #525252 | Borders strong |
| `--neutral-8` | #6B6B6B | Muted text |
| `--neutral-9` | #8A8A8A | Secondary text |
| `--neutral-10` | #A8A8A8 | — |
| `--neutral-11` | #D4D4D4 | Primary text alt |
| `--neutral-12` | #FFFFFF | **Primary text** |

#### Semantic Backgrounds

```css
--bg-base: #181818;
--bg-subtle: #1C1C1C;
--bg-muted: #141414;
--bg-elevated: #222222;
--bg-hover: #2A2A2A;
--bg-active: #333333;
```

#### Semantic Foregrounds

```css
--fg-primary: #FFFFFF;
--fg-secondary: #D4D4D4;
--fg-muted: #8A8A8A;
--fg-subtle: #6B6B6B;
--fg-disabled: #444444;
```

#### Borders

```css
--border-subtle: rgba(255, 255, 255, 0.06);
--border-default: rgba(255, 255, 255, 0.10);
--border-strong: rgba(255, 255, 255, 0.16);
--border-focus: rgba(255, 255, 255, 0.24);
```

---

### Light Theme
Baseado em **V7 Labs Agents**

#### Neutral Scale

| Token | Hex | Uso |
|-------|-----|-----|
| `--neutral-0` | #FFFFFF | Pure white |
| `--neutral-1` | #FAFAFA | Subtle surfaces |
| `--neutral-2` | #F7F6F5 | **Background principal** |
| `--neutral-3` | #F2F0ED | Muted background |
| `--neutral-4` | #E8E6E3 | Hover states |
| `--neutral-5` | #D9D7D4 | Borders |
| `--neutral-6` | #C4C2BF | Disabled |
| `--neutral-7` | #A8A6A3 | — |
| `--neutral-8` | #8A8886 | Muted text |
| `--neutral-9` | #6B6968 | Secondary text |
| `--neutral-10` | #525150 | — |
| `--neutral-11` | #333332 | Primary text alt |
| `--neutral-12` | #292929 | **Primary text** |

#### Semantic (Light)

```css
--bg-base: #F7F6F5;
--bg-subtle: #FAFAFA;
--bg-muted: #F2F0ED;
--bg-elevated: #FFFFFF;
--bg-hover: #E8E6E3;
--bg-active: #D9D7D4;

--fg-primary: #292929;
--fg-secondary: #525150;
--fg-muted: #6B6968;
--fg-subtle: #8A8886;
--fg-disabled: #C4C2BF;

--border-subtle: rgba(0, 0, 0, 0.04);
--border-default: rgba(0, 0, 0, 0.08);
--border-strong: rgba(0, 0, 0, 0.14);
--border-focus: rgba(0, 0, 0, 0.24);
```

---

### Accent: Champagne

| Token | Hex | Uso |
|-------|-----|-----|
| `--champagne-7` | #B09878 | Muted |
| `--champagne-8` | #C8AC8C | — |
| `--champagne-9` | #DECCA8 | **Primary accent** |
| `--champagne-10` | #E8D8B8 | Hover |
| `--champagne-11` | #F2E8D4 | Light |
| `--champagne-12` | #FCF8F0 | Lightest |

```css
--accent: #DECCA8;
--accent-hover: #E8D8B8;
--accent-muted: #B09878;
--accent-subtle: rgba(222, 204, 168, 0.12);
--gradient-accent: linear-gradient(135deg, #E8D8B8 0%, #C8AC8C 100%);
```

---

### Accent: Green (Cartesia Style)

```css
--green-light: rgb(115, 186, 127);  /* #73BA7F */
--green-dark: rgb(9, 133, 69);      /* #098545 */
--gradient-green: linear-gradient(90deg, #098545 0%, #73BA7F 100%);
```

**Uso:** Overlines, banners promocionais, badges de status, ícones de check.

---

### Accent: Blue (Links)

```css
--blue-link: #44CCFF;
--blue-primary: #0099FF;
```

**Uso:** Links em texto, estados de informação.

---

### Cores Semânticas

| Token | Hex | Subtle | Uso |
|-------|-----|--------|-----|
| `--success` | #4ADE80 | rgba(74,222,128,0.12) | Sucesso, ativo |
| `--warning` | #FBBF24 | rgba(251,191,36,0.12) | Aviso, pendente |
| `--error` | #F43F5E | rgba(244,63,94,0.12) | Erro, perigo |
| `--info` | #44CCFF | rgba(68,204,255,0.12) | Informação |

---

### Multi-Color (V7 Labs Style)

Para categorias e badges coloridos:

```css
--color-orange: #FF683D;
--color-orange-burnt: #EC580A;
--color-green-v7: #16A34A;
--color-blue-v7: #2663EB;
--color-purple: #7C3AED;
--color-gold: #CE8C04;
--color-pink: #DB2777;
--color-teal: #0D9488;
```

---

## 4. Espaçamento

Base: **12px** (Cartesia)

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-1` | 4px | Gaps mínimos |
| `--space-2` | 8px | Padding interno pequeno |
| `--space-3` | 12px | **Base** |
| `--space-4` | 16px | Padding padrão |
| `--space-5` | 20px | — |
| `--space-6` | 24px | Sections internas |
| `--space-8` | 32px | Cards padding |
| `--space-10` | 40px | — |
| `--space-12` | 48px | — |
| `--space-16` | 64px | Sections médias |
| `--space-20` | 80px | — |
| `--space-24` | 96px | **Sections grandes** |

---

## 5. Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-none` | 0px | Sem radius |
| `--radius-sm` | 6px | Badges, tags |
| `--radius-md` | 8px | Inputs pequenos |
| `--radius-lg` | 12px | Cards, inputs |
| `--radius-xl` | 16px | Cards grandes |
| `--radius-2xl` | 24px | Modais, containers |
| `--radius-full` | 9999px | **Botões (pills)**, avatares |

> ⚠️ **Botões são sempre pills** (`border-radius: 9999px`)

---

## 6. Sombras

### Dark Theme

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6);
```

### Light Theme

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.10);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.12);
```

---

## 7. Transições

```css
--duration-fast: 100ms;
--duration-normal: 150ms;
--duration-slow: 250ms;

--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## 8. Componentes

### Buttons

#### Especificações Base

```css
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 28px;
    min-height: 52px;
    border-radius: 9999px;  /* SEMPRE pill */
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms ease;
    border: none;
}
```

#### Variantes

| Variante | Background | Color | Border | Uso |
|----------|------------|-------|--------|-----|
| **Primary** | `--fg-primary` (white) | `--bg-base` (black) | — | CTAs principais |
| **Secondary** | transparent | `--fg-primary` | `--border-strong` | CTAs secundários |
| **Ghost** | transparent | `--fg-muted` | — | Ações terciárias |
| **Accent** | `--gradient-accent` | #1A1814 | — | **Landing page only** |
| **Green** | `--gradient-green` | white | — | Banners, promos |
| **Danger** | transparent | `--error` | error 30% | Ações destrutivas |

#### Tamanhos

| Size | Padding | Min Height | Font Size |
|------|---------|------------|-----------|
| Small | 10px 20px | 40px | 13px |
| Medium | 14px 28px | 52px | 14px |
| Large | 18px 36px | 60px | 15px |

#### Estados

```css
/* Hover */
.btn-primary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

/* Active */
.btn:active {
    transform: scale(0.98);
}

/* Disabled */
.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

---

### Inputs

```css
.input {
    width: 100%;
    padding: 14px 18px;
    min-height: 52px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: 9999px;  /* Pill */
    font-family: var(--font-sans);
    font-size: 14px;
    color: var(--fg-primary);
    transition: all 150ms ease;
}

.input::placeholder {
    color: var(--fg-subtle);
}

.input:hover {
    border-color: var(--border-strong);
}

.input:focus {
    outline: none;
    background: var(--bg-muted);
    border-color: var(--border-focus);
}
```

> **Nota:** Input focus usa `border-focus` (neutro), **NÃO** accent.

---

### Badges

```css
.badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    border-radius: 9999px;
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 300;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}
```

#### Variantes

| Variante | Background | Color | Uso |
|----------|------------|-------|-----|
| Default | `--border-default` | `--fg-muted` | Rascunho |
| Accent | `--accent-subtle` | `--accent` | **Publicado** |
| Green | rgba(115,186,127,0.15) | `--green-light` | Novo |
| Success | `--success-subtle` | `--success` | Ativo |
| Warning | `--warning-subtle` | `--warning` | Pendente |
| Error | `--error-subtle` | `--error` | Erro |

---

### Cards

```css
.card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: 16px;
    overflow: hidden;
    transition: all 250ms ease;
}

.card:hover {
    border-color: var(--border-default);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}
```

#### Project Card

```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │      Thumbnail          │ │  160px height
│ │           [BADGE]       │ │  Badge: top-right
│ └─────────────────────────┘ │
│                             │
│  Card Title                 │  18px, semibold
│  METADATA                   │  11px, light, uppercase
│                             │
└─────────────────────────────┘
```

#### Create Card

```css
.card-create {
    background: transparent;
    border: 1.5px dashed var(--border-default);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 240px;
    cursor: pointer;
}

.card-create:hover {
    border-color: var(--border-strong);
    background: var(--border-subtle);
}
```

---

### Navigation

#### Sidebar

```css
.nav-sidebar {
    width: 260px;
    background: var(--bg-muted);
    border: 1px solid var(--border-subtle);
    border-radius: 16px;
    padding: 24px 20px;
}
```

#### Nav Item

```css
.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--fg-muted);
    cursor: pointer;
    transition: all 150ms ease;
}

.nav-item:hover {
    background: var(--border-subtle);
    color: var(--fg-secondary);
}

.nav-item.active {
    background: var(--bg-elevated);
    color: var(--fg-primary);
}

/* Ícone ativo usa accent */
.nav-item.active .nav-icon {
    color: var(--accent);
    opacity: 1;
}
```

---

### Tabs

```css
.tabs {
    display: flex;
    gap: 2px;
    padding: 4px;
    background: var(--border-subtle);
    border-radius: 9999px;
    width: fit-content;
}

.tab {
    padding: 12px 24px;
    border-radius: 9999px;
    font-size: 14px;
    font-weight: 500;
    color: var(--fg-muted);
    cursor: pointer;
    transition: all 150ms ease;
    border: none;
    background: transparent;
}

.tab:hover {
    color: var(--fg-secondary);
}

.tab.active {
    background: var(--bg-elevated);
    color: var(--fg-primary);
    box-shadow: var(--shadow-sm);
}
```

> **Nota:** Tab ativo usa fundo `bg-elevated` (neutro), **NÃO** accent.

---

### Logo

```css
.logo {
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--fg-muted);
}

.logo span {
    font-weight: 700;
    background: var(--gradient-accent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
```

**Resultado:** VISUALI**ZEN** (ZEN em gradient champagne)

---

## 9. Layouts

### Container

```css
.container {
    max-width: 1168px;
    margin: 0 auto;
    padding: 0 24px;
}

.container-narrow {
    max-width: 800px;
}
```

### Section

```css
.section {
    padding: 96px 0;
}

.section-header {
    text-align: center;
    margin-bottom: 64px;
}
```

### Dashboard Layout

```
┌──────────────────────────────────────────────────┐
│ ┌────────┐ ┌──────────────────────────────────┐  │
│ │        │ │ Header                      [CTA]│  │
│ │  Side  │ ├──────────────────────────────────┤  │
│ │  bar   │ │ Tabs                             │  │
│ │        │ ├──────────────────────────────────┤  │
│ │ 260px  │ │                                  │  │
│ │        │ │     Content Grid                 │  │
│ │        │ │                                  │  │
│ └────────┘ └──────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## 10. Regras de Uso do Accent

### ✅ Permitido

| Contexto | Elemento | Accent |
|----------|----------|--------|
| **Todos** | Logo "ZEN" | Gradient champagne |
| **Todos** | Overlines (seções) | Verde |
| **Dashboard** | Nav icon ativo | Cor champagne |
| **Dashboard** | Badge "Publicado" | Champagne |
| **Landing** | Palavra destaque no hero | Gradient champagne |
| **Landing** | CTA buttons | Gradient champagne |
| **Landing** | Feature icons | Champagne subtle bg |
| **Landing** | Badge "Recomendado" | Champagne |

### ❌ Proibido

| Contexto | Elemento | Usar |
|----------|----------|------|
| **Dashboard** | Botão "Novo Projeto" | Primary (branco) |
| **Dashboard** | Input focus | Border neutro |
| **Dashboard** | Tab ativo | Background neutro |
| **Dashboard** | Card hover | Border neutro |
| **Dashboard** | Links | Cor neutra |
| **Viewer** | **Tudo** | 100% neutro (whitelabel) |

---

## 11. Responsividade

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (max-width: 900px) { }

/* Desktop */
@media (min-width: 901px) { }
```

### Comportamentos

| Elemento | Desktop | Mobile |
|----------|---------|--------|
| Container | 1168px max | 100% - 48px padding |
| Nav links | Visíveis | Hamburger menu |
| Grids 3 col | 3 colunas | 1 coluna |
| Grids 2 col | 2 colunas | 1 coluna |
| Display 1 | 68px | 40px (clamp) |
| Buttons | Inline | Full width |
| Sidebar | 260px fixed | 100% stacked |

### Clamp Typography

```css
.display-1 {
    font-size: clamp(40px, 6vw, 68px);
}

.display-2 {
    font-size: clamp(32px, 4vw, 48px);
}

.display-3 {
    font-size: clamp(24px, 3vw, 32px);
}
```

---

## 12. Checklist de Implementação

### Tipografia
- [ ] Inter carregada com optical sizing (opsz)
- [ ] Display headlines weight 400 (não bold)
- [ ] Labels usando Inter Light (300), não mono
- [ ] Letter-spacing negativo em headlines grandes
- [ ] Letter-spacing positivo em overlines/labels

### Cores
- [ ] Dark theme: bg #181818, fg #FFFFFF
- [ ] Light theme: bg #F7F6F5, fg #292929
- [ ] Accent champagne apenas onde permitido
- [ ] Verde para overlines e status positivo
- [ ] Borders usando rgba (não hex sólido)

### Componentes
- [ ] Botões são pills (radius 9999px)
- [ ] Botão primary é branco no dark / preto no light
- [ ] Inputs são pills com foco neutro
- [ ] Cards com hover: border + translateY
- [ ] Tabs com background neutro no ativo

### Layout
- [ ] Container max 1168px
- [ ] Sections com 96px de padding vertical
- [ ] Espaçamento generoso entre elementos
- [ ] Responsivo mobile-first

### Micro-interações
- [ ] Transitions 150ms ease
- [ ] Hover translateY(-1px) em botões
- [ ] Active scale(0.98) em botões
- [ ] Smooth scroll em links âncora

---

## Tokens CSS Completos

```css
:root {
    /* Typography */
    --font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;

    --text-xs: 11px;
    --text-sm: 13px;
    --text-base: 14px;
    --text-md: 15px;
    --text-lg: 16px;
    --text-xl: 18px;
    --text-2xl: 24px;
    --text-3xl: 32px;
    --text-4xl: 48px;
    --text-5xl: 56px;
    --text-6xl: 68px;

    --weight-light: 300;
    --weight-regular: 400;
    --weight-medium: 500;
    --weight-semibold: 600;
    --weight-bold: 700;

    --tracking-tighter: -0.03em;
    --tracking-tight: -0.02em;
    --tracking-normal: 0;
    --tracking-wide: 0.02em;
    --tracking-wider: 0.05em;
    --tracking-widest: 0.1em;

    /* Dark Theme Colors */
    --bg-base: #181818;
    --bg-subtle: #1C1C1C;
    --bg-muted: #141414;
    --bg-elevated: #222222;
    --bg-hover: #2A2A2A;

    --fg-primary: #FFFFFF;
    --fg-secondary: #D4D4D4;
    --fg-muted: #8A8A8A;
    --fg-subtle: #6B6B6B;
    --fg-disabled: #444444;

    --border-subtle: rgba(255, 255, 255, 0.06);
    --border-default: rgba(255, 255, 255, 0.10);
    --border-strong: rgba(255, 255, 255, 0.16);
    --border-focus: rgba(255, 255, 255, 0.24);

    /* Accent */
    --accent: #DECCA8;
    --accent-hover: #E8D8B8;
    --accent-muted: #B09878;
    --accent-subtle: rgba(222, 204, 168, 0.12);
    --gradient-accent: linear-gradient(135deg, #E8D8B8 0%, #C8AC8C 100%);

    /* Green */
    --green-light: rgb(115, 186, 127);
    --green-dark: rgb(9, 133, 69);
    --gradient-green: linear-gradient(90deg, #098545 0%, #73BA7F 100%);

    /* Semantic */
    --success: #4ADE80;
    --success-subtle: rgba(74, 222, 128, 0.12);
    --warning: #FBBF24;
    --warning-subtle: rgba(251, 191, 36, 0.12);
    --error: #F43F5E;
    --error-subtle: rgba(244, 63, 94, 0.12);
    --info: #44CCFF;
    --info-subtle: rgba(68, 204, 255, 0.12);

    /* Spacing */
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
    --space-8: 32px;
    --space-10: 40px;
    --space-12: 48px;
    --space-16: 64px;
    --space-20: 80px;
    --space-24: 96px;

    /* Radius */
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-2xl: 24px;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
    --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6);

    /* Transitions */
    --duration-fast: 100ms;
    --duration-normal: 150ms;
    --duration-slow: 250ms;
    --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

---

**Visualizen Design System v3.1**
*Inter Display Edition — Dual Theme*
*Última atualização: Janeiro 2026*
