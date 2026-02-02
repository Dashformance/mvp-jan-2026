'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

// ===== TYPES =====
export type CardTier = 'gold' | 'diamond' | 'platinum' | 'emerald' | 'bronze';
export type PlayerRole = 'SDR' | 'CLO' | 'JR' | 'MGR' | 'CEO' | string;

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
    avatar?: string | null;
    role: PlayerRole;
    level: number;
    score: number;
    tier: CardTier;
    stats: any; // Flexible to accommodate different stats shapes
    ranking?: number;
    period?: string;
    edition?: string;
    badge?: string;
    className?: string;
    onClick?: () => void;
}

// ===== TIER CONFIGURATIONS (Exact Reference Palette) =====
const tierConfig: Record<CardTier, {
    label: string;
    gradient: string;
    accent: string;
    highlight: string;
    textColor: string;
}> = {
    gold: {
        label: 'ULTIMATE',
        gradient: 'linear-gradient(180deg, #B59410 0%, #D4AF37 100%)',
        accent: '#FFD200', // Vibrant Yellow
        highlight: '#FFFF8D', // Lighter Vibrant Yellow
        textColor: '#000000',
    },
    diamond: {
        label: 'DIAMOND',
        gradient: 'linear-gradient(180deg, #1B436D 0%, #2E5A8F 100%)',
        accent: '#00D5FF', // Vibrant Cyan
        highlight: '#84FFFF', // Lighter Vibrant Cyan
        textColor: '#000000',
    },
    platinum: {
        label: 'PLATINUM',
        gradient: 'linear-gradient(180deg, #3A3A3A 0%, #5A5A5A 100%)',
        accent: '#FFFFFF',
        highlight: '#FFFFFF',
        textColor: '#000000',
    },
    emerald: {
        label: 'RISING',
        gradient: 'linear-gradient(180deg, #0E4B31 0%, #1A5D4A 100%)',
        accent: '#00FF88', // Neon Green
        highlight: '#B9F6CA', // Lighter Vibrant Green
        textColor: '#000000',
    },
    bronze: {
        label: 'STARTER',
        gradient: 'linear-gradient(180deg, #4A3520 0%, #6B5010 100%)',
        accent: '#CD7F32',
        highlight: '#FFCCBC',
        textColor: '#000000',
    },
};

// Internal mapping for props discrepancy
const mapStats = (stats: any) => {
    return {
        leads: stats.leads ?? stats.contacts ?? 0,
        conversao: stats.conversao ?? stats.quality ?? 0,
        respostas: stats.respostas ?? stats.responses ?? 0,
        reunioes: stats.reunioes ?? stats.meetings ?? 0
    };
};

export function PlayerCard({
    name,
    initials: initialsProp,
    avatar,
    role,
    level,
    score,
    tier,
    stats: rawStats,
    period = 'Jan 2026',
    edition = 'Top Seller',
    badge = '🔥',
    className,
    onClick,
}: PlayerCardProps) {
    const config = tierConfig[tier] || tierConfig.emerald;
    const stats = mapStats(rawStats);

    const getBannerName = (fullName: string) => {
        const parts = fullName.trim().toUpperCase().split(' ');
        if (parts.length > 1) {
            return `${parts[0].charAt(0)}. ${parts[parts.length - 1]}`;
        }
        return fullName.toUpperCase();
    };

    const getDisplayCode = () => {
        const n = name.toLowerCase();
        if (n.includes('joão') || n.includes('joao')) return 'JVG-JOAO';
        if (n.includes('bruno')) return 'BRN-BRUNO';
        if (n.includes('vitor')) return 'VTZ-VITOR';
        return role?.toUpperCase() || 'SDR';
    };

    const getInitials = () => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const displayCode = getDisplayCode();
    const bannerName = getBannerName(name);
    const initials = initialsProp || getInitials();

    return (
        <div
            onClick={onClick}
            className={cn(
                'player-card-container group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
                className
            )}
            style={{
                width: '240px',
                height: '380px',
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default',
                background: config.gradient,
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Metallice Shine Overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)',
                    pointerEvents: 'none',
                    zIndex: 4,
                }}
            />

            {/* Pattern Overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.15,
                    pointerEvents: 'none',
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 9px)',
                }}
            />

            {/* TOP SECTION */}
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                        fontSize: '9px',
                        fontWeight: 900,
                        color: config.accent,
                        background: 'rgba(0,0,0,0.4)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        width: 'fit-content',
                        marginBottom: '4px'
                    }}>
                        {config.label}
                    </span>
                    <span style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '56px',
                        fontWeight: 800,
                        lineHeight: 0.85,
                        color: config.highlight,
                        letterSpacing: '-2px'
                    }}>
                        {score}
                    </span>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: config.accent,
                        opacity: 0.8,
                        marginTop: '2px'
                    }}>
                        {displayCode}
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ textAlign: 'right', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                        <div>{period}</div>
                        <div>{edition}</div>
                    </div>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.3)',
                        border: `2px solid ${config.accent}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        boxShadow: `0 0 10px ${config.accent}44`
                    }}>
                        {badge}
                    </div>
                </div>
            </div>

            {/* AVATAR SECTION - Liquid Glass Effect */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    {/* Glass Container */}
                    <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.02)', // Slightly more visible glass
                        backdropFilter: 'blur(12px)', // Stronger blur
                        border: '1px solid rgba(255,255,255,0.15)',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Glass shadow
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {avatar ? (
                            <Image src={avatar} alt={name} fill className="object-cover" />
                        ) : (
                            <span style={{ fontSize: '42px', fontWeight: 700, color: config.highlight, opacity: 0.9 }}>
                                {initials}
                            </span>
                        )}
                    </div>

                    {/* LVL BADGE */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#0D0D0D',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '42px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                        <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>LVL</span>
                        <span style={{ fontSize: '13px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{level}</span>
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION - Solid Accent with Polygon Clip */}
            <div style={{
                background: config.accent,
                padding: '16px 0 20px',
                position: 'relative',
                clipPath: 'polygon(0 15%, 8% 0, 92% 0, 100% 15%, 100% 100%, 0 100%)',
                marginTop: '10px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <span style={{
                        fontSize: '18px',
                        fontWeight: 900,
                        color: config.textColor,
                        letterSpacing: '0px'
                    }}>
                        {bannerName}
                    </span>
                </div>

                {/* METRICS GRID 2x2 - Value and Label Side-by-Side */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px 16px',
                    padding: '0 24px'
                }}>
                    <MetricItem value={stats.leads} label="LEADS" color={config.textColor} />
                    <MetricItem value={`${stats.conversao}%`} label="CONV%" color={config.textColor} />
                    <MetricItem value={stats.respostas} label="RESP" color={config.textColor} />
                    <MetricItem value={stats.reunioes} label="MEET" color={config.textColor} />
                </div>
            </div>
        </div>
    );
}

// Side-by-Side Metric Layout
function MetricItem({ value, label, color }: { value: string | number, label: string, color: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: '9px', fontWeight: 800, color, opacity: 0.7, lineHeight: 1 }}>{label}</span>
        </div>
    );
}

export default PlayerCard;
