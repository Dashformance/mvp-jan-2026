"use client";

import React from "react";
import { PlayerCard } from "./PlayerCard";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";

export function ArenaGrid() {
    const {
        levelInfo,
        stats,
        unlockedBadges
    } = useGamification();

    const { profile } = useAuth();

    // Mock teammates for the Arena/Leaderboard
    const teammates = [
        {
            id: "itz-01",
            name: "Nitz",
            role: "Hunter",
            levelInfo: { level: 12, progress: 45, currentXP: 18000, xpForCurrentLevel: 15120, xpForNextLevel: 21600, xpToNextLevel: 3600 },
            stats: { totalLeadsCreated: 142, totalLeadsConverted: 28, totalLeadsQualified: 45, totalTasksCompleted: 88, currentStreak: 5, longestStreak: 12, totalLoginDays: 45, conversionsToday: 1, leadsContactedToday: 12 },
            badges: [],
        },
        {
            id: "bruno-02",
            name: "Bruno",
            role: "Prospector",
            levelInfo: { level: 8, progress: 80, currentXP: 9600, xpForCurrentLevel: 7200, xpForNextLevel: 10800, xpToNextLevel: 1200 },
            stats: { totalLeadsCreated: 85, totalLeadsConverted: 12, totalLeadsQualified: 20, totalTasksCompleted: 40, currentStreak: 3, longestStreak: 8, totalLoginDays: 20, conversionsToday: 0, leadsContactedToday: 5 },
            badges: [],
        }
    ];

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white tracking-tight uppercase">The Arena</h2>
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Performances em Tempo Real</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Pace: <span className="text-emerald-400">Excelente</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Current User Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <PlayerCard
                        name={profile?.name || "Você"}
                        role={profile?.role === 'admin' ? "MVP" : "Vendedor"}
                        levelInfo={levelInfo}
                        stats={stats}
                        badges={unlockedBadges}
                        isCurrentUser={true}
                    />
                </motion.div>

                {/* Team Cards */}
                {teammates.map((buddy, index) => (
                    <motion.div
                        key={buddy.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                    >
                        <PlayerCard
                            name={buddy.name}
                            role={buddy.role}
                            levelInfo={buddy.levelInfo as any}
                            stats={buddy.stats as any}
                            badges={buddy.badges as any}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
