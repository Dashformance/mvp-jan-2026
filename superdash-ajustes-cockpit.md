# 🔧 SUPERDASH — Ajustes de UI/UX para Modo Cockpit/TV
## Documento de Instruções para Implementação (v2)

> **Objetivo:** Transformar o Superdash em um cockpit de vendas impactante para projeção em TV  
> **Prioridade:** Alta  
> **Escopo:** Layout, cores, efeitos visuais, hierarquia  
> **Versão:** 2.0 — Com Player Cards FIFA e Calendário

---

## 0. RESUMO DAS MUDANÇAS SOLICITADAS

### ✅ MANTER
- Player Cards estilo FIFA (com score "70", ring de XP, stats)
- Calendário/Agenda com reuniões do dia
- Ranking do Time (sidebar)
- Streak e Missões (compactos)
- KPIs no topo
- Gauges de Empenho e Conversão

### ❌ REMOVER
- Feed de Atividades (Atividades LIVE)
- Card de Nível Individual (do painel direito)

### 🔄 REAJUSTAR
- Layout otimizado para TV (tudo visível sem scroll)
- Gauges com visual de ring circular (mais compacto)
- Sidebar com: Ranking + Calendário + Streak + Missões

---

## 1. DIAGNÓSTICO DOS PROBLEMAS ATUAIS

### 1.1 Problemas Críticos

| Problema | Onde | Impacto |
|----------|------|---------|
| **Gauges invisíveis** | War Room + Performance | Elemento principal não tem impacto visual |
| **Muito scroll** | Dashboard inteiro | Impossível ver tudo em TV |
| **Receita sem destaque** | Card Receita Total | Cor branca, sem glow premium |
| **Rings dos Player Cards** | Arena do Time | Número "70" confuso, sem gradiente |
| **Falta hierarquia** | Layout geral | Informações competem por atenção |
| **Dot LIVE estático** | Feed Atividades | Não parece "ao vivo" |

### 1.2 O que está bom (manter)

- ✅ Insight Alert vermelho com mensagem
- ✅ Badges de XP nos KPI cards (+25 XP, +50 XP)
- ✅ Medalhas no ranking (🥇🥈🥉)
- ✅ Estrutura do Feed de Atividades
- ✅ Seção Missões Diárias
- ✅ Streak com mensagem "Em chamas!"
- ✅ Cor champagne no Faturamento da War Room

---

## 2. NOVO LAYOUT PARA MODO TV/COCKPIT

### 2.1 Princípio: Tudo Visível em Uma Tela

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: ✦ SUPERDASH                              🔴 AO VIVO    [Tela Cheia]    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                           HERO SECTION                                    │  │
│  │                                                                           │  │
│  │                            09:29:35                                       │  │
│  │                    Segunda-feira, 26 de Janeiro                           │  │
│  │                                                                           │  │
│  │                        💰 FATURAMENTO TOTAL                               │  │
│  │                           R$ 39.000                                       │  │
│  │                                                                           │  │
│  │     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │     │📞 LEADS     │  │📅 REUNIÕES  │  │🏆 VENDAS    │  │📊 PIPELINE  │   │  │
│  │     │    14       │  │     3       │  │     5       │  │  R$ 45k     │   │  │
│  │     └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │         GAUGE: EMPENHO              │  │        GAUGE: CONVERSÃO         │  │
│  │              70%                    │  │             21%                 │  │
│  │         "Ritmo ativo"               │  │        "Precisa melhorar"       │  │
│  └─────────────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                                 │
│        ┌─────────────────────────────────────────────────────────────┐         │
│        │  💡 Alto esforço com boa conversão — continue assim!       │         │
│        └─────────────────────────────────────────────────────────────┘         │
│                                                                                 │
│  ┌───────────────────────────────────────────┐  ┌─────────────────────────┐    │
│  │            ARENA DO TIME                  │  │    FEED AO VIVO        │    │
│  │  ┌────────┐  ┌────────┐  ┌────────┐      │  │                         │    │
│  │  │🥇 João │  │🥈 Maria│  │🥉 Pedro│      │  │  🏆 João +100 XP       │    │
│  │  │ Lv.12  │  │ Lv.8   │  │ Lv.5   │      │  │  📅 Maria +50 XP       │    │
│  │  │ 12.5k  │  │ 8.4k   │  │ 3.2k   │      │  │  🔥 Pedro +75 XP       │    │
│  │  └────────┘  └────────┘  └────────┘      │  │                         │    │
│  └───────────────────────────────────────────┘  └─────────────────────────┘    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Grid CSS para TV (1920x1080)

```css
.superdash-tv {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  overflow: hidden; /* CRÍTICO: Sem scroll */
  padding: 24px;
  gap: 24px;
}

.hero-section {
  /* Ocupa topo */
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.bottom-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}
```

---

## 3. CORREÇÕES DOS GAUGES

### 3.1 Problema Atual
Os gauges estão praticamente invisíveis — arco muito escuro/transparente, sem gradiente de cores, sem glow.

### 3.2 Solução: Gauge com Gradiente Visível

```css
/* GRADIENTE DO ARCO (vermelho → verde) */
.gauge-arc {
  stroke: url(#gaugeGradient);
  stroke-width: 16px;
  stroke-linecap: round;
  filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.5));
}
```

```svg
<defs>
  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#FF4757"/>    /* Vermelho */
    <stop offset="35%" stop-color="#FF9F43"/>   /* Laranja */
    <stop offset="60%" stop-color="#FFE066"/>   /* Amarelo */
    <stop offset="100%" stop-color="#00FF88"/>  /* Verde */
  </linearGradient>
</defs>
```

### 3.3 Background do Arco

```css
/* Trilha de fundo (visível mas sutil) */
.gauge-track {
  stroke: rgba(255, 255, 255, 0.1); /* Era muito escuro */
  stroke-width: 16px;
}
```

### 3.4 Ponteiro com Glow

```css
.gauge-pointer {
  fill: #FFFFFF;
  filter: drop-shadow(0 0 10px rgba(255, 71, 87, 0.8));
}

.gauge-pointer-center {
  fill: #FF4757;
  filter: drop-shadow(0 0 15px #FF4757);
}
```

### 3.5 Valor Central com Cor Dinâmica

```css
/* Cor muda baseado no valor */
.gauge-value.critical { 
  color: #FF4757; 
  text-shadow: 0 0 30px rgba(255, 71, 87, 0.5);
}
.gauge-value.warning { 
  color: #FF9F43; 
  text-shadow: 0 0 30px rgba(255, 159, 67, 0.5);
}
.gauge-value.attention { 
  color: #FFE066; 
  text-shadow: 0 0 30px rgba(255, 224, 102, 0.5);
}
.gauge-value.good { 
  color: #00FF88; 
  text-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
}
```

```javascript
// Lógica para classe
function getGaugeClass(value) {
  if (value < 30) return 'critical';
  if (value < 50) return 'warning';
  if (value < 70) return 'attention';
  return 'good';
}
```

---

## 4. CORREÇÃO DO CARD RECEITA TOTAL

### 4.1 Problema Atual
Cor branca/cinza, sem destaque premium.

### 4.2 Solução

```css
.receita-card {
  background: linear-gradient(135deg, rgba(222, 204, 168, 0.1) 0%, transparent 100%);
  border: 1px solid rgba(222, 204, 168, 0.2);
}

.receita-label {
  color: #DECCA8;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.receita-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 48px; /* Grande para TV */
  font-weight: 700;
  color: #DECCA8;
  text-shadow: 0 0 40px rgba(222, 204, 168, 0.4);
}
```

---

## 5. CORREÇÃO DOS PLAYER CARDS

### 5.1 Problema Atual
- Número "70" no ring é confuso (o que significa?)
- Rings sem cor/gradiente
- Falta hierarquia visual

### 5.2 Solução

**Opção A:** Remover o número do ring e deixar apenas o avatar
```css
.player-ring {
  /* Ring mostra progresso XP para próximo nível */
  stroke: url(#playerGradient);
  stroke-width: 4px;
}
```

**Opção B:** Mudar para mostrar o NÍVEL (não score)
```html
<div class="player-level-badge">12</div> <!-- Nível, não score -->
```

### 5.3 Ring com Gradiente do Rank

```css
/* Cor do ring = cor do rank */
.player-ring.bronze { stroke: #CD7F32; }
.player-ring.silver { stroke: #C0C0C0; }
.player-ring.gold { stroke: #FFD700; }
.player-ring.platinum { stroke: #E5E4E2; }
.player-ring.diamond { stroke: #B9F2FF; }
```

### 5.4 Destaque para 1º Lugar

```css
.player-card.first-place {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, transparent 100%);
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
}
```

---

## 6. KPI CARDS — MELHORIAS

### 6.1 Cores por Categoria

```css
/* Cada KPI tem sua cor temática */
.kpi-leads {
  --kpi-color: #00D4FF; /* Cyan */
}

.kpi-reunioes {
  --kpi-color: #00FF88; /* Verde */
}

.kpi-vendas {
  --kpi-color: #FFE066; /* Amarelo */
}

.kpi-pipeline {
  --kpi-color: #DECCA8; /* Champagne */
}
```

### 6.2 Estrutura Visual

```css
.kpi-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Linha colorida no topo */
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--kpi-color), transparent);
}

/* Badge de XP */
.kpi-xp-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 255, 136, 0.15);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 100px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #00FF88;
}

/* Label colorido */
.kpi-label {
  color: var(--kpi-color);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

/* Valor grande */
.kpi-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #FFFFFF;
}
```

---

## 7. FEED DE ATIVIDADES — MELHORIAS

### 7.1 Dot LIVE Pulsando

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 0 8px rgba(255, 71, 87, 0);
  }
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #FF4757;
  border-radius: 50%;
  animation: pulse 2s infinite ease-in-out;
}
```

### 7.2 Itens do Feed com Mais Destaque

```css
.feed-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  margin-bottom: 8px;
}

.feed-xp {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: #00FF88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}
```

---

## 8. INSIGHT ALERT — JÁ ESTÁ BOM

O alerta vermelho com a mensagem está correto. Apenas adicionar lógica para mudar cor:

```css
.insight-alert.critical {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
}

.insight-alert.warning {
  background: rgba(255, 224, 102, 0.1);
  border: 1px solid rgba(255, 224, 102, 0.3);
}

.insight-alert.success {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
}
```

---

## 9. TIPOGRAFIA

### 9.1 Importar Fontes

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
```

### 9.2 Onde Usar

| Elemento | Fonte | Peso | Tamanho TV |
|----------|-------|------|------------|
| Relógio | Space Grotesk | 700 | 80-96px |
| Faturamento | Space Grotesk | 700 | 56-72px |
| KPI Values | Space Grotesk | 700 | 36-48px |
| Gauge % | Space Grotesk | 700 | 48-56px |
| XP Values | Space Grotesk | 700 | 14-18px |
| Labels | Inter | 600 | 11-13px |
| UI geral | Inter | 400-500 | 14-16px |

---

## 10. EFEITOS DE AMBIENTE

### 10.1 Ambient Glow (Background)

```css
/* Brilho sutil no fundo da página */
.ambient-glow-top {
  position: fixed;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(222, 204, 168, 0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
```

### 10.2 Separador com Gradiente

```css
/* Linha decorativa entre seções */
.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(222, 204, 168, 0.3), transparent);
  margin: 24px 0;
}
```

---

## 11. CHECKLIST DE IMPLEMENTAÇÃO

### Prioridade CRÍTICA
- [ ] Gauge com gradiente visível (vermelho→verde)
- [ ] Glow no arco do gauge
- [ ] Ponteiro com drop-shadow
- [ ] Cor do valor muda conforme %
- [ ] Layout sem scroll para TV

### Prioridade ALTA
- [ ] Receita Total em champagne com glow
- [ ] KPIs com linha colorida no topo
- [ ] Dot LIVE com animação pulse
- [ ] Player Cards com destaque no 1º lugar
- [ ] Fontes Space Grotesk nos números

### Prioridade MÉDIA
- [ ] Ambient glow no background
- [ ] Hover effects nos cards
- [ ] Ring dos players com cor do rank
- [ ] Feed items com background

### Prioridade BAIXA
- [ ] Animações de entrada
- [ ] Count up nos números
- [ ] Transições suaves

---

## 12. TOKENS CSS COMPLETOS

```css
:root {
  /* Backgrounds */
  --bg-void: #050505;
  --bg-base: #0A0A0A;
  --bg-card: #111111;
  --bg-elevated: #1a1a1a;

  /* Champagne */
  --champagne: #DECCA8;
  --champagne-glow: rgba(222, 204, 168, 0.4);

  /* Neon */
  --neon-green: #00FF88;
  --neon-cyan: #00D4FF;
  --neon-yellow: #FFE066;
  --neon-orange: #FF9F43;
  --neon-red: #FF4757;

  /* Glass */
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);

  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #888888;
  --text-muted: #555555;

  /* Fonts */
  --font-sans: 'Inter', sans-serif;
  --font-display: 'Space Grotesk', sans-serif;
}
```

---

## 13. REFERÊNCIA VISUAL

O arquivo HTML de referência mostra exatamente como deve ficar:
`superdash-cockpit-preview.html`

Abra no navegador em tela cheia (F11) para simular TV.

---

**Documento v2.0**  
**Para:** Claude Code / Desenvolvedor  
**Foco:** Modo TV/Cockpit

---

## NOVO LAYOUT PARA MODO TV/COCKPIT v2

### Estrutura Grid Principal

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: ✦ SUPERDASH                              🔴 AO VIVO           [JV]     │
├────────────────────────────────────────────────────────────┬────────────────────┤
│                        LEFT PANEL                          │   RIGHT PANEL      │
│                                                            │                    │
│  ┌──────────────────────────────────────────────────────┐  │  ┌──────────────┐  │
│  │ HERO: Clock + Faturamento | KPIs (4 cards em grid)  │  │  │ 🏆 RANKING   │  │
│  └──────────────────────────────────────────────────────┘  │  │   DO TIME    │  │
│                                                            │  │              │  │
│  ┌────────────────────┐  ┌────────────────────┐           │  │ 🥇 João      │  │
│  │ GAUGE: EMPENHO     │  │ GAUGE: CONVERSÃO   │           │  │ 🥈 Bruno     │  │
│  │      70%           │  │      35%           │           │  │ 🥉 Nitz      │  │
│  │    [Ring SVG]      │  │    [Ring SVG]      │           │  └──────────────┘  │
│  └────────────────────┘  └────────────────────┘           │                    │
│                                                            │  ┌──────────────┐  │
│  ┌──────────────────────────────────────────────────────┐  │  │  AGENDA      │  │
│  │ 💡 Alto esforço com conversão moderada — revisar...  │  │  │  Jan 2026    │  │
│  └──────────────────────────────────────────────────────┘  │  │  [Calendar]  │  │
│                                                            │  │              │  │
│  ┌──────────────────────────────────────────────────────┐  │  │  HOJE        │  │
│  │ 🏟️ ARENA DO TIME                      3 jogadores   │  │  │  11:00 Burka │  │
│  │                                                      │  │  └──────────────┘  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │                    │
│  │  │ 70  🥇   │  │ 70  🥈   │  │ 70  🥉   │          │  │  ┌──────────────┐  │
│  │  │  [JV]    │  │  [BR]    │  │  [NZ]    │          │  │  │ 🔥 STREAK    │  │
│  │  │ J.Vitor  │  │ Bruno    │  │ Nitz     │          │  │  │   5 dias     │  │
│  │  │ SDR Sr   │  │ Closer   │  │ SDR Jr   │          │  │  └──────────────┘  │
│  │  │ 12.5k XP │  │ 8.4k XP  │  │ 3.2k XP  │          │  │                    │
│  │  │──────────│  │──────────│  │──────────│          │  │  ┌──────────────┐  │
│  │  │ L R M V  │  │ L R M V  │  │ L R M V  │          │  │  │ 🎯 MISSÕES   │  │
│  │  │145 68 24 5│  │98 52 30 8│  │210 40 8 1│          │  │  │   1/3        │  │
│  │  └──────────┘  └──────────┘  └──────────┘          │  │  └──────────────┘  │
│  └──────────────────────────────────────────────────────┘  │                    │
└────────────────────────────────────────────────────────────┴────────────────────┘
```

### CSS Grid Principal

```css
.main-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  overflow: hidden; /* CRÍTICO: Sem scroll */
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

---

## PLAYER CARDS — ESTILO FIFA

### Estrutura do Card

```html
<div class="player-card-fifa first">
  <!-- Top: Score + Medal -->
  <div class="player-top">
    <div class="player-score">70</div>
    <div class="player-rank-badge">🥇</div>
  </div>
  
  <!-- Avatar com Ring de XP -->
  <div class="player-avatar-section">
    <div class="player-avatar-ring">
      <svg><!-- Ring Progress --></svg>
      <div class="player-avatar">JV</div>
      <div class="player-level-badge">12</div>
    </div>
    <div class="player-name">João Vitor</div>
    <div class="player-role">SDR Senior</div>
  </div>
  
  <!-- XP Progress Bar -->
  <div class="player-xp-section">
    <div class="player-xp-bar">
      <span class="player-xp-value">12.500 XP</span>
      <span>15.000</span>
    </div>
    <div class="player-progress">
      <div class="player-progress-bar" style="width: 83%;"></div>
    </div>
  </div>
  
  <!-- Stats Grid -->
  <div class="player-stats">
    <div class="player-stat">
      <span class="player-stat-label">Leads</span>
      <span class="player-stat-value">145</span>
    </div>
    <!-- ... mais stats -->
  </div>
</div>
```

### CSS do Player Card FIFA

```css
.player-card-fifa {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-radius: 14px;
  border: 1px solid var(--glass-border);
  overflow: hidden;
  transition: all 0.2s ease;
}

.player-card-fifa:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.15);
}

/* 1º Lugar - Glow Dourado */
.player-card-fifa.first {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, var(--bg-card) 100%);
  border-color: rgba(255, 215, 0, 0.25);
}

.player-card-fifa.first:hover {
  box-shadow: 0 16px 32px rgba(255, 215, 0, 0.15);
}

/* Score grande no topo esquerdo */
.player-score {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

/* Level badge abaixo do avatar */
.player-level-badge {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: var(--neon-green);
  color: var(--bg-void);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

/* Cores por rank */
.player-card-fifa.first .player-level-badge { background: #FFD700; }
.player-card-fifa.second .player-level-badge { background: #C0C0C0; }
.player-card-fifa.third .player-level-badge { background: #CD7F32; }

/* Stats no footer */
.player-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 10px 8px;
  background: rgba(0, 0, 0, 0.2);
}
```

---

## GAUGES — VERSÃO RING COMPACTA

### Estrutura

```html
<div class="gauge-card">
  <div class="gauge-info">
    <div class="gauge-title">Empenho Comercial</div>
    <div class="gauge-value good">70%</div>
    <div class="gauge-sublabel">↗ Ritmo ativo</div>
  </div>
  <div class="gauge-visual">
    <svg class="gauge-ring" viewBox="0 0 80 80">
      <circle class="gauge-ring-track" cx="40" cy="40" r="36"/>
      <circle class="gauge-ring-progress" cx="40" cy="40" r="36" 
        stroke="url(#ringGrad)" 
        style="stroke-dashoffset: 68;"/>
    </svg>
  </div>
</div>
```

### CSS do Gauge Ring

```css
.gauge-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  background: var(--bg-card);
  border-radius: 14px;
  border: 1px solid var(--glass-border);
}

.gauge-visual {
  width: 80px;
  height: 80px;
}

.gauge-ring-track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 8;
}

.gauge-ring-progress {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 226; /* 2 * PI * 36 */
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset 1.5s ease;
  filter: drop-shadow(0 0 6px currentColor);
}

/* Calcular stroke-dashoffset:
   0% = 226 (vazio)
   100% = 0 (cheio)
   Para 70%: 226 - (226 * 0.7) = 68
*/
```

---

## CALENDÁRIO

### Estrutura

```html
<div class="calendar-section">
  <div class="calendar-header">
    <div>
      <div class="calendar-title">Agenda</div>
      <div class="calendar-subtitle">Janeiro 2026</div>
    </div>
    <div class="calendar-nav">
      <button>‹</button>
      <button>›</button>
      <button class="calendar-add-btn">+</button>
    </div>
  </div>
  
  <div class="calendar-grid">
    <div class="calendar-weekdays">D S T Q Q S S</div>
    <div class="calendar-days">
      <!-- 35 dias -->
      <span class="calendar-day today">26</span>
    </div>
  </div>
  
  <div class="today-section">
    <div class="today-header">
      <span>Hoje</span>
      <span>1 reunião</span>
    </div>
    <div class="today-event">
      <div class="event-time">11:00 / Segunda</div>
      <div class="event-info">Burka</div>
    </div>
  </div>
</div>
```

### CSS do Calendário

```css
.calendar-section {
  background: #FFFFFF; /* Fundo claro! */
  border-radius: 14px;
  overflow: hidden;
  color: #1a1a1a;
}

.calendar-header {
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
}

.calendar-title {
  font-size: 18px;
  font-weight: 700;
}

.calendar-add-btn {
  width: 36px;
  height: 36px;
  background: var(--champagne);
  border: none;
  border-radius: 50%;
}

.calendar-day.today {
  background: var(--bg-void);
  color: white;
  border-radius: 50%;
}

.today-event {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8f8f8;
  border-radius: 10px;
}

.event-hour {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
}
```

---

## RANKING DO TIME (Compacto)

```css
.ranking-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
}

.ranking-item.first {
  background: rgba(255, 215, 0, 0.05);
}

.ranking-xp {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--neon-green);
}

/* Cores por posição */
.ranking-item:nth-child(2) .ranking-xp { color: #C0C0C0; }
.ranking-item:nth-child(3) .ranking-xp { color: #CD7F32; }
```

---

## CHECKLIST DE IMPLEMENTAÇÃO

### Layout
- [ ] Grid principal: `1fr 300px` (left + right)
- [ ] Sem scroll (`overflow: hidden`)
- [ ] Hero compacto: Clock à esquerda + KPIs à direita

### Player Cards FIFA
- [ ] Score "70" no topo esquerdo
- [ ] Medal badge no topo direito
- [ ] Avatar com ring de XP
- [ ] Level badge abaixo do avatar
- [ ] Barra de progresso XP
- [ ] Stats grid no footer (Leads/Resp/Meet/Vendas)
- [ ] Cores por rank (gold/silver/bronze)

### Gauges
- [ ] Versão ring circular compacta
- [ ] Info à esquerda + Visual à direita
- [ ] Gradiente no ring (verde→cyan ou laranja→amarelo)
- [ ] Glow no stroke

### Calendário
- [ ] Fundo branco (contraste)
- [ ] Grid de dias do mês
- [ ] Destaque no dia atual
- [ ] Seção "Hoje" com eventos

### Sidebar Direita
- [ ] Ranking do Time
- [ ] Calendário/Agenda
- [ ] Streak compacto
- [ ] Missões compactas

### Remover
- [ ] Feed de Atividades
- [ ] Card de Nível Individual

---

## REFERÊNCIA VISUAL

O arquivo HTML de referência está em:
`superdash-cockpit-v2.html`

Abra no navegador em tela cheia (F11) para simular TV.

---

**Documento v2.0**  
**Para:** Claude Code / Desenvolvedor  
**Foco:** Modo TV/Cockpit com Player Cards FIFA e Calendário