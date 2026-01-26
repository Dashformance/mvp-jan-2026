"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { XPRing } from "./XPRing";
import { Trophy, Zap, Target, Handshake } from "lucide-react";
import { LevelInfo, UserStats, Badge } from "@/lib/gamification/types";
import { getLevelTitle } from "@/lib/gamification/config";
import { motion } from "framer-motion";

interface PlayerCardProps {
    name: string;
    role: string;
    levelInfo: LevelInfo;
    stats: UserStats;
    badges: Badge[];
    isCurrentUser?: boolean;
}

export function PlayerCard({
    name,
    role,
    levelInfo,
    stats,
    badges,
    isCurrentUser = false
}: PlayerCardProps) {
    const title = getLevelTitle(levelInfo.level);

    // Overall rating formula: (Level * 2) + (Conversion Rate * 0.5) + (Total Conversion / 10)
    const conversionRate = stats.totalLeadsCreated > 0
        ? (stats.totalLeadsConverted / stats.totalLeadsCreated) * 100
        : 0;

    const overallRating = Math.min(99, Math.round(
        (levelInfo.level * 1.5) + (conversionRate * 0.4) + (stats.totalLeadsConverted * 2)
    ));

    return (
        <GlassCard className="group relative w-full max-w-[280px] aspect-[3/4.5] flex flex-col p-0 overflow-hidden border-white/10 bg-zinc-900/80 shadow-2xl">
            {/* Top Rating Hexagon */}
            <div className="absolute top-4 left-4 z-20">
                <div className="relative h-14 w-14 flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full animate-pulse" />
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full fill-black/40 stroke-emerald-500/50 stroke-2">
                        <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" />
                    </svg>
                    <span className="relative text-2xl font-numbers font-bold text-emerald-400 text-glow">
                        {overallRating}
                    </span>
                </div>
            </div>

            {/* Header / Tier */}
            <div className="pt-6 px-4 text-right">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Overall Rating
                </span>
            </div>

            {/* Avatar & XP Ring Area */}
            <div className="relative flex-1 flex flex-col items-center justify-center pt-8">
                <div className="relative group/avatar">
                    <XPRing
                        progress={levelInfo.progress}
                        size={140}
                        strokeWidth={4}
                        className="relative z-10"
                    />
                    <div className="absolute inset-[8px] rounded-full bg-zinc-800 overflow-hidden border-2 border-white/5 z-0 flex items-center justify-center">
                        {/* Placeholder for now */}
                        <div className="text-zinc-600">
                            <Zap size={48} className="opacity-20" />
                        </div>
                    </div>

                    {/* Level Badge Overlay */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black border border-emerald-500/30 px-3 py-0.5 rounded-full z-20 shadow-lg">
                        <span className="text-xs font-numbers font-bold text-emerald-400">LVL {levelInfo.level}</span>
                    </div>
                </div>

                {/* Name & Role */}
                <div className="mt-8 text-center px-4">
                    <h3 className="text-xl font-bold text-white tracking-tight uppercase truncate max-w-full">
                        {name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest mt-0.5">
                        {role} • {title}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-px bg-white/5 mt-auto border-t border-white/5">
                <div className="flex flex-col items-center py-3 bg-zinc-900/40">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Leads</span>
                    <span className="text-sm font-numbers font-bold text-white">{stats.totalLeadsCreated}</span>
                </div>
                <div className="flex flex-col items-center py-3 bg-zinc-900/40 border-x border-white/5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Vendas</span>
                    <span className="text-sm font-numbers font-bold text-white">{stats.totalLeadsConverted}</span>
                </div>
                <div className="flex flex-col items-center py-3 bg-zinc-900/40">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Rate</span>
                    <span className="text-sm font-numbers font-bold text-white">{Math.round(conversionRate)}%</span>
                </div>
            </div>

            {/* Badges Bar */}
            <div className="px-4 py-3 bg-black/40 flex items-center justify-center gap-3">
                {badges.length > 0 ? (
                    badges.slice(0, 4).map((badge, i) => (
                        <div
                            key={badge.id}
                            title={badge.name}
                            className="h-6 w-6 rounded-md bg-white/5 flex items-center justify-center border border-white/5"
                        >
                            {/* Simplified icon representation */}
                            <Trophy className={`w-3 h-3 ${badge.tier === 'gold' ? 'text-yellow-500' :
                                badge.tier === 'platinum' ? 'text-cyan-400' :
                                    badge.tier === 'silver' ? 'text-zinc-300' : 'text-amber-700'
                                }`} />
                        </div>
                    ))
                ) : (
                    <span className="text-[8px] text-zinc-600 uppercase">Sem conquistas</span>
                )}
            </div>

            {/* Bottom Tier Bar */}
            <div className="h-1 w-full bg-zinc-800">
                <motion.div
                    className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelInfo.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                />
            </div>

            {isCurrentUser && (
                <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-2xl pointer-events-none" />
            )}
        </GlassCard>
    );
}
