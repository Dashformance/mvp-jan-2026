# 🎴 SUPERDASH — Player Card FIFA Ultimate Team Style
## Prompt de Direcionamento para Implementação

---

## 1. CONCEITO VISUAL

O Player Card do Superdash é inspirado nos cards do FIFA Ultimate Team. Cada vendedor tem um card que representa seu desempenho com:

- **Score** principal (0-99) baseado na performance
- **Tier/Rank** visual (Gold, Diamond, Platinum, Emerald)
- **Role** do vendedor (SDR, CLO, JR, MGR)
- **Stats** de performance comercial
- **Level** de gamificação

---

## 2. ANATOMIA DO CARD

```
┌─────────────────────────────────┐
│  [TIER]              PERÍODO    │  ← Top Section
│                      Edição     │
│   92                    🔥      │  ← Score + Badge
│   SDR                           │  ← Role
│                                 │
│         ┌─────────────┐         │
│         │             │         │  ← Avatar Section
│         │     JV      │         │
│         │             │         │
│         └─────────────┘         │
│            [LVL 12]             │  ← Level Badge
│                                 │
│  ═══════════════════════════════│
│          J. VITOR               │  ← Name Banner
│  ═══════════════════════════════│
│                                 │
│   145 LEADS      93 CONV%       │  ← Stats Grid
│    68 RESP       24 MEET        │
│    12 VENDAS     85 XP/DIA      │
│                                 │
│             ✦                   │  ← Footer Logo
└─────────────────────────────────┘
```

---

## 3. TIERS E CORES

### 3.1 Gold (Ultimate)
```css
--card-primary: #C9A227;
--card-secondary: #8B7021;
--card-accent: #FFD700;
--card-glow: rgba(255, 215, 0, 0.3);
--card-text: #1a1a0a;
background: linear-gradient(145deg, #8B7021 0%, #C9A227 30%, #A6891A 60%, #8B7021 100%);
```
**Critério:** Top 10% em XP ou Score ≥ 90

### 3.2 Diamond
```css
--card-primary: #B9F2FF;
--card-secondary: #1E3A5F;
--card-accent: #00D4FF;
--card-glow: rgba(0, 212, 255, 0.4);
--card-text: #0a1a2a;
background: linear-gradient(145deg, #1E3A5F 0%, #2E5A8F 30%, #1E4A7F 60%, #0E2A4F 100%);
```
**Critério:** Top 25% ou Score 80-89

### 3.3 Platinum
```css
--card-primary: #E5E4E2;
--card-secondary: #4A4A4A;
--card-accent: #FFFFFF;
--card-glow: rgba(255, 255, 255, 0.3);
--card-text: #1a1a1a;
background: linear-gradient(145deg, #3A3A3A 0%, #5A5A5A 30%, #4A4A4A 60%, #2A2A2A 100%);
```
**Critério:** Top 50% ou Score 70-79

### 3.4 Emerald (Rising)
```css
--card-primary: #00FF88;
--card-secondary: #0A3D2A;
--card-accent: #00FF88;
--card-glow: rgba(0, 255, 136, 0.4);
--card-text: #0a2a1a;
background: linear-gradient(145deg, #0A3D2A 0%, #1A5D4A 30%, #0A4D3A 60%, #0A2D1A 100%);
```
**Critério:** Novatos ou Score < 70

### 3.5 (Opcional) Bronze
```css
--card-primary: #CD7F32;
--card-secondary: #4A3520;
--card-accent: #CD7F32;
--card-text: #1a1a0a;
```
**Critério:** Em desenvolvimento ou Score < 50

---

## 4. ESTRUTURA HTML

```html
<div class="player-card gold"> <!-- Tier class -->
  <div class="card-content">
    
    <!-- TOP SECTION -->
    <div class="card-top">
      <div class="card-left">
        <div class="tier-badge">Ultimate</div>
        <div class="player-score">
          <span class="score-value">92</span>
          <span class="score-role">SDR</span>
        </div>
      </div>
      <div class="card-right">
        <div class="card-period">
          Jan 2026<br>
          <span class="card-edition">Top Seller</span>
        </div>
        <div class="card-badge">🔥</div>
      </div>
    </div>

    <!-- AVATAR SECTION -->
    <div class="avatar-section">
      <div class="avatar-container">
        <div class="avatar-bg"></div>
        <div class="avatar">JV</div>
        <!-- Ou com imagem: <div class="avatar"><img src="..." /></div> -->
        <div class="level-indicator">LVL 12</div>
      </div>
    </div>

    <!-- NAME BANNER -->
    <div class="name-banner">
      <div class="player-name">J. VITOR</div>
    </div>

    <!-- STATS SECTION -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-row">
          <span class="stat-value">145</span>
          <span class="stat-label">LEADS</span>
        </div>
        <div class="stat-row">
          <span class="stat-value">93</span>
          <span class="stat-label">CONV%</span>
        </div>
        <!-- ... mais stats -->
      </div>
      <div class="card-footer">
        <span class="card-logo">✦</span>
      </div>
    </div>
    
  </div>
</div>
```

---

## 5. CSS COMPLETO

### 5.1 Base do Card

```css
.player-card {
  width: 280px;
  aspect-ratio: 0.714; /* Proporção FIFA */
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.player-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 35px 70px rgba(0, 0, 0, 0.6),
    0 0 60px var(--card-glow);
}
```

### 5.2 Diagonal Lines Pattern

```css
.player-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.03) 2px,
    rgba(255, 255, 255, 0.03) 4px
  );
  pointer-events: none;
  z-index: 1;
}
```

### 5.3 Inner Border

```css
.player-card::after {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  pointer-events: none;
  z-index: 2;
}
```

### 5.4 Score

```css
.score-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
  color: var(--card-accent);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.score-role {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--card-accent);
  opacity: 0.9;
}
```

### 5.5 Name Banner (Clip-path)

```css
.name-banner {
  background: var(--card-accent);
  padding: 12px 16px;
  text-align: center;
  clip-path: polygon(0 20%, 5% 0, 95% 0, 100% 20%, 100% 100%, 0 100%);
}

.player-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--card-text);
  letter-spacing: 1px;
  text-transform: uppercase;
}
```

### 5.6 Stats Grid

```css
.stats-section {
  background: var(--card-accent);
  padding: 12px 20px 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--card-text);
  min-width: 32px;
}

.stat-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--card-text);
  opacity: 0.7;
  letter-spacing: 0.5px;
}
```

### 5.7 Level Indicator

```css
.level-indicator {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--card-text);
  color: var(--card-accent);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 10px;
  border: 2px solid var(--card-accent);
}
```

---

## 6. STATS DISPONÍVEIS

| Stat | Label | Descrição |
|------|-------|-----------|
| LEADS | Leads contatados | Total de leads trabalhados |
| RESP | Respostas | Leads que responderam |
| MEET | Reuniões | Reuniões agendadas |
| VENDAS | Vendas fechadas | Conversões |
| CONV% | Taxa de conversão | (Vendas/Leads) × 100 |
| XP/DIA | XP médio por dia | Gamificação |

---

## 7. CÁLCULO DO SCORE

O Score (0-99) é calculado com base em múltiplas métricas:

```javascript
function calculateScore(stats, meta) {
  const weights = {
    leads: 0.15,
    respostas: 0.15,
    reunioes: 0.20,
    vendas: 0.30,
    conversao: 0.20
  };
  
  const scores = {
    leads: Math.min((stats.leads / meta.leads) * 100, 100),
    respostas: Math.min((stats.respostas / meta.respostas) * 100, 100),
    reunioes: Math.min((stats.reunioes / meta.reunioes) * 100, 100),
    vendas: Math.min((stats.vendas / meta.vendas) * 100, 100),
    conversao: Math.min((stats.conversao / meta.conversao) * 100, 100)
  };
  
  const weighted = Object.keys(weights).reduce((sum, key) => {
    return sum + (scores[key] * weights[key]);
  }, 0);
  
  // Normalizar para 0-99
  return Math.min(Math.round(weighted * 0.99), 99);
}
```

---

## 8. DETERMINAÇÃO DO TIER

```javascript
function getTier(score, ranking, totalPlayers) {
  const percentile = (ranking / totalPlayers) * 100;
  
  if (score >= 90 || percentile <= 10) {
    return 'gold'; // Ultimate
  } else if (score >= 80 || percentile <= 25) {
    return 'diamond';
  } else if (score >= 70 || percentile <= 50) {
    return 'platinum';
  } else {
    return 'emerald'; // Rising
  }
}
```

---

## 9. BADGES DISPONÍVEIS

| Badge | Emoji | Critério |
|-------|-------|----------|
| Em Chamas | 🔥 | Streak ≥ 5 dias |
| Diamante | 💎 | Tier Diamond |
| Raio | ⚡ | Maior crescimento do mês |
| Estrela | ⭐ | Melhor conversão |
| Troféu | 🏆 | #1 do ranking |
| Medalha | 🥇 | Top 3 |
| Foguete | 🚀 | Maior evolução |
| Coroa | 👑 | MVP do mês |

---

## 10. RESPONSIVIDADE

```css
/* Para grids de cards */
.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 280px));
  gap: 24px;
  justify-content: center;
}

/* Card menor para mobile */
@media (max-width: 768px) {
  .player-card {
    width: 200px;
  }
  
  .score-value {
    font-size: 40px;
  }
  
  .stat-value {
    font-size: 14px;
  }
}
```

---

## 11. ANIMAÇÕES

### Entrada do Card
```css
@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.player-card {
  animation: cardEntrance 0.5s ease-out;
}
```

### Glow Pulse (para Top 1)
```css
@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 30px var(--card-glow);
  }
  50% {
    box-shadow: 0 0 60px var(--card-glow);
  }
}

.player-card.gold.rank-1 {
  animation: glowPulse 2s ease-in-out infinite;
}
```

---

## 12. INTEGRAÇÃO COM REACT

```tsx
interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    initials: string;
    avatar?: string;
    role: 'SDR' | 'CLO' | 'JR' | 'MGR';
    level: number;
    stats: {
      leads: number;
      respostas: number;
      reunioes: number;
      vendas: number;
      conversao: number;
      xpDia: number;
    };
  };
  score: number;
  tier: 'gold' | 'diamond' | 'platinum' | 'emerald';
  ranking?: number;
  period?: string;
  edition?: string;
  badge?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  score, 
  tier, 
  ranking,
  period = 'Jan 2026',
  edition = 'Top Seller',
  badge = '🔥'
}) => {
  return (
    <div className={`player-card ${tier}`}>
      {/* ... estrutura do card */}
    </div>
  );
};
```

---

## 13. CHECKLIST DE IMPLEMENTAÇÃO

### Visual
- [ ] Background com gradiente do tier
- [ ] Linhas diagonais (repeating-linear-gradient)
- [ ] Inner border com opacidade
- [ ] Score grande (Space Grotesk 56px)
- [ ] Name banner com clip-path
- [ ] Stats grid 2 colunas
- [ ] Level badge no avatar
- [ ] Hover com glow e lift

### Lógica
- [ ] Cálculo do Score (0-99)
- [ ] Determinação do Tier
- [ ] Ranking position
- [ ] Badge selection

### Animações
- [ ] Entrada do card
- [ ] Hover effect
- [ ] Glow pulse para #1

---

## REFERÊNCIA VISUAL

Arquivo de preview: `superdash-playercard-fifa.html`

Mostra 3 variações:
1. **Gold/Ultimate** — J. Vitor (Score 92)
2. **Diamond** — Bruno (Score 88)
3. **Emerald/Rising** — Nitz (Score 74)

---

**Documento v1.0**  
**Para:** Claude Code / Desenvolvedor  
**Componente:** PlayerCard FIFA Style
