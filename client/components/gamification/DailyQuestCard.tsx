"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Zap, Target } from "lucide-react";
import { useState } from "react";

/**
 * DailyQuestCard - Missões diárias interativas
 * DS v2.0: Cards com glow verde quando completos
 */

interface Quest {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    completed: boolean;
    progress?: number;
    target?: number;
}

interface DailyQuestCardProps {
    quests: Quest[];
    onToggle?: (questId: string) => void;
    className?: string;
}

export function DailyQuestCard({ quests, onToggle, className = "" }: DailyQuestCardProps) {
    const completedCount = quests.filter(q => q.completed).length;
    const totalXP = quests.reduce((sum, q) => sum + (q.completed ? q.xpReward : 0), 0);
    const potentialXP = quests.reduce((sum, q) => sum + q.xpReward, 0);

    return (
        <div className={`bg-bg-elevated border border-border-subtle rounded-xl overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-white">Missões Diárias</h3>
                </div>
                <span className="text-xs text-text-muted">
                    {completedCount}/{quests.length}
                </span>
            </div>

            {/* Quests List */}
            <div className="divide-y divide-border-subtle">
                {quests.map((quest, index) => (
                    <motion.div
                        key={quest.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => onToggle?.(quest.id)}
                        className={`px-4 py-3 flex items-start gap-3 transition-all cursor-pointer ${quest.completed
                                ? 'bg-neon-green-bg/30 hover:bg-neon-green-bg/40'
                                : 'hover:bg-bg-hover'
                            }`}
                    >
                        {/* Checkbox */}
                        <motion.div
                            animate={quest.completed ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                            className="mt-0.5"
                        >
                            {quest.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-neon-green-soft" />
                            ) : (
                                <Circle className="w-5 h-5 text-text-muted" />
                            )}
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${quest.completed ? 'text-neon-green-soft line-through' : 'text-white'
                                }`}>
                                {quest.title}
                            </p>
                            <p className="text-[11px] text-text-muted mt-0.5">
                                {quest.description}
                            </p>

                            {/* Progress bar if applicable */}
                            {quest.target && quest.progress !== undefined && !quest.completed && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-bg-surface rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent transition-all"
                                            style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-text-muted">
                                        {quest.progress}/{quest.target}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* XP Reward */}
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${quest.completed
                                ? 'bg-neon-green-bg text-neon-green-soft'
                                : 'bg-bg-surface text-text-muted'
                            }`}>
                            <Zap className="w-3 h-3" />
                            {quest.xpReward}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer - Total XP */}
            <div className="px-4 py-3 border-t border-border-subtle flex items-center justify-between bg-bg-surface/50">
                <span className="text-xs text-text-muted">XP Ganho Hoje</span>
                <span className="font-display text-lg font-bold text-neon-green-soft">
                    {totalXP}/{potentialXP} XP
                </span>
            </div>
        </div>
    );
}
