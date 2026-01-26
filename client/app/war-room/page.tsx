'use client';

import { Phone, Calendar } from 'lucide-react';
import { AmbientGlow } from '@/components/war-room/AmbientGlow';
import { LiveBadge } from '@/components/war-room/LiveBadge';
import { Clock } from '@/components/war-room/Clock';
import { FaturamentoDisplay } from '@/components/war-room/FaturamentoDisplay';
import { KPICard } from '@/components/war-room/KPICard';
import { PerformanceGauge } from '@/components/war-room/PerformanceGauge';
import { SideStats, StatItem } from '@/components/war-room/SideStats';
import { InsightAlert } from '@/components/war-room/InsightAlert';
import { getInsight } from '@/lib/war-room/get-insight';

// Mock data - replace with real data from your store/API later
const mockData = {
    faturamento: 39000,
    leadsContatados: 14,
    reunioesAgendadas: 3,
    leads: 14,
    reunioes: 3,
    vendas: 5,
    ativos: 12,
    performance: 70, // 0-100
};

export default function WarRoomPage() {
    const insight = getInsight(mockData.performance, 'morning');

    return (
        <div className="min-h-screen bg-bg-void text-white flex flex-col items-center justify-center gap-8 p-10 overflow-hidden">
            {/* Background Effects */}
            <AmbientGlow />

            {/* Live Badge */}
            <LiveBadge />

            {/* Hero Section */}
            <section className="relative flex flex-col items-center gap-6 px-16 py-10 rounded-3xl border border-glass-border"
                style={{
                    background: 'linear-gradient(180deg, var(--color-glass-bg) 0%, transparent 100%)',
                }}
            >
                {/* Top accent line */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px"
                    style={{
                        background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
                    }}
                />

                {/* Clock */}
                <Clock />

                {/* Faturamento */}
                <FaturamentoDisplay value={mockData.faturamento} />

                {/* KPI Cards */}
                <div className="flex gap-4 mt-2">
                    <KPICard
                        icon={Phone}
                        label="Leads Contatados"
                        value={mockData.leadsContatados}
                        color="cyan"
                    />
                    <KPICard
                        icon={Calendar}
                        label="Reuniões Agendadas"
                        value={mockData.reunioesAgendadas}
                        color="green"
                    />
                </div>
            </section>

            {/* Gauge Section */}
            <section className="relative flex items-center gap-12 px-16 py-10 bg-bg-card rounded-3xl border border-glass-border">
                {/* Left Stats */}
                <SideStats
                    align="left"
                    stats={[
                        { label: 'Leads', value: mockData.leads, color: 'cyan' },
                        { label: 'Reuniões', value: mockData.reunioes, color: 'green' }
                    ]}
                />

                {/* Gauge */}
                <PerformanceGauge value={mockData.performance} />

                {/* Right Stats */}
                <SideStats
                    align="right"
                    stats={[
                        { label: 'Vendas', value: mockData.vendas, color: 'yellow' },
                        { label: 'Ativos', value: mockData.ativos, color: 'muted' }
                    ]}
                />

                {/* Insight Alert */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                    <InsightAlert type={insight.type} message={insight.message} icon={insight.icon} />
                </div>
            </section>
        </div>
    );
}
