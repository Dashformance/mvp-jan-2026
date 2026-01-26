"use client";

import { motion } from "framer-motion";
import { Zap, ChevronUp } from "lucide-react";
import { LevelInfo } from "@/lib/gamification/types";
import { getLevelTitle } from "@/lib/gamification/config";
import { Progress } from "@/components/ui/progress";

/**
 * LevelProgress - Card de progresso de nível
 * DS v2.0: Glass card com barra XP neon
 */

interface LevelProgressProps {
    levelInfo: LevelInfo;
    className?: string;
}

export function LevelProgress({ levelInfo, className = "" }: LevelProgressProps) {
    const title = getLevelTitle(levelInfo.level);
    const xpRemaining = levelInfo.xpToNextLevel;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-bg-elevated border border-border-subtle rounded-xl p-4 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-neon-green-bg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-neon-green-soft" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">{title}</h3>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Nível {levelInfo.level}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="font-display text-2xl font-bold text-neon-green-soft">
                        {levelInfo.currentXP.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs text-text-muted ml-1">XP</span>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-2">
                <Progress value={levelInfo.progress} variant="xp" className="h-3" />

                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-text-muted">
                        {levelInfo.progress.toFixed(0)}% completo
                    </span>
                    <span className="text-xs text-accent flex items-center gap-1">
                        <ChevronUp className="w-3 h-3" />
                        Faltam <span className="font-display font-bold">{xpRemaining.toLocaleString('pt-BR')}</span> XP
                    </span>
                </div>
            </div>

            {/* Next Level Preview */}
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                <span className="text-[10px] text-text-muted uppercase tracking-wider">Próximo nível:</span>
                <span className="text-xs font-medium text-white">
                    Nível {levelInfo.level + 1} • {getLevelTitle(levelInfo.level + 1)}
                </span>
            </div>
        </motion.div>
    );
}
