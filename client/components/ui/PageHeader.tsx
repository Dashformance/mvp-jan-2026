"use client";

import { useGamification } from "@/hooks/useGamification";
import { GlassCard } from "./GlassCard";
import { SuperBadge } from "./SuperBadge";
import { Trophy } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/context/auth-context";
import { useGameStore } from "@/hooks/useGameStore";

export function PageHeader() {
    const { levelInfo, levelTitle } = useGamification();
    const { profile } = useAuth();
    const syncWithProfile = useGameStore(s => s.syncWithProfile);
    const [mounted, setMounted] = useState(false);
    const syncedRef = useRef(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync localStorage game store with database profile
    useEffect(() => {
        if (profile && !syncedRef.current) {
            const dbXP = (profile as any).xp ?? 0;
            const dbLevel = (profile as any).level ?? 1;

            // Only sync if database has data and it's different or we're initializing
            syncWithProfile(dbXP, dbLevel);
            syncedRef.current = true;
            console.log(`[Gamification] Synced local state with DB Profile: ${dbXP} XP, Level ${dbLevel}`);
        }
    }, [profile, syncWithProfile]);

    if (!mounted) return null;

    return (
        <GlassCard className="mb-6 px-6 py-4 flex items-center justify-between gap-6 bg-zinc-900/60 backdrop-blur-xl border-white/5 shadow-2xl">

            {/* Left: User Menu */}
            <div className="shrink-0">
                <UserMenu />
            </div>

            {/* Center: Score Display */}
            <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                    <div className="relative h-12 w-12 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black shadow-lg border border-emerald-300/20">
                        <Trophy className="w-6 h-6" />
                    </div>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-emerald-400 font-medium text-sm tracking-wide">Performance Score</span>
                    <span className="text-xl text-white font-numbers font-bold">{levelInfo.currentXP.toLocaleString('pt-BR')} XP</span>
                </div>
            </div>

        </GlassCard>
    );
}
