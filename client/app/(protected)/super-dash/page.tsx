"use client"

import { useAuth } from "@/context/auth-context";
import { ArrowLeft, Trophy, Target, Users, TrendingUp, Zap, Star, Shield, Filter, Maximize2, Minimize2, DollarSign, Phone, Calendar, Award, Flame, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback, useMemo } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import useSWR from "swr";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

// Gamification Components
import { LevelProgress, StreakCounter, XPFeed, DailyQuestCard } from "@/components/gamification";
import { Leaderboard } from "@/components/arena/Leaderboard";
import { LiveClock } from "@/components/super-dash/LiveClock";
import { KPICard } from "@/components/super-dash/KPICard";
import { TrendChart } from "@/components/super-dash/TrendChart";
import { AppleGauge } from "@/components/super-dash/AppleGauge";
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
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Sprint 11: Date Filters - Default: Essa Semana
    const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('week');
    const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>();

    // Level Up State (Sprint 7)
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [levelUpData, setLevelUpData] = useState({ level: 5, name: 'João Vitor', avatar: '👨‍💼' });

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

    // SWR Data Fetching
    const params = new URLSearchParams();
    params.set('period', selectedPeriod);
    if (selectedPeriod === 'custom' && customRange?.from && customRange?.to) {
        params.set('startDate', customRange.from.toISOString());
        params.set('endDate', customRange.to.toISOString());
    }
    const apiUrl = `/api/super-dash/stats?${params.toString()}`;

    const { data: swrData, error: swrError, isLoading: swrLoading, mutate } = useSWR(
        apiUrl,
        (url) => fetchWithAuth(url).then(res => res.json())
    );

    const data = swrData;
    const loading = !swrData && swrLoading;

    // Memoized Data to prevent infinite loops and improve performance
    const collaborators = useMemo(() => Array.isArray(data?.collaborators) ? data.collaborators : [], [data?.collaborators]);

    const selectedUser = useMemo(() => {
        if (selectedUserId) {
            return collaborators.find((c: any) => c.id === selectedUserId);
        }
        return collaborators[0];
    }, [selectedUserId, collaborators]);

    const overview = useMemo(() => data?.overview || {
        totalLeads: 0,
        totalSales: 0,
        conversionRate: 0,
        activeLeads: 0,
        growth: 0,
        revenue: 0,
        pipelineValue: 0,
        moneyOnTable: 0
    }, [data?.overview]);

    const timeData = useMemo(() => data?.timeData || [
        { name: 'Seg', sales: 0, meetings: 0 },
        { name: 'Ter', sales: 0, meetings: 0 },
        { name: 'Qua', sales: 0, meetings: 0 },
        { name: 'Qui', sales: 0, meetings: 0 },
        { name: 'Sex', sales: 0, meetings: 0 }
    ], [data?.timeData]);

    const totalRevenue = useMemo(() => overview.revenue || 0, [overview.revenue]);
    const totalMoneyOnTable = useMemo(() => overview.moneyOnTable || 0, [overview.moneyOnTable]);
    const totalPipeline = useMemo(() => overview.pipelineValue || 0, [overview.pipelineValue]);

    // Use period-specific data from overview (already filtered by date)
    const totalMeetings = useMemo(() => overview.totalMeetings || 0, [overview.totalMeetings]);
    const totalContacts = useMemo(() => overview.totalContacts || 0, [overview.totalContacts]);

    const leaderboardPlayers = useMemo(() => collaborators.map((c: any) => ({
        id: c.id,
        name: c.name,
        role: c.role,
        level: c.level,
        xp: c.xp,
        xpToday: c.xpToday,
        sales: c.stats?.sales || 0,
        avatar: c.avatar,
        addedToday: c.addedToday
    })), [collaborators]);

    const teamPace = useMemo(() => collaborators.length > 0 ? Math.round(collaborators.reduce((acc: number, c: any) => acc + (c.pace || 0), 0) / collaborators.length) : 0, [collaborators]);
    const teamQuality = useMemo(() => collaborators.length > 0 ? Math.round(collaborators.reduce((acc: number, c: any) => acc + (c.quality || 0), 0) / collaborators.length) : 0, [collaborators]);

    const periodLabel = useMemo(() => {
        const labels: Record<string, string> = {
            today: 'HOJE',
            '7d': '7D',
            '15d': '15D',
            total: 'TOTAL',
            custom: 'CUSTOM'
        };
        return labels[selectedPeriod] || (selectedPeriod as string).toUpperCase();
    }, [selectedPeriod]);

    // Simulate Level Up (Dev Tool)
    const triggerLevelUp = useCallback(() => {
        setLevelUpData({
            level: (selectedUser?.level || 4) + 1,
            name: selectedUser?.name || 'Usuário',
            avatar: selectedUser?.avatar || '👤'
        });
        setShowLevelUp(true);
    }, [selectedUser]);

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

                {/* HERO SECTION: Clock + Filter em linha */}
                <div className="mb-8 animate-in fade-in slide-in-from-top-10 duration-1000">
                    <div className="flex items-start justify-between gap-6">
                        {/* Clock - mais compacto à esquerda */}
                        <div className="flex-1 max-w-2xl">
                            <LiveClock
                                revenue={totalRevenue}
                                contacts={totalContacts}
                                meetings={totalMeetings}
                                className="border-white/10 shadow-lg"
                            />
                        </div>

                        {/* Filter à direita */}
                        <div className="shrink-0 pt-4">
                            <DateFilterToggle
                                value={selectedPeriod}
                                onChange={(period, range) => {
                                    setSelectedPeriod(period);
                                    if (range) setCustomRange(range);
                                }}
                                currentRange={customRange}
                            />
                        </div>
                    </div>
                </div>

                {/* GAUGES & TREND Side by Side - mais compacto */}
                <div className="grid grid-cols-12 gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                    {/* Left: Apple Gauge (Velocímetro - proporção 3/12) */}
                    <div className="col-span-3">
                        <AppleGauge
                            pace={teamPace}
                            quality={teamQuality}
                            className="h-[200px]"
                        />
                    </div>

                    {/* Right: ActionTrendChart (Gráfico - proporção 9/12) */}
                    <div className="col-span-9 h-[200px]">
                        <ActionTrendChart
                            data={data?.actionTrend || []}
                            period={selectedPeriod}
                        />
                    </div>
                </div>



                {/* KPIs Section - Grid mais compacto */}
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-3 h-3 text-accent" />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Métricas do Período</span>
                </div>
                <div className="grid grid-cols-6 gap-3 mb-6">
                    {/* Big Revenue Card - Compacto */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-1 bg-linear-to-br from-[#DECCA8]/10 to-bg-elevated border border-[#DECCA8]/20 rounded-xl p-4 relative overflow-hidden hover:border-[#DECCA8]/40 transition-all"
                    >
                        <div className="absolute bottom-0 right-0 opacity-20 pointer-events-none">
                            <Sparkline
                                data={timeData.map((d: any) => d.sales * 2500)}
                                color="#DECCA8"
                                className="w-20 h-10"
                            />
                        </div>
                        <div className="relative">
                            <div className="flex items-center gap-1.5 text-[#DECCA8] mb-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-[9px] uppercase tracking-wider font-bold">Receita</span>
                            </div>
                            <div className="font-display text-2xl font-black text-[#DECCA8] tracking-tight">
                                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-[9px] text-[#DECCA8]/70">
                                <TrendingUp className="w-2.5 h-2.5" />
                                +{overview.growth || 0}% vs anterior
                            </div>
                        </div>
                    </motion.div>

                    {/* Money on Table Card - Compacto */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="col-span-1 bg-linear-to-br from-neon-cyan/5 to-bg-elevated border border-neon-cyan/20 rounded-xl p-4 relative overflow-hidden hover:border-neon-cyan/40 transition-all"
                    >
                        <div className="absolute bottom-0 right-0 opacity-20 pointer-events-none">
                            <Sparkline
                                data={[10, 15, 8, 12, 20]}
                                color="#00F0FF"
                                className="w-20 h-10"
                            />
                        </div>
                        <div className="relative">
                            <div className="flex items-center gap-1.5 text-neon-cyan mb-1">
                                <Zap className="w-4 h-4" />
                                <span className="text-[9px] uppercase tracking-wider font-bold">Na Mesa</span>
                            </div>
                            <div className="font-display text-2xl font-black text-white tracking-tight">
                                R$ {totalMoneyOnTable.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-[9px] text-neon-cyan/70">
                                <Activity className="w-2.5 h-2.5" />
                                Reuniões + Fechamento
                            </div>
                        </div>
                    </motion.div>

                    {/* Other KPIs */}
                    <KPICard
                        title="Vendas"
                        value={overview.totalSales}
                        icon={Trophy}
                        trend={overview.totalSales > 0 ? "+12%" : "0%"}
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
                        trend={totalMeetings > 0 ? "+5%" : "0%"}
                        iconColor="text-neon-cyan"
                        progressColor="bg-neon-cyan"
                        xp={50}
                        subtext="No período"
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
                        sparklineData={[15, 20, 25, 30, 28, 35, 40]}
                    />

                    <KPICard
                        title="Pipeline"
                        value={`R$ ${totalPipeline > 1000 ? (totalPipeline / 1000).toFixed(0) + 'k' : totalPipeline}`}
                        icon={Target}
                        trend="Ativos"
                        trendPositive={true}
                        iconColor="text-neon-yellow"
                        progressColor="bg-neon-yellow"
                        xp={5}
                        subtext={`${overview.activeLeads} leads`}
                        sparklineData={[100, 98, 95, 92, 90, 88, 85]}
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
                                {/* Filters removed as per request */}
                            </div>
                        </div>

                        {/* Player Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {collaborators.map((collab: any, index: number) => {
                                // Use period-sensitive score from API, fallback to cumulative only if missing
                                const displayScore = collab.score || Math.min(Math.round((collab.xp / 5000) * 99), 99);

                                // Period Data
                                const cardData = generatePlayerCard(
                                    {
                                        leads: collab.stats.contacts,
                                        respostas: collab.stats.responses,
                                        reunioes: collab.stats.meetings,
                                        vendas: collab.stats.sales,
                                    },
                                    index + 1,
                                    collaborators.length,
                                    5
                                );

                                // Final Tier should be derived from the CUMULATIVE score + Ranking
                                const tier = getTier(displayScore, index + 1, collaborators.length);

                                return (
                                    <div key={collab.id} className="flex justify-center transform transition-all duration-500 hover:scale-105">
                                        <PlayerCard
                                            name={collab.name}
                                            initials={
                                                collab.name.toLowerCase().includes('joão') || collab.name.toLowerCase().includes('joao') ? 'JV' :
                                                    collab.name.toLowerCase().includes('bruno') ? 'BR' :
                                                        collab.name.toLowerCase().includes('vitor') ? 'VT' :
                                                            collab.role.substring(0, 2).toUpperCase()
                                            }
                                            role={collab.role}
                                            avatar={collab.avatar}
                                            level={collab.level}
                                            score={displayScore}
                                            tier={tier}
                                            stats={cardData.stats}
                                            badge={cardData.badge}
                                            ranking={index + 1}
                                            period={periodLabel}
                                            edition={index === 0 ? "Top #1" : index < 3 ? "Elite" : "Pro"}
                                            onClick={() => setSelectedUserId(collab.id)}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Trend Chart moved to upper section - removing from here */}
                    </div>

                    {/* RIGHT: Gamification Sidebar */}
                    <div className="col-span-3 flex flex-col gap-4">
                        <TeamCalendar meetings={data?.calendar || []} onMeetingChange={() => mutate()} />
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
