"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

/**
 * StreakCounter - Contador de dias consecutivos
 * DS v2.0: Ícone 🔥 animado com glow
 */

interface StreakCounterProps {
    currentStreak: number;
    longestStreak: number;
    className?: string;
}

export function StreakCounter({ currentStreak, longestStreak, className = "" }: StreakCounterProps) {
    const isOnFire = currentStreak >= 3;
    const isLegendary = currentStreak >= 7;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-bg-elevated border border-border-subtle rounded-xl p-4 ${className}`}
        >
            <div className="flex items-center gap-4">
                {/* Fire Icon with Glow */}
                <motion.div
                    animate={isOnFire ? {
                        scale: [1, 1.1, 1],
                        filter: [
                            "drop-shadow(0 0 8px rgba(255,159,67,0.5))",
                            "drop-shadow(0 0 16px rgba(255,159,67,0.8))",
                            "drop-shadow(0 0 8px rgba(255,159,67,0.5))"
                        ]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLegendary
                            ? 'bg-neon-orange/20 border border-neon-orange/30'
                            : isOnFire
                                ? 'bg-neon-yellow-bg border border-neon-yellow/30'
                                : 'bg-bg-surface border border-border-subtle'
                        }`}
                >
                    <Flame
                        className={`w-6 h-6 ${isLegendary
                                ? 'text-neon-orange'
                                : isOnFire
                                    ? 'text-neon-yellow-soft'
                                    : 'text-text-muted'
                            }`}
                    />
                </motion.div>

                {/* Counter */}
                <div className="flex-1">
                    <div className="flex items-baseline gap-1">
                        <motion.span
                            key={currentStreak}
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`font-display text-3xl font-black ${isLegendary
                                    ? 'text-neon-orange'
                                    : isOnFire
                                        ? 'text-neon-yellow-soft'
                                        : 'text-white'
                                }`}
                        >
                            {currentStreak}
                        </motion.span>
                        <span className="text-sm text-text-muted">dias</span>
                    </div>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
                        Sequência Atual
                    </p>
                </div>

                {/* Best Streak */}
                <div className="text-right">
                    <span className="text-xs text-text-muted">Recorde</span>
                    <p className="font-display text-lg font-bold text-text-secondary">{longestStreak}</p>
                </div>
            </div>

            {/* Streak Bonus Message */}
            {isOnFire && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-border-subtle"
                >
                    <p className={`text-xs font-medium ${isLegendary ? 'text-neon-orange' : 'text-neon-yellow-soft'}`}>
                        🔥 {isLegendary ? 'Lendário! +50% XP bônus!' : 'Em chamas! +25% XP bônus!'}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
