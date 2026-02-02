"use client";

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Activity, Plus, Phone, MessageSquare, Calendar } from 'lucide-react';

interface ActionTrendChartProps {
    data: any[];
    period?: string;
    className?: string;
}

export const ActionTrendChart: React.FC<ActionTrendChartProps> = ({ data, period = 'today', className }) => {
    const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

    const toggleLine = (id: string) => {
        const newHidden = new Set(hiddenLines);
        if (newHidden.has(id)) {
            newHidden.delete(id);
        } else {
            newHidden.add(id);
        }
        setHiddenLines(newHidden);
    };

    console.log('ActionTrendChart Data:', data);

    // Validate if there is any data to show
    const hasData = data && data.length > 0 && data.some(d => d.added > 0 || d.contacts > 0 || d.messages > 0 || d.meetings > 0);

    const filters = [
        { id: 'added', label: 'Leads', color: '#DECCA8', icon: Plus },
        { id: 'contacts', label: 'Contatos', color: '#06b6d4', icon: Phone },
        { id: 'messages', label: 'Mensagens', color: '#8B5CF6', icon: MessageSquare },
        { id: 'meetings', label: 'Reuniões', color: '#22C55E', icon: Calendar },
    ];

    if (!data || data.length === 0) {
        return (
            <div className={cn("bg-bg-elevated/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl flex items-center justify-center h-[200px]", className)}>
                <p className="text-text-muted text-sm">Carregando dados...</p>
            </div>
        )
    }

    const periodText = period === 'today' ? 'Ações em tempo real • 24h' :
        period === '7d' ? 'Ações nos últimos 7 dias' :
            period === '15d' ? 'Ações nos últimos 15 dias' :
                period === 'total' ? 'Ações totais (Sazonal)' :
                    'Ações no período selecionado';

    const formatXAxis = (tickItem: string) => {
        if (period === 'today') return tickItem;
        // If it's a date YYYY-MM-DD, format to DD/MM
        if (tickItem.includes('-')) {
            const [y, m, d] = tickItem.split('-');
            return `${d}/${m}`;
        }
        return tickItem;
    };

    return (

        <div className={cn("bg-bg-elevated/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 shadow-2xl overflow-hidden h-full flex flex-col", className)}>
            <div className="flex items-center justify-between gap-4 mb-2 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm tracking-tight">Fluxo de Atividade</h3>
                        <p className="text-[9px] text-text-muted uppercase tracking-widest font-medium opacity-60">AÇÕES NO PERÍODO</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    {filters.map((f) => {
                        const isHidden = hiddenLines.has(f.id);
                        return (
                            <button
                                key={f.id}
                                onClick={() => toggleLine(f.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-2 py-1 rounded-full border text-[9px] font-bold transition-all duration-300 cursor-pointer",
                                    isHidden
                                        ? "bg-transparent border-white/5 text-text-muted opacity-40 hover:opacity-60"
                                        : "bg-white/5 border-white/10 text-white shadow-lg"
                                )}
                            >
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isHidden ? '#555' : f.color }} />
                                <span>{f.label.toUpperCase()}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                        <defs>
                            {filters.map(f => (
                                <linearGradient key={`grad-${f.id}`} id={`grad-${f.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={f.color} stopOpacity={0.15} />
                                    <stop offset="95%" stopColor={f.color} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="10 10" stroke="rgba(255,255,255,0.02)" vertical={false} />
                        <XAxis
                            dataKey="label"
                            stroke="#444"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            tickFormatter={formatXAxis}
                            interval={data.length > 20 ? 'preserveStartEnd' : 0}
                            minTickGap={15}
                        />
                        <YAxis
                            stroke="#444"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 'auto']}
                            allowDataOverflow={false}
                        />
                        <Tooltip
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-bg-deep/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl min-w-[160px]">
                                            <p className="text-white text-[10px] font-bold mb-3 border-b border-white/5 pb-2 uppercase tracking-widest">{formatXAxis(String(label || ''))}</p>
                                            <div className="flex flex-col gap-2.5">
                                                {payload.map((entry: any, index: number) => {
                                                    const filter = filters.find(f => f.id === entry.dataKey);
                                                    return (
                                                        <div key={index} className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                                <span className="text-text-muted text-[10px]">{filter?.label}:</span>
                                                            </div>
                                                            <span className="text-white font-mono font-bold text-[11px]">{entry.value}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        {filters.map((f) => (
                            !hiddenLines.has(f.id) && (
                                <Area
                                    key={f.id}
                                    type="monotone"
                                    dataKey={f.id}
                                    stroke={f.color}
                                    strokeWidth={2}
                                    fill={`url(#grad-${f.id})`}
                                    activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
                                    animationDuration={1500}
                                />
                            )
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};
