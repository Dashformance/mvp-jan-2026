"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Users, TrendingUp, Target, Trophy, Calendar, ArrowUpRight,
    ArrowDownRight, Loader2, BarChart3, Activity, Zap, LogOut
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import Link from 'next/link';
import { RegionDistribution } from "@/components/dashboard/RegionDistribution";

const API_URL = "/api";

const STATUS_LABELS: Record<string, string> = {
    INBOX: 'Lista Fria',
    NEW: 'Novo',
    ATTEMPTED: 'Tentando Contato',
    CONTACTED: 'Contatado',
    MEETING: 'Reunião',
    WON: 'Ganho',
    LOST: 'Perdido',
    DISQUALIFIED: 'Desqualificado'
};

const FUNNEL_COLORS = ['#94a3b8', '#22d3ee', '#fbbf24', '#DECCA8', '#a78bfa', '#4ade80', '#f87171'];

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');
    const [overview, setOverview] = useState<any>(null);
    const [funnel, setFunnel] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [performance, setPerformance] = useState<any>(null);
    const [geoData, setGeoData] = useState<{ byRegion: Record<string, number>, total: number }>({ byRegion: {}, total: 0 });
    const [salesForce, setSalesForce] = useState<any>(null);

    useEffect(() => {
        console.log("Dashboard reloading stats with period:", period);
        fetchAllStats();
    }, [period]);

    const fetchAllStats = async () => {
        setLoading(true);
        try {
            const [overviewRes, funnelRes, timelineRes, performanceRes, geoRes, salesForceRes] = await Promise.all([
                fetch(`${API_URL}/leads/stats/overview`),
                fetch(`${API_URL}/leads/stats/funnel`),
                fetch(`${API_URL}/leads/stats/timeline?days=${period}`),
                fetch(`${API_URL}/leads/stats/performance`),
                fetch(`${API_URL}/leads/stats/geo`),
                fetch(`${API_URL}/leads/stats/salesforce`)
            ]);

            const data_overview = await overviewRes.json();
            const data_funnel = await funnelRes.json();
            const data_timeline = await timelineRes.json();
            const data_performance = await performanceRes.json();
            const data_geo = await geoRes.json();
            const data_salesForce = await salesForceRes.json();

            setOverview(data_overview?.error ? null : data_overview);
            setFunnel(Array.isArray(data_funnel) ? data_funnel : []);
            setTimeline(Array.isArray(data_timeline) ? data_timeline : []);
            setPerformance(data_performance?.error ? null : data_performance);
            setGeoData(data_geo?.error ? { byRegion: {}, total: 0 } : data_geo);
            setSalesForce(data_salesForce?.error ? null : data_salesForce);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        document.cookie = "dashformance_v5_access=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        localStorage.removeItem('lead_extractor_user');
        window.location.href = "/login";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#DECCA8]" />
                    <span className="text-muted-foreground text-sm">Carregando estatísticas...</span>
                </div>
            </div>
        );
    }

    const kpiCards = [
        {
            title: 'Total de Leads',
            value: overview?.total || 0,
            change: overview?.addedThisMonth || 0,
            changeLabel: 'este mês',
            icon: Users,
            color: 'text-cyan-400'
        },
        {
            title: 'Leads Ganhos',
            value: overview?.byStatus?.WON || 0,
            change: Math.round(((overview?.byStatus?.WON || 0) / (overview?.total || 1)) * 100),
            changeLabel: '% conversão',
            icon: Trophy,
            color: 'text-emerald-400'
        },
        {
            title: 'Em Reunião',
            value: overview?.byStatus?.MEETING || 0,
            change: overview?.byStatus?.CONTACTED || 0,
            changeLabel: 'contatados',
            icon: Calendar,
            color: 'text-purple-400'
        },
        {
            title: 'Novos Hoje',
            value: overview?.addedToday || 0,
            change: overview?.addedThisWeek || 0,
            changeLabel: 'esta semana',
            icon: Zap,
            color: 'text-[#DECCA8]'
        }
    ];

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-white p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Estatísticas de prospecção em tempo real</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px] bg-[#1C1C1C] border-white/10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Últimos 7 dias</SelectItem>
                            <SelectItem value="30">Últimos 30 dias</SelectItem>
                            <SelectItem value="90">Últimos 90 dias</SelectItem>
                        </SelectContent>
                    </Select>
                    <Link href="/">
                        <Button variant="outline" className="border-white/10 hover:bg-white/5">
                            Ver Leads
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 border border-rose-400/20"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpiCards.map((kpi, idx) => (
                    <Card key={idx} className="bg-[#1C1C1C] border-white/5 hover:border-white/10 transition-all">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                                    <p className="text-3xl font-bold mt-1">{kpi.value.toLocaleString()}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                        <span className="text-xs text-emerald-400">{kpi.change}</span>
                                        <span className="text-xs text-muted-foreground ml-1">{kpi.changeLabel}</span>
                                    </div>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${kpi.color}`}>
                                    <kpi.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Timeline Chart */}
                <Card className="bg-[#1C1C1C] border-white/5 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Activity className="w-5 h-5 text-cyan-400" />
                            Leads por Dia
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeline}>
                                    <defs>
                                        <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#666"
                                        tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1C1C1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="added"
                                        stroke="#22d3ee"
                                        fill="url(#colorAdded)"
                                        strokeWidth={2}
                                        name="Leads Adicionados"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Funnel Chart */}
                <Card className="bg-[#1C1C1C] border-white/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BarChart3 className="w-5 h-5 text-[#DECCA8]" />
                            Funil de Vendas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative pt-2 pb-6 px-4">
                            {(() => {
                                const FUNNEL_STAGES = [
                                    { id: 'INBOX', label: '1. Lista Fria', color: '#94a3b8' },
                                    { id: 'NEW', label: '2. Qualificados', color: '#22d3ee' },
                                    { id: 'CONTACTED', label: '3. Contatados', color: '#818cf8' },
                                    { id: 'MEETING', label: '4. Reuniões Marcadas', color: '#c084fc' },
                                    { id: 'WON', label: '5. Fechamentos', color: '#4ade80' }
                                ];

                                // Create map for O(1) lookup
                                const funnelMap = new Map(funnel.map(f => [f.status, f.count]));

                                // Calculate max value for bar scaling
                                const maxVal = Math.max(...FUNNEL_STAGES.map(s => funnelMap.get(s.id) || 0), 10); // Min 10 to avoid div by zero issues

                                return (
                                    <div className="flex flex-col items-center gap-3">
                                        {FUNNEL_STAGES.map((stage, idx) => {
                                            const count = funnelMap.get(stage.id) || 0;
                                            const widthPercent = 100 - (idx * 12); // Decreasing width for funnel shape
                                            const barPercent = Math.max((count / maxVal) * 100, 2); // Minimum visibility

                                            return (
                                                <div
                                                    key={stage.id}
                                                    className="w-full flex flex-col items-center group relative translate-x-0 transition-all hover:scale-[1.02]"
                                                    style={{ width: `${widthPercent}%` }}
                                                >
                                                    {/* Row Data */}
                                                    <div className="w-full flex justify-between text-xs text-muted-foreground mb-1 px-2">
                                                        <span className="font-medium text-white/90">{stage.label}</span>
                                                        <span className="font-mono text-white">{count}</span>
                                                    </div>

                                                    {/* Funnel Bar Container (Trapezoid-ish effect via width reduction) */}
                                                    <div className="w-full h-8 bg-white/5 rounded-md relative overflow-hidden backdrop-blur-sm border border-white/5">
                                                        {/* Filled Bar */}
                                                        <div
                                                            className="h-full absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-out flex items-center justify-center"
                                                            style={{
                                                                width: `${barPercent}%`,
                                                                backgroundColor: stage.color,
                                                                boxShadow: `0 0 20px ${stage.color}40`
                                                            }}
                                                        >
                                                            {count > 0 && barPercent > 15 && (
                                                                <span className="text-[10px] font-bold text-black/80">
                                                                    {((count / (overview?.total || 1)) * 100).toFixed(1)}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Connector Line (except last) */}
                                                    {idx < FUNNEL_STAGES.length - 1 && (
                                                        <div className="h-3 w-[1px] bg-white/10 my-0.5" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sales Force Section - This is the key competitive metric */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Sales Force Scoreboard */}
                <Card className="bg-[#1C1C1C] border-white/5 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Força de Vendas - Placar do Dia
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {salesForce && (
                            <div className="grid grid-cols-2 gap-8">
                                {Object.entries(salesForce).map(([owner, data]: [string, any]) => (
                                    <div key={owner} className="space-y-4">
                                        {/* Owner Header with Score */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/5 to-transparent">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-[#DECCA8] flex items-center justify-center text-black text-xl font-bold">
                                                    {owner.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-xl font-bold capitalize">{owner}</p>
                                                    <p className="text-xs text-muted-foreground">{data.totalActive} leads ativos</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold text-[#DECCA8]">{data.score.today}</p>
                                                <p className="text-xs text-muted-foreground">pontos hoje</p>
                                            </div>
                                        </div>

                                        {/* Period Stats */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Today */}
                                            <div className="p-3 rounded-lg bg-white/5 text-center">
                                                <p className="text-xs text-muted-foreground mb-2 uppercase">Hoje</p>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Contatos</span>
                                                        <span className="font-medium text-cyan-400">{data.today.contacted}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Reuniões</span>
                                                        <span className="font-medium text-purple-400">{data.today.meetings}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Ganhos</span>
                                                        <span className="font-medium text-emerald-400">{data.today.won}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Week */}
                                            <div className="p-3 rounded-lg bg-white/5 text-center">
                                                <p className="text-xs text-muted-foreground mb-2 uppercase">Semana</p>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Contatos</span>
                                                        <span className="font-medium text-cyan-400">{data.week.contacted}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Reuniões</span>
                                                        <span className="font-medium text-purple-400">{data.week.meetings}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Ganhos</span>
                                                        <span className="font-medium text-emerald-400">{data.week.won}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Month */}
                                            <div className="p-3 rounded-lg bg-white/5 text-center">
                                                <p className="text-xs text-muted-foreground mb-2 uppercase">Mês</p>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Contatos</span>
                                                        <span className="font-medium text-cyan-400">{data.month.contacted}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Reuniões</span>
                                                        <span className="font-medium text-purple-400">{data.month.meetings}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Ganhos</span>
                                                        <span className="font-medium text-emerald-400">{data.month.won}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Score Bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Pontuação Mensal</span>
                                                <span className="font-medium">{data.score.month} pts</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-[#DECCA8] transition-all duration-500"
                                                    style={{ width: `${Math.min((data.score.month / 100) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Score Legend */}
                        <div className="mt-6 pt-4 border-t border-white/5">
                            <p className="text-xs text-muted-foreground">
                                📌 Pontuação: <span className="text-cyan-400">Contato = 1pt</span> •
                                <span className="text-purple-400 ml-2">Reunião = 3pts</span> •
                                <span className="text-emerald-400 ml-2">Ganho = 10pts</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Geographic Distribution Row - Simplified */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Region Distribution - 3D Globe */}
                <div className="h-full min-h-[450px]">
                    <RegionDistribution data={geoData.byRegion} />
                </div>

                {/* Distribution Pie */}
                <Card className="bg-[#1C1C1C] border-white/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            Distribuição por Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={funnel.filter(f => f.count > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={4}
                                        dataKey="count"
                                        nameKey="status"
                                        label={({ name, value }) => `${STATUS_LABELS[name as string] || name}: ${value}`}
                                        labelLine={{ stroke: '#666', strokeWidth: 1 }}
                                    >
                                        {funnel.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]}
                                                stroke="transparent"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1C1C1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        formatter={(value, name) => [value, STATUS_LABELS[name as string] || name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance by Owner */}
                <Card className="bg-[#1C1C1C] border-white/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Target className="w-5 h-5 text-emerald-400" />
                            Performance por Responsável
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {performance && Object.entries(performance).map(([owner, data]: [string, any]) => (
                                <div key={owner} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-[#DECCA8] flex items-center justify-center text-black font-bold">
                                                {owner.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium capitalize">{owner}</p>
                                                <p className="text-xs text-muted-foreground">{data.total} leads atribuídos</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                                            {data.conversionRate}% conversão
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <div className="p-2 rounded-lg bg-white/5">
                                            <p className="text-lg font-semibold">{data.total}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">Total</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/5">
                                            <p className="text-lg font-semibold text-[#DECCA8]">{data.contacted}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">Contatados</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/5">
                                            <p className="text-lg font-semibold text-purple-400">{data.meeting}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">Reuniões</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/5">
                                            <p className="text-lg font-semibold text-emerald-400">{data.won}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">Ganhos</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

