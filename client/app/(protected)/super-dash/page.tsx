"use client"

import { useAuth } from "@/context/auth-context";
import { ArrowLeft, Trophy, Target, Users, TrendingUp, Zap, Star, Shield, Filter, Maximize2, Minimize2, DollarSign, Phone, Calendar, Award, Flame, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

// Gamification Components
import { LevelProgress, StreakCounter, XPFeed, DailyQuestCard } from "@/components/gamification";
import { Leaderboard } from "@/components/arena/Leaderboard";
import { LiveClock } from "@/components/super-dash/LiveClock";
import { KPICard } from "@/components/super-dash/KPICard";
import { TrendChart } from "@/components/super-dash/TrendChart";
import { DualGauge } from "@/components/super-dash/DualGauge";
import { InsightAlert } from "@/components/super-dash/InsightAlert";
import { Sparkline } from "@/components/super-dash/Sparkline";
import { PlayerCard } from "@/components/super-dash/PlayerCard";
import { generatePlayerCard, getTier } from "@/lib/utils/score-calculator";

// Missing imports
import { CastButton } from "@/components/CastButton";
import { DateFilterToggle, type DatePeriod } from "@/components/super-dash/DateFilterToggle";
import { LevelUpModal } from "@/components/super-dash/LevelUpModal";
import { TeamCalendar } from "@/components/super-dash/TeamCalendar";
import { ActionTrendChart } from "@/components/super-dash/ActionTrendChart";

const MOCK_QUESTS = [
    { id: '1', title: 'Fazer 50 ligações', description: 'Realize 50 chamadas', progress: 30, total: 50, xpReward: 500, completed: false },
    { id: '2', title: 'Fechar 1 venda', description: 'Feche pelo menos uma venda', progress: 0, total: 1, xpReward: 1000, completed: false },
    { id: '3', title: 'Agendar 3 reuniões', description: 'Agende reuniões qualificadas', progress: 1, total: 3, xpReward: 750, completed: false }
];

export default function SuperDashPage() {
    const { profile, loading: authLoading } = useAuth();
    const [data, setData] = useState<any>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Sprint 11: Date Filters
    const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('today');
    const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>();

    // Level Up State (Sprint 7)
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [levelUpData, setLevelUpData] = useState({ level: 5, name: 'João Vitor', avatar: '👨‍💼' });

    // Simulate Level Up (Dev Tool)
    const triggerLevelUp = () => {
        setLevelUpData({
            level: (selectedUser?.level || 4) + 1,
            name: selectedUser?.name || 'Usuário',
            avatar: selectedUser?.avatar || '👤'
        });
        setShowLevelUp(true);
    };

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            // Sprint 11: Add Query Params
            const params = new URLSearchParams();
            params.set('period', selectedPeriod);
            if (selectedPeriod === 'custom' && customRange?.from && customRange?.to) {
                params.set('startDate', customRange.from.toISOString());
                params.set('endDate', customRange.to.toISOString());
            }

            const res = await fetch(`/api/super-dash/stats?${params.toString()}`);
            if (!res.ok) {
                console.error('[SuperDash] Fetch Error:', res.status, res.statusText);
                if (res.status === 401) {
                    console.log('Session expired, redirecting to login...');
                    window.location.href = '/login';
                    return;
                }
                throw new Error(`Failed to fetch stats: ${res.status}`);
            }
            const json = await res.json();

            if (json.collaborators && json.collaborators.length > 0) {
                // Use functional update to avoid dependency on selectedUser
                setSelectedUser((prevUser: any) => {
                    if (prevUser) {
                        const updatedUser = json.collaborators.find((c: any) => c.id === prevUser.id);
                        return updatedUser || json.collaborators[0];
                    }
                    return json.collaborators[0];
                });
            }
            setData(json); // Also update 'data' state which was used elsewhere
        } catch (error) {
            console.error("Failed to fetch superdash data", error);
        } finally {
            setLoading(false);
        }
    }, [selectedPeriod, customRange]);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_CAST_MODE) {
            fetchStats();
        }

        // Polling interaction for real-time feel (every 30s)
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [fetchStats]);



    if (authLoading || loading) return (
        <div className="min-h-screen bg-bg-deep flex items-center justify-center text-white">
            <Zap className="w-8 h-8 animate-bounce text-neon-green" />
        </div>
    );

    if (profile?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center text-white p-4">
                <h1 className="text-2xl font-bold text-neon-red-soft mb-2">Acesso Restrito</h1>
                <Link href="/"><Button variant="outline">Voltar</Button></Link>
            </div>
        );
    }

    const overview = data?.overview || {
        totalLeads: 0,
        totalSales: 0,
        conversionRate: 0,
        activeLeads: 0,
        growth: 0,
        revenue: 0,
        pipelineValue: 0
    };

    const collaborators = Array.isArray(data?.collaborators) ? data.collaborators : [];

    // Default zeroed time data if missing
    const timeData = data?.timeData || [
        { name: 'Seg', sales: 0, meetings: 0 },
        { name: 'Ter', sales: 0, meetings: 0 },
        { name: 'Qua', sales: 0, meetings: 0 },
        { name: 'Qui', sales: 0, meetings: 0 },
        { name: 'Sex', sales: 0, meetings: 0 }
    ];

    // Calculate totals
    const totalRevenue = overview.revenue || 0;
    const totalMoneyOnTable = overview.moneyOnTable || 0;
    const totalPipeline = overview.pipelineValue || 0;
    const totalMeetings = collaborators.reduce((sum: number, c: any) => sum + c.stats.meetings, 0);
    const totalContacts = collaborators.reduce((sum: number, c: any) => sum + c.stats.contacts, 0);

    // Leaderboard data
    const leaderboardPlayers = collaborators.map((c: any) => ({
        id: c.id,
        name: c.name,
        role: c.role,
        level: c.level,
        xp: c.xp,
        xpToday: c.xpToday, // Real session XP
        sales: c.stats.sales,
        avatar: c.avatar,
        addedToday: c.addedToday // New field
    }));

    const teamPace = collaborators.length > 0 ? Math.round(collaborators.reduce((acc: number, c: any) => acc + c.pace, 0) / collaborators.length) : 0;
    const teamQuality = collaborators.length > 0 ? Math.round(collaborators.reduce((acc: number, c: any) => acc + c.quality, 0) / collaborators.length) : 0;

    // Calculate Period Label for Cards
    const periodLabel = selectedPeriod === 'today' ? 'HOJE' :
        selectedPeriod === '7d' ? '7D' :
            selectedPeriod === '15d' ? '15D' :
                selectedPeriod === 'total' ? 'TOTAL' :
                    selectedPeriod === 'custom' ? 'CUSTOM' : (selectedPeriod as string).toUpperCase();

    return (
        <div className="min-h-screen bg-bg-deep text-white flex flex-col overflow-hidden font-sans">
            <LevelUpModal
                isOpen={showLevelUp}
                onClose={() => setShowLevelUp(false)}
                level={levelUpData.level}
                userName={levelUpData.name}
                avatar={levelUpData.avatar}
            />

            {/* Dev Trigger for Level Up (Hidden in Prod ideally, but visible here for Sprint 7 demo) */}
            <div className="fixed bottom-4 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity pointer-events-auto">
                <Button onClick={triggerLevelUp} size="sm" variant="outline" className="bg-black/50 border-white/10 text-xs text-white hover:bg-black/80">
                    ⚡ Sim Level Up
                </Button>
            </div>

            {/* Header */}
            <header className="h-16 border-b border-border-subtle bg-bg-deep/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="text-text-muted hover:text-white hover:bg-bg-hover">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                            <span className="text-accent">✦</span> SUPERDASH
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-bg-elevated border border-border-subtle text-xs text-text-muted flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
                        </span>
                        AO VIVO
                    </div>
                    <Button variant="outline" size="sm" onClick={toggleFullscreen} className="border-border-subtle bg-bg-elevated hover:bg-bg-hover text-text-muted hover:text-white">
                        {isFullscreen ? <><Minimize2 className="w-4 h-4 mr-2" />Sair</> : <><Maximize2 className="w-4 h-4 mr-2" />Tela Cheia</>}
                    </Button>
                    <CastButton />
                    <UserMenu />
                </div>
            </header>

            <main className="flex-1 overflow-auto p-6 scrollbar-hide">

                {/* SUPER HERO: Clock & Stats */}
                <div className="mb-12 animate-in fade-in slide-in-from-top-10 duration-1000 flex justify-center">
                    <LiveClock
                        revenue={totalRevenue}
                        contacts={totalContacts}
                        meetings={totalMeetings}
                        className="max-w-4xl border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                    />
                </div>

                {/* TIER 1.5: Gauges & Insight (Moved down) */}
                <div className="flex flex-col items-center justify-center mb-8 gap-6 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                    <div className="flex items-center gap-8">
                        <div className="scale-110 w-[400px] md:w-[600px]">
                            <DualGauge
                                pace={teamPace}
                                quality={teamQuality}
                                stats={{
                                    leads: totalContacts,
                                    meetings: totalMeetings,
                                    sales: overview.totalSales
                                }}
                            />
                        </div>
                    </div>
                    <InsightAlert pace={teamPace} quality={teamQuality} />
                </div>

                {/* TIER 1: KPIs */}
                <div className="grid grid-cols-6 gap-4 mb-8">
                    {/* Big Revenue Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-1 bg-linear-to-br from-[#DECCA8]/10 to-bg-elevated border border-[#DECCA8]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#DECCA8]/40 transition-all"
                    >
                        {/* Sparkline Overlay */}
                        <div className="absolute bottom-0 right-0 opacity-20 pointer-events-none">
                            <Sparkline
                                data={timeData.map((d: any) => d.sales * 2500)}
                                color="#DECCA8"
                                className="w-32 h-16"
                            />
                        </div>

                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#DECCA8]/5 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center gap-2 text-[#DECCA8] mb-2">
                                <DollarSign className="w-5 h-5" />
                                <span className="text-[10px] uppercase tracking-wider font-bold">Receita Total</span>
                            </div>
                            <div className="font-display text-4xl font-black text-[#DECCA8] tracking-tight drop-shadow-lg">
                                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-[#DECCA8]/80">
                                <TrendingUp className="w-3 h-3" />
                                +{overview.growth}% vs mês anterior
                            </div>
                        </div>
                    </motion.div>

                    {/* Money on Table Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="col-span-1 bg-linear-to-br from-neon-cyan/5 to-bg-elevated border border-neon-cyan/20 rounded-2xl p-6 relative overflow-hidden group hover:border-neon-cyan/40 transition-all"
                    >
                        <div className="absolute bottom-0 right-0 opacity-20 pointer-events-none">
                            <Sparkline
                                data={[10, 15, 8, 12, 20]} // Mock pipeline trend
                                color="#00F0FF"
                                className="w-32 h-16"
                            />
                        </div>

                        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center gap-2 text-neon-cyan mb-2">
                                <Zap className="w-5 h-5" />
                                <span className="text-[10px] uppercase tracking-wider font-bold">Dinheiro na Mesa!</span>
                            </div>
                            <div className="font-display text-4xl font-black text-white tracking-tight drop-shadow-lg">
                                R$ {totalMoneyOnTable.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-neon-cyan/80 font-medium">
                                <Activity className="w-3 h-3" />
                                Reuniões + Em Fechamento
                            </div>
                        </div>
                    </motion.div>

                    {/* Other KPIs */}
                    <KPICard
                        title="Vendas Mês"
                        value={overview.totalSales}
                        icon={Trophy}
                        trend="+12%"
                        iconColor="text-accent"
                        progressColor="bg-accent"
                        xp={25}
                        subtext={`${overview.conversionRate}% conv.`}
                        sparklineData={timeData.map((d: any) => d.sales)}
                    />

                    <KPICard
                        title="Reuniões"
                        value={totalMeetings}
                        icon={Calendar}
                        trend="+5%"
                        iconColor="text-neon-cyan"
                        progressColor="bg-neon-cyan"
                        xp={50}
                        subtext="Esta semana"
                        sparklineData={timeData.map((d: any) => d.meetings)}
                    />

                    <KPICard
                        title="Contatos"
                        value={totalContacts}
                        icon={Phone}
                        trend="+15%"
                        iconColor="text-neon-purple"
                        progressColor="bg-neon-purple"
                        xp={10}
                        subtext="Leads"
                        sparklineData={[15, 20, 25, 30, 28, 35, 40]} // Mock contact trend
                    />

                    {/* Money on Table (Pipeline) */}
                    <KPICard
                        title="Em Pipeline"
                        value={`R$ ${totalPipeline > 1000 ? (totalPipeline / 1000).toFixed(0) + 'k' : totalPipeline}`}
                        icon={Target}
                        trend="Ativos"
                        trendPositive={true}
                        iconColor="text-neon-yellow"
                        progressColor="bg-neon-yellow"
                        xp={5}
                        subtext={`${overview.activeLeads} leads locais`}
                        sparklineData={[100, 98, 95, 92, 90, 88, 85]} // Mock active trend
                    />
                </div>

                {/* TIER 2: Main Content - 3 Columns */}
                <div className="grid grid-cols-12 gap-6">

                    {/* LEFT: Leaderboard + XP Feed */}
                    <div className="col-span-3 flex flex-col gap-4">
                        <Leaderboard
                            players={leaderboardPlayers}
                            currentUserId={profile?.id}
                        />
                        <XPFeed events={data?.feed || []} maxEvents={6} />
                    </div>

                    {/* CENTER: Player Cards Arena */}
                    <div className="col-span-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-accent" />
                                Arena do Time
                            </h2>
                            <div className="flex items-center gap-4">
                                <DateFilterToggle
                                    value={selectedPeriod}
                                    onChange={(p, r) => {
                                        console.log('Changing period to:', p, r);
                                        setSelectedPeriod(p);
                                        if (r) setCustomRange(r);
                                    }}
                                    currentRange={customRange}
                                />
                                <span className="text-xs text-text-muted">{collaborators.length} jogadores</span>
                            </div>
                        </div>

                        {/* Player Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {collaborators.map((collab: any, index: number) => {
                                // Cumulative Score: Use XP as base for performance-based rating (0-99)
                                // We normalize XP relative to a high target (e.g. 5000 XP)
                                const cumulativeScore = Math.min(Math.round((collab.xp / 5000) * 99), 99);

                                // Period Data still used for the badge and sub-stats
                                const cardData = generatePlayerCard(
                                    {
                                        leads: collab.stats.contacts,
                                        respostas: collab.stats.responses,
                                        reunioes: collab.stats.meetings,
                                        vendas: collab.stats.sales,
                                    },
                                    index + 1,
                                    collaborators.length,
                                    5 // Mock streak for now
                                );

                                // Final Tier should be derived from the CUMULATIVE score + Ranking
                                const tier = getTier(cumulativeScore, index + 1, collaborators.length);

                                return (
                                    <div key={collab.id} className="flex justify-center transform transition-all duration-500 hover:scale-105">
                                        <PlayerCard
                                            name={collab.name}
                                            initials={
                                                collab.name.toLowerCase().includes('joao') ? 'JVG' :
                                                    collab.name.toLowerCase().includes('bruno') ? 'BRV' :
                                                        collab.name.toLowerCase().includes('vitor') ? 'VTZ' :
                                                            collab.role.substring(0, 3).toUpperCase()
                                            }
                                            role={collab.role}
                                            avatar={collab.avatar}
                                            level={collab.level}
                                            score={cumulativeScore}
                                            tier={tier}
                                            stats={cardData.stats}
                                            badge={cardData.badge}
                                            ranking={index + 1}
                                            period={periodLabel}
                                            edition={index === 0 ? "Top #1" : index < 3 ? "Elite" : "Pro"}
                                            onClick={() => setSelectedUser(collab)}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Trend Chart - Real-time activities */}
                        <ActionTrendChart
                            data={data?.actionTrend || []}
                            period={selectedPeriod}
                            className="mt-6"
                        />
                    </div>

                    {/* RIGHT: Gamification Sidebar */}
                    <div className="col-span-3 flex flex-col gap-4">
                        <TeamCalendar meetings={data?.calendar || []} />
                        <LevelProgress
                            levelInfo={{
                                level: selectedUser?.level || 1,
                                currentXP: selectedUser?.xp || 0,
                                xpForCurrentLevel: 0,
                                xpForNextLevel: selectedUser?.nextLevelXp || 1000,
                                progress: selectedUser ? (selectedUser.xp / selectedUser.nextLevelXp) * 100 : 0,
                                xpToNextLevel: selectedUser ? selectedUser.nextLevelXp - selectedUser.xp : 1000
                            }}
                        />
                        <StreakCounter currentStreak={5} longestStreak={12} />
                        <DailyQuestCard quests={MOCK_QUESTS} />
                    </div>
                </div>
            </main>
        </div>
    );
}
