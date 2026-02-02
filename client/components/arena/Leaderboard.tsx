"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Trophy, Medal, Crown, TrendingUp, ChevronRight } from "lucide-react";

/**
 * Leaderboard - Ranking do time com medalhas
 * DS v2.0: Top 3 destaque, medalhas 🥇🥈🥉, glow dourado para 1º
 */

interface LeaderboardPlayer {
    id: string;
    name: string;
    role: string;
    level: number;
    xp: number;
    xpToday?: number; // New: Session XP
    sales: number;
    avatar?: string;
}

interface LeaderboardProps {
    players: LeaderboardPlayer[];
    currentUserId?: string;
    className?: string;
}

const MEDAL_STYLES = {
    0: {
        icon: '🥇',
        bg: 'bg-accent/10',
        border: 'border-accent/40',
        glow: '',
        text: 'text-accent'
    },
    1: {
        icon: '🥈',
        bg: 'bg-bg-surface',
        border: 'border-white/10',
        glow: '',
        text: 'text-zinc-300'
    },
    2: {
        icon: '🥉',
        bg: 'bg-bg-surface',
        border: 'border-amber-600/20',
        glow: '',
        text: 'text-amber-600'
    }
};

function LeaderboardAvatar({ avatar, name }: { avatar?: string, name: string }) {
    const [error, setError] = useState(false);
    const hasValidUrl = avatar && (avatar.startsWith('http') || avatar.startsWith('/'));

    if (hasValidUrl && !error) {
        return (
            <Image
                src={avatar!}
                alt={name}
                fill
                className="object-cover"
                onError={() => setError(true)}
            />
        );
    }

    return <span>{name.slice(0, 2).toUpperCase()}</span>;
}

export function Leaderboard({ players, currentUserId, className = "" }: LeaderboardProps) {
    // Sort by xpToday if available (Session ranking), otherwise global XP
    const sortedPlayers = [...players].sort((a, b) => {
        const xpA = a.xpToday ?? a.xp;
        const xpB = b.xpToday ?? b.xp;
        return xpB - xpA;
    });

    return (
        <div className={`bg-bg-elevated border border-border-subtle rounded-xl overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-white">Ranking do Time</h3>
                </div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider">
                    {players.length} jogadores
                </span>
            </div>

            {/* Leaderboard List */}
            <div className="divide-y divide-border-subtle">
                {sortedPlayers.map((player, index) => {
                    const isTop3 = index < 3;
                    const isCurrentUser = player.id === currentUserId;
                    const medalStyle = isTop3 ? MEDAL_STYLES[index as 0 | 1 | 2] : null;

                    return (
                        <motion.div
                            key={player.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                                px-4 py-3 flex items-center gap-3 transition-all
                                ${isTop3 && medalStyle ? `${medalStyle.bg} ${medalStyle.glow}` : 'hover:bg-bg-hover'}
                                ${isCurrentUser ? 'ring-1 ring-accent/50 ring-inset' : ''}
                            `}
                        >
                            {/* Rank Number / Medal */}
                            <div className="w-8 flex items-center justify-center">
                                {isTop3 && medalStyle ? (
                                    <span className="text-2xl">{medalStyle.icon}</span>
                                ) : (
                                    <span className="font-display text-lg font-bold text-text-muted">
                                        {index + 1}
                                    </span>
                                )}
                            </div>

                            {/* Avatar */}
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden
                                ${isTop3 && medalStyle
                                    ? `border-2 ${medalStyle.border} bg-bg-surface`
                                    : 'border border-border-subtle bg-bg-surface'
                                }
                                ${isTop3 && index === 0 ? 'text-yellow-400' : 'text-white'}
                                relative
                            `}>
                                <LeaderboardAvatar avatar={player.avatar} name={player.name} />
                            </div>

                            {/* Name & Role */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isTop3 && medalStyle ? medalStyle.text : 'text-white'
                                    }`}>
                                    {player.name}
                                    {isCurrentUser && (
                                        <span className="ml-2 text-[10px] text-accent">(você)</span>
                                    )}
                                </p>
                                <p className="text-[10px] text-text-muted">
                                    {player.role} • Nível {player.level}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="text-right">
                                <p className="font-display text-sm font-bold text-neon-green-soft">
                                    {((player.xpToday !== undefined) ? player.xpToday : player.xp).toLocaleString('pt-BR')} XP
                                </p>
                                {player.xpToday !== undefined && (
                                    <p className="text-[9px] text-text-muted opacity-60">
                                        Total: {player.xp.toLocaleString('pt-BR')}
                                    </p>
                                )}
                                <p className="text-[10px] text-text-muted flex items-center justify-end gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {player.sales} vendas
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer */}
            {players.length > 5 && (
                <div className="px-4 py-2 border-t border-border-subtle bg-bg-surface/50 text-center">
                    <button className="text-xs text-accent hover:underline">
                        Ver ranking completo
                    </button>
                </div>
            )}
        </div>
    );
}
