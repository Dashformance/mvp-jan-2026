"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, Zap, Target, Phone, Calendar, Trophy, DollarSign, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Leaderboard } from "@/components/arena/Leaderboard";
import { PlayerCard } from "@/components/super-dash/PlayerCard";
import { LiveClock } from "@/components/super-dash/LiveClock";
import { XPFeed } from "@/components/gamification";
import { TrendChart } from "@/components/super-dash/TrendChart";

// Mock Data (Should fetch from API ideally)
const MOCK_DATA = {
    overview: {
        totalSales: 154,
        activeLeads: 2430,
        conversionRate: 6.3,
        growth: 12.5,
    },
    funnel: [
        { stage: "Leads", value: 243, color: "#94A3B8" },
        { stage: "Qualificados", value: 120, color: "#38BDF8" },
        { stage: "Reuniões", value: 85, color: "#8B5CF6" },
        { stage: "Propostas", value: 45, color: "#F59E0B" },
        { stage: "Vendas", value: 18, color: "#22C55E" },
    ]
};

export default function TVPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Clock
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/super-dash/stats');
                const json = await res.json();
                if (!json.error) setData(json);
            } catch (error) {
                console.error("Failed to fetch superdash data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s Poll
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-display text-4xl animate-pulse">CARREGANDO SUPERDASH TV...</div>;

    const collaborators = data?.collaborators || [];
    const overview = data?.overview || MOCK_DATA.overview;

    // Sort for Leaderboard
    const sortedPlayers = [...collaborators].sort((a, b) => b.score - a.score);

    return (
        <div className="min-h-screen bg-black text-white p-6 overflow-hidden flex flex-col font-sans selection:bg-accent/30">

            {/* TV HEADER */}
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-12 bg-accent rounded-full shadow-[0_0_20px_rgba(222,204,168,0.5)]" />
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        SUPERDASH <span className="text-accent font-display">TV</span>
                    </h1>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <div className="text-5xl font-black font-display tracking-wider">
                            {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-lg text-text-muted uppercase font-bold tracking-widest text-right">
                            {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN GRID - 4 QUADRANTS */}
            <div className="grid grid-cols-12 gap-8 flex-1">

                {/* Q1: LEADERBOARD (Top Left) - 4 Cols */}
                <div className="col-span-4 bg-bg-elevated/50 border border-white/10 rounded-3xl p-6 flex flex-col">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-neon-yellow">
                        <Trophy className="w-8 h-8" />
                        Arena Ranking
                    </h2>
                    <div className="flex-1 overflow-hidden space-y-4">
                        {sortedPlayers.slice(0, 5).map((player: any, idx: number) => (
                            <div key={player.id} className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border transition-all",
                                idx === 0 ? "bg-gradient-to-r from-neon-yellow/20 to-transparent border-neon-yellow/30" : "bg-bg-surface border-white/5"
                            )}>
                                <div className={cn(
                                    "font-black text-3xl w-12 text-center",
                                    idx === 0 ? "text-neon-yellow drop-shadow-glow" :
                                        idx === 1 ? "text-slate-300" :
                                            idx === 2 ? "text-amber-700" : "text-white/30"
                                )}>
                                    #{idx + 1}
                                </div>
                                <div className="text-2xl">{player.avatar}</div>
                                <div className="flex-1">
                                    <div className="font-bold text-xl text-white truncate">{player.name}</div>
                                    <div className="text-sm text-text-muted uppercase tracking-wider">{player.role}</div>
                                </div>
                                <div className="text-right">
                                    <div className={cn("text-3xl font-black font-display", idx === 0 ? "text-neon-yellow" : "text-white")}>
                                        {player.score}
                                    </div>
                                    <div className="text-xs text-text-muted">PTS</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Q2: METRICS & HIGHLIGHTS (Top Right) - 8 Cols */}
                <div className="col-span-8 grid grid-rows-2 gap-8">

                    {/* Top Row: Big KPIs */}
                    <div className="grid grid-cols-3 gap-6">
                        <Card className="bg-bg-elevated/50 border-white/10 p-6 flex flex-col justify-center items-center">
                            <div className="text-text-muted uppercase tracking-widest font-bold text-sm mb-2">Vendas Hoje</div>
                            <div className="text-7xl font-black font-display text-white">{overview.totalSales}</div>
                        </Card>
                        <Card className="bg-bg-elevated/50 border-white/10 p-6 flex flex-col justify-center items-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-neon-green/5 animate-pulse" />
                            <div className="text-neon-green uppercase tracking-widest font-bold text-sm mb-2">Receita (Est.)</div>
                            <div className="text-6xl font-black font-display text-neon-green drop-shadow-glow">
                                {(overview.totalSales * 2500 / 1000).toFixed(1)}k
                            </div>
                        </Card>
                        <Card className="bg-bg-elevated/50 border-white/10 p-6 flex flex-col justify-center items-center">
                            <div className="text-text-muted uppercase tracking-widest font-bold text-sm mb-2">Meta Mensal</div>
                            <div className="text-6xl font-black font-display text-accent">85%</div>
                            <div className="w-full h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
                                <div className="h-full bg-accent w-[85%]" />
                            </div>
                        </Card>
                    </div>

                    {/* Bottom Row: Team Performance / Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        {collaborators.slice(0, 4).map((collab: any, idx: number) => {
                            // Inferred initials and tier for the card
                            const initials = collab.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                            const tier = collab.score >= 90 ? 'gold' : collab.score >= 80 ? 'diamond' : collab.score >= 70 ? 'platinum' : 'emerald';

                            return (
                                <PlayerCard
                                    key={collab.id}
                                    name={collab.name}
                                    role={collab.role}
                                    avatar={collab.avatar}
                                    level={collab.level}
                                    score={collab.score}
                                    stats={collab.stats}
                                    tier={tier as any}
                                    initials={initials}
                                    badge={collab.score >= 90 ? '⭐' : '⚡'}
                                    ranking={idx + 1}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
