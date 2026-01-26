"use client";

import { motion } from "framer-motion";
import { Lock, Trophy, Star, Zap, Target, Flame, Crown, Shield } from "lucide-react";
import { Badge as BadgeType } from "@/lib/gamification/types";

/**
 * BadgeDisplay - Grid de badges conquistados
 * DS v2.0: Raridade com cores diferentes, locked com grayscale
 */

interface BadgeDisplayProps {
    badges: BadgeType[];
    unlockedIds: string[];
    className?: string;
}

const TIER_STYLES = {
    bronze: {
        bg: 'bg-rank-bronze-bg',
        border: 'border-rank-bronze/30',
        text: 'text-rank-bronze',
        glow: ''
    },
    silver: {
        bg: 'bg-rank-silver-bg',
        border: 'border-rank-silver/30',
        text: 'text-rank-silver',
        glow: ''
    },
    gold: {
        bg: 'bg-rank-gold-bg',
        border: 'border-rank-gold/30',
        text: 'text-rank-gold',
        glow: 'shadow-[0_0_12px_rgba(255,215,0,0.3)]'
    },
    platinum: {
        bg: 'bg-rank-platinum-bg',
        border: 'border-rank-platinum/30',
        text: 'text-rank-platinum',
        glow: 'shadow-[0_0_12px_rgba(229,228,226,0.3)]'
    },
    diamond: {
        bg: 'bg-rank-diamond-bg',
        border: 'border-rank-diamond/30',
        text: 'text-rank-diamond',
        glow: 'shadow-[0_0_16px_rgba(185,242,255,0.4)]'
    }
};

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    trophy: Trophy,
    star: Star,
    zap: Zap,
    target: Target,
    flame: Flame,
    crown: Crown,
    shield: Shield
};

export function BadgeDisplay({ badges, unlockedIds, className = "" }: BadgeDisplayProps) {
    const unlockedCount = badges.filter(b => unlockedIds.includes(b.id)).length;

    return (
        <div className={`bg-bg-elevated border border-border-subtle rounded-xl overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-white">Conquistas</h3>
                </div>
                <span className="text-xs text-text-muted">
                    {unlockedCount}/{badges.length}
                </span>
            </div>

            {/* Badge Grid */}
            <div className="p-4 grid grid-cols-4 gap-3">
                {badges.map((badge, index) => {
                    const isUnlocked = unlockedIds.includes(badge.id);
                    const tierStyle = TIER_STYLES[badge.tier];
                    const IconComponent = BADGE_ICONS[badge.icon.toLowerCase()] || Trophy;

                    return (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative"
                            title={isUnlocked ? `${badge.name}: ${badge.description}` : 'Bloqueado'}
                        >
                            <div className={`
                                aspect-square rounded-lg border flex items-center justify-center
                                transition-all duration-200
                                ${isUnlocked
                                    ? `${tierStyle.bg} ${tierStyle.border} ${tierStyle.glow} hover:scale-110`
                                    : 'bg-bg-surface border-border-subtle grayscale opacity-40'
                                }
                            `}>
                                {isUnlocked ? (
                                    <IconComponent className={`w-6 h-6 ${tierStyle.text}`} />
                                ) : (
                                    <Lock className="w-4 h-4 text-text-disabled" />
                                )}
                            </div>

                            {/* Tooltip on hover */}
                            {isUnlocked && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    <div className="bg-bg-void border border-border-subtle rounded-md px-2 py-1 whitespace-nowrap">
                                        <span className={`text-[10px] font-bold ${tierStyle.text}`}>
                                            {badge.name}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border-subtle bg-bg-surface/50">
                <p className="text-[10px] text-text-muted text-center">
                    Complete desafios para desbloquear conquistas
                </p>
            </div>
        </div>
    );
}
