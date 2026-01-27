# 🎴 PROMPT: Implementar Player Card FIFA no Dashformance

## CONTEXTO

Você está trabalhando no **Dashformance**, um CRM de prospecção B2B. A stack é:
- Next.js 16.1.1 (App Router)
- React 19.2.3
- TypeScript 5
- TailwindCSS v4
- Prisma 6.19.1 + PostgreSQL (Supabase)
- Radix UI (componentes headless)

**Objetivo:** Criar componentes de Player Card estilo FIFA Ultimate Team para gamificação dos vendedores.

---

## ARQUIVOS A CRIAR

```
client/
├── components/
│   └── gamification/
│       ├── PlayerCard.tsx          # Componente principal
│       ├── PlayerCardMini.tsx      # Versão compacta para listas
│       └── player-card.css         # Estilos específicos (ou usar Tailwind)
├── lib/
│   └── utils/
│       └── score-calculator.ts     # Lógica de cálculo
└── app/
    └── api/
        └── gamification/
            └── scores/
                └── route.ts        # Endpoint de scores
```

---

## 1. COMPONENTE: PlayerCard.tsx

Crie o arquivo `components/gamification/PlayerCard.tsx`:

```tsx
'use client';

import { cn } from '@/lib/utils';

// ===== TIPOS =====
export type CardTier = 'gold' | 'diamond' | 'platinum' | 'emerald' | 'bronze';
export type PlayerRole = 'SDR' | 'CLO' | 'JR' | 'MGR' | 'CEO';

export interface PlayerStats {
  leads: number;
  respostas: number;
  reunioes: number;
  vendas: number;
  conversao: number;
  xpDia: number;
}

export interface PlayerCardProps {
  name: string;
  initials: string;
  avatar?: string;
  role: PlayerRole;
  level: number;
  score: number;
  tier: CardTier;
  stats: PlayerStats;
  ranking?: number;
  period?: string;
  edition?: string;
  badge?: string;
  className?: string;
  onClick?: () => void;
}

// ===== CONFIGURAÇÃO DE TIERS =====
const tierConfig: Record<CardTier, {
  label: string;
  gradient: string;
  accent: string;
  glow: string;
  textColor: string;
}> = {
  gold: {
    label: 'Ultimate',
    gradient: 'from-[#8B7021] via-[#C9A227] to-[#8B7021]',
    accent: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.3)',
    textColor: '#1a1a0a',
  },
  diamond: {
    label: 'Diamond',
    gradient: 'from-[#1E3A5F] via-[#2E5A8F] to-[#0E2A4F]',
    accent: '#00D4FF',
    glow: 'rgba(0, 212, 255, 0.4)',
    textColor: '#0a1a2a',
  },
  platinum: {
    label: 'Platinum',
    gradient: 'from-[#3A3A3A] via-[#5A5A5A] to-[#2A2A2A]',
    accent: '#FFFFFF',
    glow: 'rgba(255, 255, 255, 0.3)',
    textColor: '#1a1a1a',
  },
  emerald: {
    label: 'Rising',
    gradient: 'from-[#0A3D2A] via-[#1A5D4A] to-[#0A2D1A]',
    accent: '#00FF88',
    glow: 'rgba(0, 255, 136, 0.4)',
    textColor: '#0a2a1a',
  },
  bronze: {
    label: 'Starter',
    gradient: 'from-[#4A3520] via-[#8B6914] to-[#4A3520]',
    accent: '#CD7F32',
    glow: 'rgba(205, 127, 50, 0.3)',
    textColor: '#1a1a0a',
  },
};

// ===== COMPONENTE PRINCIPAL =====
export function PlayerCard({
  name,
  initials,
  avatar,
  role,
  level,
  score,
  tier,
  stats,
  ranking,
  period = 'Jan 2026',
  edition = 'Top Seller',
  badge = '🔥',
  className,
  onClick,
}: PlayerCardProps) {
  const config = tierConfig[tier];
  
  return (
    <div
      onClick={onClick}
      className={cn(
        // Base
        'relative w-[280px] aspect-[0.714] rounded-2xl overflow-hidden cursor-pointer',
        // Gradient background
        `bg-gradient-to-br ${config.gradient}`,
        // Shadow e glow
        'shadow-[0_25px_50px_rgba(0,0,0,0.5)]',
        // Hover
        'transition-all duration-300 ease-out',
        'hover:-translate-y-2 hover:scale-[1.02]',
        className
      )}
      style={{
        '--card-accent': config.accent,
        '--card-glow': config.glow,
        '--card-text': config.textColor,
      } as React.CSSProperties}
    >
      {/* Diagonal Lines Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.03) 2px,
            rgba(255, 255, 255, 0.03) 4px
          )`,
        }}
      />
      
      {/* Inner Border */}
      <div className="absolute inset-2 border border-white/15 rounded-xl pointer-events-none z-[2]" />
      
      {/* Content */}
      <div className="relative z-[3] h-full flex flex-col">
        
        {/* TOP SECTION */}
        <div className="flex justify-between items-start p-4 pb-0">
          {/* Left: Tier + Score */}
          <div className="flex flex-col gap-2">
            <span 
              className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase backdrop-blur-sm"
              style={{ 
                background: 'rgba(0,0,0,0.3)',
                color: config.accent,
              }}
            >
              {config.label}
            </span>
            <div className="flex flex-col">
              <span 
                className="font-['Space_Grotesk'] text-[56px] font-bold leading-none"
                style={{ 
                  color: config.accent,
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                {score}
              </span>
              <span 
                className="text-sm font-extrabold tracking-wider opacity-90"
                style={{ color: config.accent }}
              >
                {role}
              </span>
            </div>
          </div>
          
          {/* Right: Period + Badge */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-[10px] font-semibold text-white/70">{period}</div>
              <div className="text-[9px] text-white/50">{edition}</div>
            </div>
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
              style={{ 
                background: 'rgba(0,0,0,0.2)',
                border: `2px solid ${config.accent}`,
              }}
            >
              {badge}
            </div>
          </div>
        </div>
        
        {/* AVATAR SECTION */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative w-[120px] h-[120px]">
            {/* Glow background */}
            <div 
              className="absolute inset-0 rounded-xl opacity-30"
              style={{
                background: `linear-gradient(180deg, transparent 0%, ${config.accent} 100%)`,
              }}
            />
            {/* Avatar */}
            <div 
              className="relative w-full h-full rounded-xl flex items-center justify-center border-2 border-white/10 overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              }}
            >
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span 
                  className="font-['Space_Grotesk'] text-5xl font-bold"
                  style={{ color: config.accent }}
                >
                  {initials}
                </span>
              )}
            </div>
            {/* Level Badge */}
            <div 
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-xs font-bold"
              style={{ 
                background: config.textColor,
                color: config.accent,
                border: `2px solid ${config.accent}`,
              }}
            >
              LVL {level}
            </div>
          </div>
        </div>
        
        {/* NAME BANNER */}
        <div 
          className="py-3 px-4 text-center"
          style={{ 
            background: config.accent,
            clipPath: 'polygon(0 20%, 5% 0, 95% 0, 100% 20%, 100% 100%, 0 100%)',
          }}
        >
          <span 
            className="font-['Space_Grotesk'] text-lg font-bold tracking-wider uppercase"
            style={{ color: config.textColor }}
          >
            {name}
          </span>
        </div>
        
        {/* STATS SECTION */}
        <div 
          className="px-5 py-3 pb-5"
          style={{ background: config.accent }}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <StatRow value={stats.leads} label="LEADS" textColor={config.textColor} />
            <StatRow value={stats.conversao} label="CONV%" textColor={config.textColor} />
            <StatRow value={stats.respostas} label="RESP" textColor={config.textColor} />
            <StatRow value={stats.reunioes} label="MEET" textColor={config.textColor} />
            <StatRow value={stats.vendas} label="VENDAS" textColor={config.textColor} />
            <StatRow value={stats.xpDia} label="XP/DIA" textColor={config.textColor} />
          </div>
          
          {/* Footer Logo */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <span style={{ color: config.textColor, opacity: 0.4 }}>✦</span>
          </div>
        </div>
      </div>
      
      {/* Hover Glow Effect */}
      <style jsx>{`
        div:hover {
          box-shadow: 
            0 35px 70px rgba(0, 0, 0, 0.6),
            0 0 60px var(--card-glow);
        }
      `}</style>
    </div>
  );
}

// ===== STAT ROW COMPONENT =====
function StatRow({ 
  value, 
  label, 
  textColor 
}: { 
  value: number; 
  label: string; 
  textColor: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span 
        className="font-['Space_Grotesk'] text-lg font-bold min-w-[32px]"
        style={{ color: textColor }}
      >
        {value}
      </span>
      <span 
        className="text-[11px] font-bold tracking-wide opacity-70"
        style={{ color: textColor }}
      >
        {label}
      </span>
    </div>
  );
}

export default PlayerCard;
```

---

## 2. UTILITÁRIO: score-calculator.ts

Crie o arquivo `lib/utils/score-calculator.ts`:

```typescript
import type { CardTier, PlayerStats } from '@/components/gamification/PlayerCard';

// ===== METAS PADRÃO =====
export interface PerformanceMeta {
  leads: number;
  respostas: number;
  reunioes: number;
  vendas: number;
  conversao: number;
}

export const DEFAULT_META: PerformanceMeta = {
  leads: 100,
  respostas: 50,
  reunioes: 20,
  vendas: 10,
  conversao: 10, // 10%
};

// ===== PESOS PARA CÁLCULO =====
const WEIGHTS = {
  leads: 0.15,
  respostas: 0.15,
  reunioes: 0.20,
  vendas: 0.30,
  conversao: 0.20,
};

// ===== CALCULAR SCORE (0-99) =====
export function calculateScore(
  stats: Omit<PlayerStats, 'xpDia'>,
  meta: PerformanceMeta = DEFAULT_META
): number {
  const scores = {
    leads: Math.min((stats.leads / meta.leads) * 100, 100),
    respostas: Math.min((stats.respostas / meta.respostas) * 100, 100),
    reunioes: Math.min((stats.reunioes / meta.reunioes) * 100, 100),
    vendas: Math.min((stats.vendas / meta.vendas) * 100, 100),
    conversao: Math.min((stats.conversao / meta.conversao) * 100, 100),
  };
  
  const weighted = Object.keys(WEIGHTS).reduce((sum, key) => {
    return sum + (scores[key as keyof typeof scores] * WEIGHTS[key as keyof typeof WEIGHTS]);
  }, 0);
  
  // Normalizar para 0-99
  return Math.min(Math.round(weighted * 0.99), 99);
}

// ===== DETERMINAR TIER =====
export function getTier(
  score: number,
  ranking: number,
  totalPlayers: number
): CardTier {
  const percentile = (ranking / totalPlayers) * 100;
  
  if (score >= 90 || percentile <= 10) {
    return 'gold';
  } else if (score >= 80 || percentile <= 25) {
    return 'diamond';
  } else if (score >= 70 || percentile <= 50) {
    return 'platinum';
  } else if (score >= 50) {
    return 'emerald';
  } else {
    return 'bronze';
  }
}

// ===== SELECIONAR BADGE =====
export function getBadge(
  score: number,
  ranking: number,
  streak?: number
): string {
  if (ranking === 1) return '👑';
  if (ranking <= 3) return '🏆';
  if (streak && streak >= 5) return '🔥';
  if (score >= 90) return '⭐';
  if (score >= 80) return '💎';
  return '⚡';
}

// ===== CALCULAR XP DIÁRIO =====
export function calculateDailyXP(stats: Omit<PlayerStats, 'xpDia'>): number {
  const XP_VALUES = {
    lead: 10,
    resposta: 15,
    reuniao: 50,
    venda: 200,
  };
  
  return (
    stats.leads * XP_VALUES.lead +
    stats.respostas * XP_VALUES.resposta +
    stats.reunioes * XP_VALUES.reuniao +
    stats.vendas * XP_VALUES.venda
  );
}

// ===== HELPER COMPLETO =====
export function generatePlayerCard(
  stats: Omit<PlayerStats, 'xpDia' | 'conversao'>,
  ranking: number,
  totalPlayers: number,
  streak?: number,
  meta?: PerformanceMeta
) {
  const conversao = stats.leads > 0 
    ? Math.round((stats.vendas / stats.leads) * 100) 
    : 0;
    
  const fullStats: Omit<PlayerStats, 'xpDia'> = {
    ...stats,
    conversao,
  };
  
  const score = calculateScore(fullStats, meta);
  const tier = getTier(score, ranking, totalPlayers);
  const badge = getBadge(score, ranking, streak);
  const xpDia = calculateDailyXP(fullStats);
  
  return {
    score,
    tier,
    badge,
    stats: {
      ...fullStats,
      xpDia,
    },
  };
}
```

---

## 3. API ROUTE: /api/gamification/scores/route.ts

Crie o arquivo `app/api/gamification/scores/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePlayerCard } from '@/lib/utils/score-calculator';

export async function GET() {
  try {
    // Buscar stats de cada vendedor
    const owners = ['João', 'Vitor']; // ou buscar do banco
    
    const playerCards = await Promise.all(
      owners.map(async (owner, index) => {
        // Contagens do banco
        const [leads, respostas, reunioes, vendas] = await Promise.all([
          prisma.lead.count({
            where: { owner, deletedAt: null },
          }),
          prisma.lead.count({
            where: { owner, deletedAt: null, status: { in: ['CONTACTED', 'MEETING', 'WON'] } },
          }),
          prisma.lead.count({
            where: { owner, deletedAt: null, status: 'MEETING' },
          }),
          prisma.lead.count({
            where: { owner, deletedAt: null, status: 'WON' },
          }),
        ]);
        
        // Gerar card data
        const cardData = generatePlayerCard(
          { leads, respostas, reunioes, vendas },
          index + 1, // ranking (você pode calcular baseado em XP)
          owners.length,
          5 // streak (buscar do banco se tiver)
        );
        
        return {
          id: owner.toLowerCase(),
          name: owner,
          initials: owner.substring(0, 2).toUpperCase(),
          role: index === 0 ? 'SDR' : 'CLO',
          level: Math.floor(cardData.stats.xpDia / 100) + 1,
          ranking: index + 1,
          ...cardData,
        };
      })
    );
    
    // Ordenar por score
    playerCards.sort((a, b) => b.score - a.score);
    
    // Atualizar rankings
    playerCards.forEach((card, index) => {
      card.ranking = index + 1;
    });
    
    return NextResponse.json(playerCards);
  } catch (error) {
    console.error('Error fetching player scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player scores' },
      { status: 500 }
    );
  }
}
```

---

## 4. EXEMPLO DE USO

No seu Dashboard ou página de gamificação:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { PlayerCard, type PlayerCardProps } from '@/components/gamification/PlayerCard';

export default function GamificationPage() {
  const [players, setPlayers] = useState<PlayerCardProps[]>([]);
  
  useEffect(() => {
    fetch('/api/gamification/scores')
      .then(res => res.json())
      .then(setPlayers);
  }, []);
  
  return (
    <div className="min-h-screen bg-[#050505] p-8">
      <h1 className="text-2xl font-bold text-white mb-8">
        🏟️ Arena do Time
      </h1>
      
      <div className="flex flex-wrap gap-8 justify-center">
        {players.map((player) => (
          <PlayerCard
            key={player.name}
            {...player}
            onClick={() => console.log('Clicou em', player.name)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 5. ADICIONAR FONTE SPACE GROTESK

No seu `app/layout.tsx` ou `globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap');
```

Ou via Next.js Font:

```tsx
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});
```

---

## 6. TAILWIND CONFIG (se necessário)

Adicione ao seu `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        'card-gold': '#FFD700',
        'card-diamond': '#00D4FF',
        'card-emerald': '#00FF88',
        'card-bronze': '#CD7F32',
      },
    },
  },
};
```

---

## CHECKLIST DE IMPLEMENTAÇÃO

### Arquivos
- [ ] `components/gamification/PlayerCard.tsx`
- [ ] `lib/utils/score-calculator.ts`
- [ ] `app/api/gamification/scores/route.ts`

### Configuração
- [ ] Fonte Space Grotesk importada
- [ ] Tailwind config atualizado (opcional)

### Integração
- [ ] Página de gamificação criada
- [ ] API route testada
- [ ] Cards renderizando corretamente

### Visual
- [ ] Gradientes funcionando
- [ ] Linhas diagonais visíveis
- [ ] Hover com glow
- [ ] Name banner com clip-path
- [ ] Level badge posicionado

---

## RESULTADO ESPERADO

O componente deve renderizar cards idênticos ao design FIFA Ultimate Team:

- **Score grande** (56px) no canto superior esquerdo
- **Tier badge** (Ultimate/Diamond/Rising)
- **Avatar** centralizado com glow
- **Level badge** abaixo do avatar
- **Name banner** com recorte angular
- **Stats grid** 2x3 no footer
- **Hover effect** com elevação e glow

---

**IMPORTANTE:** Não modifique a estrutura visual. O design está finalizado e testado. Foque apenas na integração com a stack existente do Dashformance.
