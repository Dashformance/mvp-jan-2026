"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";

interface PlayerStats {
    contacts: number;
    responses: number;
    meetings: number;
    sales: number;
}

interface PlayerCardProps {
    id: string;
    name: string;
    role: string;
    avatar: string;
    level: number;
    xp: number;
    nextLevelXp: number;
    score: number;
    stats: PlayerStats;
    badges: string[];
    rank?: number; // 1, 2, 3...
    isSelected?: boolean;
    onClick?: () => void;
    index?: number; // for animation delay
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
    index = 0
}) => {
    // Determine visuals based on Score
    const getScoreColor = (val: number) => {
        if (val >= 90) return { text: "text-neon-green", bg: "bg-neon-green/40", border: "border-neon-green/30" };
        if (val >= 70) return { text: "text-accent", bg: "bg-accent/40", border: "border-accent/30" };
        return { text: "text-neon-yellow", bg: "bg-neon-yellow/40", border: "border-neon-yellow/30" };
    };

    const visuals = getScoreColor(score);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={onClick}
            className={cn(
                "relative bg-gradient-to-b from-bg-elevated to-bg-surface border rounded-2xl p-0 overflow-hidden cursor-pointer transition-all duration-300 group hover:shadow-2xl hover:-translate-y-1",
                isSelected
                    ? "border-accent ring-2 ring-accent/30 shadow-[0_0_30px_rgba(222,204,168,0.15)]"
                    : "border-border-subtle hover:border-accent/50"
            )}
        >
            {/* --- TOP HEADER (Score & Rank) --- */}

            {/* Rating Badge */}
            <div className="absolute top-3 left-3 z-10">
                <div className="relative w-12 h-12 flex items-center justify-center">
                    {/* Visual Glow behind score */}
                    <div className={cn("absolute inset-0 rounded-lg blur-md transition-colors duration-500", visuals.bg)} />

                    <div className="relative bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg w-full h-full flex items-center justify-center shadow-inner">
                        <span className={cn("font-display text-xl font-black drop-shadow-md", visuals.text)}>
                            {score}
                        </span>
                    </div>
                </div>
            </div>

            {/* Rank Badge for Top 3 */}
            {rank && rank <= 3 && (
                <div className="absolute top-3 right-3 z-10 text-2xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-bounce-slow">
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                </div>
            )}

            {/* --- MAIN BODY (Avatar & Info) --- */}
            <div className="pt-16 pb-4 px-4 flex flex-col items-center relative">

                {/* FIFA Style Background Pattern Effect (Optional subtle overlay) */}
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none" />

                <div className="relative mb-3 group-hover:scale-105 transition-transform duration-300 ease-out">
                    {/* XP Progress Ring */}
                    <div className="w-24 h-24 relative">
                        {/* Shadow/Glow behind ring */}
                        <div className="absolute inset-0 rounded-full bg-black/50 blur-xl" />

                        <CircularProgressbar
                            value={(xp / nextLevelXp) * 100}
                            strokeWidth={6}
                            styles={buildStyles({
                                pathColor: '#22C55E', // Green for progress
                                trailColor: 'rgba(255,255,255,0.1)',
                                pathTransitionDuration: 1.5
                            })}
                        />
                        {/* Avatar Container */}
                        <div className="absolute inset-2 rounded-full bg-bg-surface border-2 border-white/5 flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-inner">
                            {avatar.length > 2 ? (
                                <img src={avatar} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{avatar}</span>
                            )}
                        </div>
                    </div>

                    {/* Hexagon Level Badge */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                        <div className="relative w-8 h-9 flex items-center justify-center">
                            {/* Animated Glow Layer */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.8, 0.5],
                                    rotate: [0, 180, 360]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute inset-0 bg-neon-green/30 blur-md"
                                style={{ clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)" }}
                            />

                            {/* Static Hexagon Border */}
                            <div
                                className="absolute inset-0 bg-bg-surface border border-neon-green/50"
                                style={{ clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)" }}
                            />

                            {/* Level Number */}
                            <span className="relative z-10 font-display text-sm font-black text-neon-green drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]">
                                {level}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Name & Role */}
                <div className="text-center w-full mt-1">
                    <h3 className="text-sm font-bold text-white truncate w-full group-hover:text-accent transition-colors">
                        {name}
                    </h3>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
                        {role}
                    </p>
                </div>

                {/* XP Bar (Linear) */}
                <div className="w-full mt-4 group/xp">
                    <div className="flex justify-between text-[9px] text-text-muted mb-1 font-medium">
                        <span className="group-hover/xp:text-white transition-colors">{xp.toLocaleString()} XP</span>
                        <span>{nextLevelXp.toLocaleString()}</span>
                    </div>
                    <Progress value={(xp / nextLevelXp) * 100} variant="xp" className="h-1.5 bg-white/5" />
                </div>
            </div>

            {/* --- FOOTER (Mini Stats Funnel) --- */}
            <div className="grid grid-cols-4 gap-px bg-white/5 border-t border-white/5">
                <StatItem label="Leads" value={stats.contacts} />
                <StatItem label="Resp" value={stats.responses} />
                <StatItem label="Meet" value={stats.meetings} />
                <StatItem label="Vendas" value={stats.sales} highlight />
            </div>

            {/* --- BADGES ROW --- */}
            {badges.length > 0 && (
                <div className="px-3 py-2 flex gap-1.5 items-center justify-center bg-black/20 backdrop-blur-sm">
                    {badges.slice(0, 3).map((badge, i) => (
                        <span
                            key={i}
                            className="text-[8px] px-2 py-0.5 rounded-full bg-accent/5 border border-accent/20 text-accent uppercase font-bold tracking-wider"
                        >
                            {badge}
                        </span>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

// Helper Subcomponent
const StatItem = ({ label, value, highlight = false }: { label: string, value: number, highlight?: boolean }) => (
    <div className="bg-bg-surface/50 py-2 text-center group-hover:bg-bg-elevated transition-colors duration-300">
        <div className="text-[9px] text-text-muted uppercase tracking-tight mb-0.5">{label}</div>
        <div className={cn("font-display text-sm font-bold", highlight ? "text-neon-green shadow-green-glow" : "text-white")}>
            {value}
        </div>
    </div>
);
