"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { LevelInfo } from "@/lib/gamification/types";

/**
 * LevelProgress (now ScoreProgress)
 * DS v2.0: Glass card with Score
 */

interface LevelProgressProps {
    levelInfo: LevelInfo;
    className?: string;
}

export function LevelProgress({ levelInfo, className = "" }: LevelProgressProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-bg-elevated border border-border-subtle rounded-xl p-4 ${className}`}
        >
            {/* Header / Score */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-neon-green-bg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-neon-green-soft" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Performance Score</h3>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Pontuação Total</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="font-display text-2xl font-bold text-neon-green-soft">
                        {levelInfo.currentXP.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs text-text-muted ml-1">XP</span>
                </div>
            </div>
        </motion.div>
    );
}
