"use client"

import { useState, useEffect } from 'react';
import { Loader2 } from "lucide-react";

// Use API_URL from environment or default
const API_URL = "/api";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Data States
    const [overview, setOverview] = useState<any>(null);
    const [salesForce, setSalesForce] = useState<any>(null);
    const [performanceData, setPerformanceData] = useState<any>(null);
    const [gaugePercent, setGaugePercent] = useState(0);

    // Clock Effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Data Fetching
    useEffect(() => {
        fetchAllStats();
    }, []);

    // Update Gauge when data changes
    useEffect(() => {
        if (performanceData?.conversionRate) {
            // Add a small delay for animation effect
            setTimeout(() => {
                setGaugePercent(Math.min(performanceData.conversionRate * 10, 100)); // Scaled up for visibility or use raw?
                // If conversionRate is e.g. 5%, let's mapped it to gauge. 
                // Let's assume the gauge 0-100 represents the conversion score.
                // For now, let's just use the conversionRate directly if it's 0-100.
                setGaugePercent(performanceData.conversionRate || 0);
            }, 500);
        }
    }, [performanceData]);

    const fetchAllStats = async () => {
        setLoading(true);
        try {
            const [overviewRes, performanceRes, salesForceRes] = await Promise.all([
                fetch(`${API_URL}/leads/stats/overview`),
                fetch(`${API_URL}/leads/stats/performance`),
                fetch(`${API_URL}/leads/stats/salesforce`)
            ]);

            const data_overview = await overviewRes.json();
            const data_performance = await performanceRes.json();
            const data_salesForce = await salesForceRes.json();

            setOverview(data_overview?.error ? null : data_overview);
            setPerformanceData(data_performance?.error ? null : data_performance);
            setSalesForce(data_salesForce?.error ? null : data_salesForce);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
                `}</style>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#DECCA8]" />
                    <span className="text-[#888888] text-sm font-sans">Carregando War Room...</span>
                </div>
            </div>
        );
    }

    // derived values
    const leadsContacted = overview?.byStatus?.CONTACTED || 0;
    const meetingsScheduled = overview?.byStatus?.MEETING || 0;
    const leadsTotal = overview?.total || 0;
    const salesWon = overview?.byStatus?.WON || 0;
    const activeLeads = salesForce?.totalActive || 0; // Assuming this aggregates or exists

    // Date formatting
    const dateString = currentTime.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    // Time formatting
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');

    // Gauge Calculations
    const maxOffset = 283;
    const offset = maxOffset - (maxOffset * (gaugePercent / 100));
    const rotation = -135 + (gaugePercent * 2.7);

    // Dynamic classes for gauge value
    let gaugeValueClass = "gauge-value";
    if (gaugePercent < 30) gaugeValueClass += " critical";
    else if (gaugePercent < 50) gaugeValueClass += " warning";
    else if (gaugePercent < 70) gaugeValueClass += " attention";
    else gaugeValueClass += " good";

    return (
        <div className="super-dash-container">
            {/* Font Import */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
                
                :root {
                    /* Backgrounds */
                    --bg-void: #050505;
                    --bg-base: #0A0A0A;
                    --bg-card: #111111;
                    --bg-elevated: #1a1a1a;
                    
                    /* Glass */
                    --glass-bg: rgba(255, 255, 255, 0.03);
                    --glass-border: rgba(255, 255, 255, 0.08);
                    
                    /* Accent */
                    --champagne: #DECCA8;
                    --champagne-glow: rgba(222, 204, 168, 0.3);
                    
                    /* Neon */
                    --neon-green: #00FF88;
                    --neon-cyan: #00D4FF;
                    --neon-yellow: #FFE066;
                    --neon-orange: #FF9F43;
                    --neon-red: #FF4757;
                    
                    /* Text */
                    --text-primary: #FFFFFF;
                    --text-secondary: #888888;
                    --text-muted: #555555;
                }

                .super-dash-container {
                    font-family: 'Inter', sans-serif;
                    background: var(--bg-void);
                    color: var(--text-primary);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    gap: 32px;
                    overflow: hidden;
                    position: relative;
                }

                /* ===== HERO SECTION ===== */
                .hero-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                    padding: 40px 60px;
                    background: linear-gradient(180deg, var(--glass-bg) 0%, transparent 100%);
                    border: 1px solid var(--glass-border);
                    border-radius: 24px;
                    position: relative;
                    z-index: 10;
                }

                .hero-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, var(--champagne), transparent);
                }

                /* Clock */
                .clock-container {
                    display: flex;
                    align-items: baseline;
                    gap: 4px;
                }

                .clock-time {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 96px;
                    font-weight: 700;
                    letter-spacing: -4px;
                    background: linear-gradient(180deg, #FFFFFF 0%, #888888 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .clock-seconds {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 32px;
                    font-weight: 500;
                    color: var(--text-muted);
                }

                .clock-separator {
                    animation: blink 1s infinite;
                }

                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0.3; }
                }

                .date {
                    font-size: 14px;
                    font-weight: 500;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    color: var(--text-secondary);
                }

                /* Faturamento */
                .faturamento {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    margin-top: 16px;
                }

                .faturamento-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: var(--champagne);
                }

                .faturamento-label svg {
                    width: 16px;
                    height: 16px;
                }

                .faturamento-value {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 72px;
                    font-weight: 700;
                    color: var(--champagne);
                    text-shadow: 0 0 60px var(--champagne-glow);
                    line-height: 1;
                }

                /* KPI Cards Row */
                .kpi-row {
                    display: flex;
                    gap: 16px;
                    margin-top: 8px;
                }

                .kpi-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 20px 40px;
                    background: var(--bg-card);
                    border-radius: 16px;
                    border: 1px solid transparent;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .kpi-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    border-radius: 16px 16px 0 0;
                }

                .kpi-card:hover {
                    transform: translateY(-4px);
                    border-color: var(--glass-border);
                }

                .kpi-card.cyan::before {
                    background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
                }

                .kpi-card.cyan:hover {
                    box-shadow: 0 20px 40px rgba(0, 212, 255, 0.15);
                }

                .kpi-card.green::before {
                    background: linear-gradient(90deg, transparent, var(--neon-green), transparent);
                }

                .kpi-card.green:hover {
                    box-shadow: 0 20px 40px rgba(0, 255, 136, 0.15);
                }

                .kpi-card-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    color: var(--text-secondary);
                }

                .kpi-card-label svg {
                    width: 14px;
                    height: 14px;
                }

                .kpi-card.cyan .kpi-card-label {
                    color: var(--neon-cyan);
                }

                .kpi-card.green .kpi-card-label {
                    color: var(--neon-green);
                }

                .kpi-card-value {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 48px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                /* ===== GAUGE SECTION ===== */
                .gauge-section {
                    display: flex;
                    align-items: center;
                    gap: 48px;
                    padding: 40px 60px;
                    background: var(--bg-card);
                    border-radius: 24px;
                    border: 1px solid var(--glass-border);
                    position: relative;
                    z-index: 10;
                }

                /* Side Stats */
                .side-stats {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .stat-item.right {
                    align-items: flex-end;
                }

                .stat-label {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    color: var(--text-muted);
                }

                .stat-value {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 36px;
                    font-weight: 700;
                }

                .stat-value.cyan { color: var(--neon-cyan); }
                .stat-value.green { color: var(--neon-green); }
                .stat-value.yellow { color: var(--neon-yellow); }
                .stat-value.muted { color: var(--text-muted); }

                /* Gauge Container */
                .gauge-container {
                    position: relative;
                    width: 320px;
                    height: 200px;
                }

                .gauge-svg {
                    width: 100%;
                    height: 100%;
                    overflow: visible;
                }

                /* Gauge Arc Background */
                .gauge-bg {
                    fill: none;
                    stroke: var(--bg-elevated);
                    stroke-width: 20;
                    stroke-linecap: round;
                }

                /* Gauge Arc Progress */
                .gauge-progress {
                    fill: none;
                    stroke-width: 20;
                    stroke-linecap: round;
                    stroke-dasharray: 283;
                    stroke-dashoffset: 283;
                    transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Gradient for gauge */
                .gauge-gradient-stop-1 { stop-color: var(--neon-red); }
                .gauge-gradient-stop-2 { stop-color: var(--neon-orange); }
                .gauge-gradient-stop-3 { stop-color: var(--neon-yellow); }
                .gauge-gradient-stop-4 { stop-color: var(--neon-green); }

                /* Gauge Ticks */
                .gauge-tick {
                    stroke: var(--text-muted);
                    stroke-width: 2;
                    opacity: 0.3;
                }

                .gauge-tick-label {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 12px;
                    fill: var(--text-muted);
                }

                /* Gauge Pointer */
                .gauge-pointer-group {
                    transform-origin: 160px 180px;
                    transition: transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .gauge-pointer {
                    fill: var(--text-primary);
                    filter: drop-shadow(0 0 8px rgba(255, 71, 87, 0.8));
                }

                .gauge-pointer-center {
                    fill: var(--neon-red);
                    filter: drop-shadow(0 0 12px var(--neon-red));
                }

                .gauge-pointer-dot {
                    fill: var(--bg-void);
                }

                /* Gauge Center Display */
                .gauge-center {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }

                .gauge-value {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 56px;
                    font-weight: 700;
                    line-height: 1;
                }

                .gauge-value.critical { 
                    color: var(--neon-red);
                    text-shadow: 0 0 30px rgba(255, 71, 87, 0.5);
                }
                .gauge-value.warning { 
                    color: var(--neon-orange);
                    text-shadow: 0 0 30px rgba(255, 159, 67, 0.5);
                }
                .gauge-value.attention { 
                    color: var(--neon-yellow);
                    text-shadow: 0 0 30px rgba(255, 224, 102, 0.5);
                }
                .gauge-value.good { 
                    color: var(--neon-green);
                    text-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
                }

                .gauge-label {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: var(--text-secondary);
                }

                /* Insight Alert */
                .insight-alert {
                    position: absolute;
                    bottom: -50px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: rgba(255, 71, 87, 0.1);
                    border: 1px solid rgba(255, 71, 87, 0.3);
                    border-radius: 100px;
                    white-space: nowrap;
                }

                .insight-alert.warning {
                    background: rgba(255, 224, 102, 0.1);
                    border-color: rgba(255, 224, 102, 0.3);
                }

                .insight-alert.success {
                    background: rgba(0, 255, 136, 0.1);
                    border-color: rgba(0, 255, 136, 0.3);
                }

                .insight-text {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-primary);
                }

                /* Live indicator */
                .live-badge {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: var(--bg-card);
                    border: 1px solid var(--glass-border);
                    border-radius: 100px;
                    z-index: 50;
                }

                .live-dot {
                    width: 8px;
                    height: 8px;
                    background: var(--neon-red);
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { 
                        opacity: 1;
                        box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
                    }
                    50% { 
                        opacity: 0.8;
                        box-shadow: 0 0 0 8px rgba(255, 71, 87, 0);
                    }
                }

                .live-text {
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    color: var(--text-secondary);
                }

                /* Ambient glow effects */
                .ambient-glow {
                    position: fixed;
                    width: 600px;
                    height: 600px;
                    border-radius: 50%;
                    filter: blur(150px);
                    opacity: 0.15;
                    pointer-events: none;
                    z-index: 1;
                }

                .ambient-glow.top {
                    top: -300px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--champagne);
                }

                .ambient-glow.bottom {
                    bottom: -300px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--neon-cyan);
                    opacity: 0.1;
                }
            `}</style>

            {/* Ambient Glows */}
            <div className="ambient-glow top"></div>
            <div className="ambient-glow bottom"></div>

            {/* Live Badge */}
            <div className="live-badge">
                <div className="live-dot"></div>
                <span className="live-text">Ao Vivo</span>
            </div>

            {/* Hero Section */}
            <section className="hero-section">
                {/* Clock */}
                <div className="clock-container">
                    <span className="clock-time">{hours}<span className="clock-separator">:</span>{minutes}</span>
                    <span className="clock-seconds">{seconds}</span>
                </div>
                {/* Capitalize first letter */}
                <div className="date">{dateString.charAt(0).toUpperCase() + dateString.slice(1)}</div>

<<<<<<< Updated upstream
                {/* Faturamento */}
                <div className="faturamento">
                    <div className="faturamento-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v12M9 9h6M9 15h6" />
                        </svg>
                        Faturamento Total
                    </div>
                    {/* Placeholder for now as per design */}
                    <div className="faturamento-value">R$ 0</div>
=======
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
                        <CardTitle className="flex items-center justify-between gap-2 text-lg">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-cyan-400" />
                                Leads & Atividades
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleMetric('added')}
                                    className={`h-7 text-[10px] px-2 border-dashed ${activeMetrics.includes('added') ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'text-muted-foreground border-white/10'}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${activeMetrics.includes('added') ? 'bg-cyan-400' : 'bg-slate-500'}`} />
                                    Leads
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleMetric('contacted')}
                                    className={`h-7 text-[10px] px-2 border-dashed ${activeMetrics.includes('contacted') ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'text-muted-foreground border-white/10'}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${activeMetrics.includes('contacted') ? 'bg-blue-400' : 'bg-slate-500'}`} />
                                    Contatos
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleMetric('scheduled')}
                                    className={`h-7 text-[10px] px-2 border-dashed ${activeMetrics.includes('scheduled') ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'text-muted-foreground border-white/10'}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${activeMetrics.includes('scheduled') ? 'bg-purple-400' : 'bg-slate-500'}`} />
                                    Reuniões
                                </Button>

                                {/* Dynamic Active Metrics */}
                                {activeMetrics
                                    .filter(m => !['added', 'contacted', 'scheduled'].includes(m))
                                    .map(metric => (
                                        <div key={metric} className="flex items-center gap-0.5 animate-in fade-in zoom-in duration-200">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleMetric(metric)}
                                                className="h-7 text-[10px] px-2 pr-1 border-dashed bg-white/5 text-white border-white/20 hover:bg-white/10 flex items-center gap-1.5 rounded-r-none border-r-0"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                {STATUS_LABELS[metric] || metric}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleMetric(metric)}
                                                className="h-7 w-6 p-0 border-dashed bg-white/5 text-white/40 border-white/20 hover:bg-white/10 hover:text-red-400 rounded-l-none"
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))
                                }

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white/5 text-cyan-400">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#1C1C1C] border-white/10 w-48">
                                        <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Monitorar Movimentação
                                        </div>
                                        {Object.entries(STATUS_LABELS).map(([key, label]) => {
                                            const isActive = activeMetrics.includes(key);
                                            return (
                                                <DropdownMenuItem
                                                    key={key}
                                                    onSelect={(e) => {
                                                        e.preventDefault();
                                                        toggleMetric(key);
                                                    }}
                                                    className="text-xs text-white hover:bg-white/10 cursor-pointer flex justify-between py-2"
                                                >
                                                    {label}
                                                    {isActive && <Check className="w-3 h-3 text-cyan-400 ml-2" />}
                                                </DropdownMenuItem>
                                            )
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
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
                                        <linearGradient id="colorContacted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorGeneric" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorGeneric" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#666"
                                        tickFormatter={(date) => new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1C1C1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        labelFormatter={(date) => new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                    />
                                    {activeMetrics.includes('added') && (
                                        <Area
                                            type="monotone"
                                            dataKey="added"
                                            stroke="#22d3ee"
                                            fill="url(#colorAdded)"
                                            strokeWidth={2}
                                            name="Leads Adicionados"
                                        />
                                    )}
                                    {activeMetrics.includes('contacted') && (
                                        <Area
                                            type="monotone"
                                            dataKey="contacted"
                                            stroke="#3b82f6"
                                            fill="url(#colorContacted)"
                                            strokeWidth={2}
                                            name="Contatos Feitos"
                                        />
                                    )}
                                    {activeMetrics.includes('scheduled') && (
                                        <Area
                                            type="monotone"
                                            dataKey="scheduled"
                                            stroke="#a855f7"
                                            fill="url(#colorScheduled)"
                                            strokeWidth={2}
                                            name="Reuniões Realizadas"
                                        />
                                    )}

                                    {/* Dynamic Areas for status movements */}
                                    {activeMetrics
                                        .filter(m => !['added', 'contacted', 'scheduled'].includes(m))
                                        .map(metric => (
                                            <Area
                                                key={metric}
                                                type="monotone"
                                                dataKey={metric}
                                                stroke="#94a3b8"
                                                fill="url(#colorGeneric)"
                                                strokeWidth={2}
                                                name={`Movidos para ${STATUS_LABELS[metric] || metric}`}
                                                connectNulls
                                            />
                                        ))
                                    }
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

                                const USERS_CONFIG = [
                                    { key: 'joao', label: 'João', color: 'bg-cyan-500', text: 'text-cyan-400' },
                                    { key: 'bruno', label: 'Bruno', color: 'bg-purple-500', text: 'text-purple-400' },
                                    { key: 'nitz', label: 'Nitz', color: 'bg-emerald-500', text: 'text-emerald-400' }
                                ];

                                // Create map for O(1) lookup
                                const funnelMap = new Map(funnel.map(f => [f.status, f]));

                                // Calculate max value for bar scaling (across all users and stages)
                                const maxVal = Math.max(
                                    ...funnel.map(f => Math.max(f.joao || 0, f.bruno || 0, f.nitz || 0)),
                                    10
                                );

                                return (
                                    <div className="flex flex-col gap-6">
                                        {/* Legend */}
                                        <div className="flex justify-end items-center gap-4 text-xs px-2">
                                            {USERS_CONFIG.map(user => (
                                                <div key={user.key} className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${user.color}`}></div>
                                                    <span className="text-muted-foreground">{user.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {FUNNEL_STAGES.map((stage) => {
                                            const dataItem = funnelMap.get(stage.id) || { count: 0, joao: 0, bruno: 0, nitz: 0 };

                                            return (
                                                <div key={stage.id} className="space-y-2">
                                                    <div className="flex justify-between items-center text-xs px-1">
                                                        <span className="text-muted-foreground font-medium">{stage.label}</span>
                                                        <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">{dataItem.count} total</span>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-1 p-2 bg-white/5 rounded-lg border border-white/5">
                                                        {USERS_CONFIG.map((user) => {
                                                            const val = dataItem[user.key] || 0;
                                                            const percent = (val / maxVal) * 100;

                                                            return (
                                                                <div key={user.key} className="flex items-center gap-3 h-5">
                                                                    <div className="w-8 text-[10px] text-muted-foreground text-right shrink-0">{user.label}</div>
                                                                    <div className="flex-1 h-full bg-black/20 rounded-sm overflow-hidden flex items-center">
                                                                        <div
                                                                            className={`h-full ${user.color} transition-all duration-700 ease-out opacity-80 hover:opacity-100`}
                                                                            style={{ width: `${percent}%` }}
                                                                        />
                                                                        {val > 0 && (
                                                                            <span className="ml-2 text-[10px] text-white/70 font-mono">{val}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
>>>>>>> Stashed changes
                </div>

                {/* KPI Row */}
                <div className="kpi-row">
                    <div className="kpi-card cyan">
                        <div className="kpi-card-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            Leads Contatados
                        </div>
                        <div className="kpi-card-value">{leadsContacted}</div>
                    </div>

                    <div className="kpi-card green">
                        <div className="kpi-card-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Reuniões Agendadas
                        </div>
                        <div className="kpi-card-value">{meetingsScheduled}</div>
                    </div>
                </div>
            </section>

            {/* Gauge Section */}
            <section className="gauge-section">
                {/* Left Stats */}
                <div className="side-stats">
                    <div className="stat-item">
                        <span className="stat-label">Leads</span>
                        <span className="stat-value cyan">{leadsTotal}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Reuniões</span>
                        <span className="stat-value green">{meetingsScheduled}</span>
                    </div>
                </div>

                {/* Gauge */}
                <div className="gauge-container">
                    <svg className="gauge-svg" viewBox="0 0 320 220">
                        <defs>
                            {/* Gradient for the gauge arc */}
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" className="gauge-gradient-stop-1" />
                                <stop offset="35%" className="gauge-gradient-stop-2" />
                                <stop offset="60%" className="gauge-gradient-stop-3" />
                                <stop offset="100%" className="gauge-gradient-stop-4" />
                            </linearGradient>

                            {/* Glow filter */}
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Background arc */}
                        <path
                            className="gauge-bg"
                            d="M 40 180 A 120 120 0 0 1 280 180"
                        />

                        {/* Progress arc (colored) */}
                        <path
                            className="gauge-progress"
                            d="M 40 180 A 120 120 0 0 1 280 180"
                            stroke="url(#gaugeGradient)"
                            filter="url(#glow)"
                            style={{ strokeDashoffset: offset }}
                        />

                        {/* Tick marks */}
                        <g className="gauge-ticks">
                            {/* 0 */}
                            <line className="gauge-tick" x1="40" y1="180" x2="50" y2="180" />
                            <text className="gauge-tick-label" x="30" y="185">0</text>

                            {/* 20 */}
                            <line className="gauge-tick" x1="63" y1="110" x2="73" y2="116" />
                            <text className="gauge-tick-label" x="45" y="105">20</text>

                            {/* 40 */}
                            <line className="gauge-tick" x1="110" y1="65" x2="115" y2="75" />
                            <text className="gauge-tick-label" x="100" y="55">40</text>

                            {/* 60 */}
                            <line className="gauge-tick" x1="205" y1="65" x2="200" y2="75" />
                            <text className="gauge-tick-label" x="200" y="55">60</text>

                            {/* 80 */}
                            <line className="gauge-tick" x1="257" y1="110" x2="247" y2="116" />
                            <text className="gauge-tick-label" x="265" y="105">80</text>

                            {/* 100 */}
                            <line className="gauge-tick" x1="280" y1="180" x2="270" y2="180" />
                            <text className="gauge-tick-label" x="285" y="185">100</text>
                        </g>

                        {/* Pointer */}
                        <g className="gauge-pointer-group" style={{ transform: `rotate(${rotation}deg)` }}>
                            {/* Pointer needle */}
                            <polygon
                                className="gauge-pointer"
                                points="160,90 155,175 165,175"
                            />
                            {/* Center circle */}
                            <circle className="gauge-pointer-center" cx="160" cy="180" r="16" />
                            <circle className="gauge-pointer-dot" cx="160" cy="180" r="6" />
                        </g>
                    </svg>

                    {/* Center Display */}
                    <div className="gauge-center">
                        <div className={gaugeValueClass}>{Math.round(gaugePercent)}%</div>
                        <div className="gauge-label">Performance</div>
                    </div>
                </div>

                {/* Right Stats */}
                <div className="side-stats">
                    <div className="stat-item right">
                        <span className="stat-label">Vendas</span>
                        <span className="stat-value yellow">{salesWon}</span>
                    </div>
                    <div className="stat-item right">
                        <span className="stat-label">Ativos</span>
                        <span className="stat-value muted">{activeLeads || '—'}</span>
                    </div>
                </div>

                {/* Insight Alert */}
                <div className="insight-alert">
                    <span>⚠️</span>
                    <span className="insight-text">Início do dia — comece a prospectar!</span>
                </div>
            </section>
        </div>
    );
}
