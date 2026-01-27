"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PlayerStats {
    contacts: number;
    responses: number;
    meetings: number;
    sales: number;
    quality: number;
    xpToday: number;
}

interface PlayerCardProps {
    id: string;
    name: string;
    role: string;
    avatar: string | null | undefined;
    level: number;
    xp: number;
    nextLevelXp: number;
    score: number;
    stats: PlayerStats;
    badges: string[];
    rank?: number;
    isSelected?: boolean;
    onClick?: () => void;
    index?: number;
    period?: string;
    edition?: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
    id,
    name,
    role,
    avatar,
    level,
    xp,
    nextLevelXp,
    score,
    stats,
    badges,
    rank,
    isSelected = false,
    onClick,
    index = 0,
    period = "Jan 2026",
    edition = "Top Seller"
}) => {
    // Determine Tier based on Score
    const getTier = (s: number) => {
        if (s >= 90) return 'gold';
        if (s >= 80) return 'diamond';
        if (s >= 70) return 'platinum';
        return 'emerald';
    };

    const tier = getTier(score);

    // Determine visuals based on Score
    const getScoreColor = (val: number) => {
        if (val >= 90) return { text: "text-neon-green", bg: "bg-neon-green/40", border: "border-neon-green/30" };
        if (val >= 70) return { text: "text-accent", bg: "bg-accent/40", border: "border-accent/30" };
        return { text: "text-neon-yellow", bg: "bg-neon-yellow/40", border: "border-neon-yellow/30" };
    };

    // Badge selection based on rank or tier
    const getBadge = () => {
        if (rank === 1) return '🏆';
        if (stats.sales > 5) return '🔥';
        if (tier === 'gold') return '👑';
        if (tier === 'diamond') return '💎';
        if (tier === 'platinum') return '⭐';
        return '⚡';
    };

    const displayBadge = getBadge();
    const tierLabel = tier === 'gold' ? 'Ultimate' : tier.charAt(0).toUpperCase() + tier.slice(1);
    const visuals = getScoreColor(score);

    // Tier Styles Configuration (Exact match from HTML ref)
    const TIER_STYLES: Record<string, React.CSSProperties> = {
        gold: {
            ['--card-primary' as any]: '#C9A227',
            ['--card-secondary' as any]: '#8B7021',
            ['--card-accent' as any]: '#FFD700',
            ['--card-glow' as any]: 'rgba(255, 215, 0, 0.3)',
            ['--card-text' as any]: '#1a1a0a',
            background: 'linear-gradient(145deg, #8B7021 0%, #C9A227 30%, #A6891A 60%, #8B7021 100%)',
        },
        diamond: {
            ['--card-primary' as any]: '#B9F2FF',
            ['--card-secondary' as any]: '#1E3A5F',
            ['--card-accent' as any]: '#00D4FF',
            ['--card-glow' as any]: 'rgba(0, 212, 255, 0.4)',
            ['--card-text' as any]: '#0a1a2a',
            background: 'linear-gradient(145deg, #1E3A5F 0%, #2E5A8F 30%, #1E4A7F 60%, #0E2A4F 100%)',
        },
        platinum: {
            ['--card-primary' as any]: '#E5E4E2',
            ['--card-secondary' as any]: '#4A4A4A',
            ['--card-accent' as any]: '#FFFFFF',
            ['--card-glow' as any]: 'rgba(255, 255, 255, 0.3)',
            ['--card-text' as any]: '#1a1a1a',
            background: 'linear-gradient(145deg, #3A3A3A 0%, #5A5A5A 30%, #4A4A4A 60%, #2A2A2A 100%)',
        },
        emerald: {
            ['--card-primary' as any]: '#00FF88',
            ['--card-secondary' as any]: '#0A3D2A',
            ['--card-accent' as any]: '#00FF88',
            ['--card-glow' as any]: 'rgba(0, 255, 136, 0.4)',
            ['--card-text' as any]: '#0a2a1a',
            background: 'linear-gradient(145deg, #0A3D2A 0%, #1A5D4A 30%, #0A4D3A 60%, #0A2D1A 100%)',
        }
    };

    const currentStyle = TIER_STYLES[tier];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            onClick={onClick}
            style={{
                ...currentStyle,
                fontFamily: "'Inter', sans-serif"
            }}
            className={cn(
                "player-card cursor-pointer group",
                tier,
                isSelected && "selected-card"
            )}
        >
            <style jsx>{`
                .player-card {
                    width: 100%;
                    max-width: 280px;
                    aspect-ratio: 0.714;
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

                .selected-card {
                    ring: 3px solid var(--card-accent);
                    z-index: 10;
                }

                /* Diagonal Lines Pattern */
                .player-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
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

                /* Inner Border Glow */
                .player-card::after {
                    content: '';
                    position: absolute;
                    top: 8px; left: 8px; right: 8px; bottom: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    pointer-events: none;
                    z-index: 2;
                }

                .card-content { position: relative; z-index: 3; height: 100%; display: flex; flex-direction: column; }
                
                .card-top { display: flex; justify-content: space-between; padding: 16px 16px 0; }
                .tier-badge { background: rgba(0, 0, 0, 0.3); padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; color: var(--card-accent); text-transform: uppercase; }
                .score-value { font-family: var(--font-numbers, sans-serif); font-size: 48px; font-weight: 900; color: var(--card-accent); line-height: 1; text-shadow: 0 4px 12px rgba(0,0,0,0.3); }
                .score-role { font-size: 12px; font-weight: 800; color: var(--card-accent); opacity: 0.8; margin-top: -4px; letter-spacing: 1px; }
                
                .card-right { text-align: right; }
                .card-period { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.7); line-height: 1.2; }
                .card-edition { font-size: 9px; font-weight: 500; color: rgba(255,255,255,0.5); }
                .card-badge { width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.2); border: 2px solid var(--card-accent); display: flex; items-center; justify-center; font-size: 18px; margin-top: 8px; margin-left: auto; }

                .avatar-section { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; }
                .avatar-mask { width: 100%; height: 100%; background: linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); border: 2px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; display: flex; items-center; justify-center; }
                .avatar-image { width: 100%; height: 100%; object-fit: cover; }
                .avatar-initials { font-family: var(--font-numbers, sans-serif); font-size: 42px; font-weight: 900; color: var(--card-accent); }
                
                .level-badge { position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); background: #000; color: var(--card-accent); font-family: var(--font-numbers, sans-serif); padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; border: 1px solid var(--card-accent); white-space: nowrap; z-index: 5; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }

                .name-banner { background: var(--card-accent); padding: 8px 10px; text-align: center; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); margin-top: 16px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; }
                .player-name { font-family: var(--font-numbers, sans-serif); font-size: 16px; font-weight: 900; color: var(--card-text); letter-spacing: 0.5px; text-transform: uppercase; }

                .stats-section { padding: 16px 20px 24px; position: relative; z-index: 2; }
                .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
                .stat-row { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; }
                .stat-val { font-family: var(--font-numbers, sans-serif); font-size: 20px; font-weight: 700; color: var(--card-text); }
                .stat-lbl { font-size: 10px; font-weight: 700; color: var(--card-text); opacity: 0.6; letter-spacing: 1px; text-transform: uppercase; }
            `}</style>

            <div className="card-content">
                <div className="card-top">
                    <div className="card-left">
                        <div className="tier-badge">{tierLabel}</div>
                        <div className="flex flex-col mt-1">
                            <span className="score-value">{score}</span>
                            <span className="score-role">{
                                name.toLowerCase().includes('joao') ? 'JVG' :
                                    name.toLowerCase().includes('bruno') ? 'BRV' :
                                        name.toLowerCase().includes('vitor') ? 'VTZ' : role.substring(0, 3).toUpperCase()
                            }</span>
                        </div>
                    </div>
                    <div className="card-right">
                        <div className="card-period">
                            {period}<br />
                            <span className="card-edition">{edition}</span>
                        </div>
                        <div className="card-badge">{displayBadge}</div>
                    </div>
                </div>

                <div className="avatar-section">
                    <div className="avatar-container">
                        <div className="avatar-mask">
                            {avatar ? (
                                <img src={avatar} alt={name} className="avatar-image" />
                            ) : (
                                <span className="avatar-initials">{name.substring(0, 2).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="level-badge">LVL {level}</div>
                    </div>
                </div>

                <div className="name-banner">
                    <div className="player-name truncate">{name}</div>
                </div>

                <div className="stats-section">
                    <div className="stats-grid">
                        <div className="stat-row">
                            <span className="stat-val">{stats.contacts}</span>
                            <span className="stat-lbl">LEADS</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-val">{stats.quality}%</span>
                            <span className="stat-lbl">CONV%</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-val">{stats.responses}</span>
                            <span className="stat-lbl">RESP</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-val">{stats.meetings}</span>
                            <span className="stat-lbl">MEET</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
