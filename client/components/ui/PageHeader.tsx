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

            {/* Center: Level Badge */}
            <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                    <div className="relative h-12 w-12 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-bold text-xl shadow-lg border border-emerald-300/20 font-numbers">
                        {levelInfo.level}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-black rounded-full border border-zinc-800 p-0.5 shadow-md z-10">
                        <SuperBadge tier="gold" label="" size="sm" className="h-5 w-5 justify-center border-none p-0" icon={<Trophy className="w-3 h-3 text-yellow-500" />} />
                    </div>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-emerald-400 font-medium text-sm tracking-wide">{levelTitle}</span>
                    <span className="text-xs text-zinc-500">{levelInfo.currentXP} XP</span>
                </div>
            </div>

            {/* Right: XP Progress */}
            <div className="w-48 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Próximo Nível</span>
                    <span className="text-emerald-400 font-numbers font-bold">{levelInfo.progress}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out"
                        style={{ width: `${levelInfo.progress}%` }}
                    />
                </div>
            </div>

        </GlassCard>
    );
}
