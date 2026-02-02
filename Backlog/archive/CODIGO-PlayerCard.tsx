// ===========================================================
// 📁 ARQUIVO: components/gamification/PlayerCard.tsx
// ===========================================================
// Copie TODO o conteúdo abaixo e cole no arquivo

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
    gradient: 'linear-gradient(145deg, #8B7021 0%, #C9A227 30%, #A6891A 60%, #8B7021 100%)',
    accent: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.3)',
    textColor: '#1a1a0a',
  },
  diamond: {
    label: 'Diamond',
    gradient: 'linear-gradient(145deg, #1E3A5F 0%, #2E5A8F 30%, #1E4A7F 60%, #0E2A4F 100%)',
    accent: '#00D4FF',
    glow: 'rgba(0, 212, 255, 0.4)',
    textColor: '#0a1a2a',
  },
  platinum: {
    label: 'Platinum',
    gradient: 'linear-gradient(145deg, #3A3A3A 0%, #5A5A5A 30%, #4A4A4A 60%, #2A2A2A 100%)',
    accent: '#FFFFFF',
    glow: 'rgba(255, 255, 255, 0.3)',
    textColor: '#1a1a1a',
  },
  emerald: {
    label: 'Rising',
    gradient: 'linear-gradient(145deg, #0A3D2A 0%, #1A5D4A 30%, #0A4D3A 60%, #0A2D1A 100%)',
    accent: '#00FF88',
    glow: 'rgba(0, 255, 136, 0.4)',
    textColor: '#0a2a1a',
  },
  bronze: {
    label: 'Starter',
    gradient: 'linear-gradient(145deg, #4A3520 0%, #8B6914 30%, #6B5010 60%, #4A3520 100%)',
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
        'player-card-container',
        className
      )}
      style={{
        width: '280px',
        aspectRatio: '0.714',
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        background: config.gradient,
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 35px 70px rgba(0, 0, 0, 0.6), 0 0 60px ${config.glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)';
      }}
    >
      {/* Diagonal Lines Pattern */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
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
      <div 
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          right: '8px',
          bottom: '8px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* TOP SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 16px 0' }}>
          {/* Left: Tier + Score */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span 
              style={{ 
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                background: 'rgba(0,0,0,0.3)',
                color: config.accent,
                backdropFilter: 'blur(4px)',
              }}
            >
              {config.label}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span 
                style={{ 
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '56px',
                  fontWeight: 700,
                  lineHeight: 1,
                  color: config.accent,
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                {score}
              </span>
              <span 
                style={{ 
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  color: config.accent,
                  opacity: 0.9,
                }}
              >
                {role}
              </span>
            </div>
          </div>
          
          {/* Right: Period + Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{period}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>{edition}</div>
            </div>
            <div 
              style={{ 
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                background: 'rgba(0,0,0,0.2)',
                border: `2px solid ${config.accent}`,
              }}
            >
              {badge}
            </div>
          </div>
        </div>
        
        {/* AVATAR SECTION */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            {/* Glow background */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '12px',
                opacity: 0.3,
                background: `linear-gradient(180deg, transparent 0%, ${config.accent} 100%)`,
              }}
            />
            {/* Avatar */}
            <div 
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              }}
            >
              {avatar ? (
                <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span 
                  style={{ 
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '48px',
                    fontWeight: 700,
                    color: config.accent,
                  }}
                >
                  {initials}
                </span>
              )}
            </div>
            {/* Level Badge */}
            <div 
              style={{ 
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '4px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
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
          style={{ 
            padding: '12px 16px',
            textAlign: 'center',
            background: config.accent,
            clipPath: 'polygon(0 20%, 5% 0, 95% 0, 100% 20%, 100% 100%, 0 100%)',
          }}
        >
          <span 
            style={{ 
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: config.textColor,
            }}
          >
            {name}
          </span>
        </div>
        
        {/* STATS SECTION */}
        <div 
          style={{ 
            padding: '12px 20px 20px',
            background: config.accent,
            position: 'relative',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            <StatRow value={stats.leads} label="LEADS" textColor={config.textColor} />
            <StatRow value={stats.conversao} label="CONV%" textColor={config.textColor} />
            <StatRow value={stats.respostas} label="RESP" textColor={config.textColor} />
            <StatRow value={stats.reunioes} label="MEET" textColor={config.textColor} />
            <StatRow value={stats.vendas} label="VENDAS" textColor={config.textColor} />
            <StatRow value={stats.xpDia} label="XP/DIA" textColor={config.textColor} />
          </div>
          
          {/* Footer Logo */}
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)' }}>
            <span style={{ color: config.textColor, opacity: 0.4, fontSize: '16px' }}>✦</span>
          </div>
        </div>
      </div>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span 
        style={{ 
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '18px',
          fontWeight: 700,
          minWidth: '32px',
          color: textColor,
        }}
      >
        {value}
      </span>
      <span 
        style={{ 
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          color: textColor,
          opacity: 0.7,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default PlayerCard;
