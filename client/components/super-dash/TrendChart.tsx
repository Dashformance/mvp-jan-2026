
"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface TrendChartProps {
    data: any[];
    className?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, className }) => {
    return (
        <div className={cn("bg-bg-elevated border border-border-subtle rounded-2xl p-6", className)}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                        <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Tendência de Vendas</h3>
                        <p className="text-xs text-text-muted">Desempenho nos últimos dias</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-medium text-text-muted transition-colors">
                        Comparar: Semana Anterior
                    </button>
                    <div className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold border border-accent/20">
                        +23% vs semana anterior
                    </div>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 0,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#DECCA8" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#DECCA8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#555"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-[#1C1C1C]/80 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
                                            <p className="text-white text-xs font-bold mb-2">{label}</p>
                                            <div className="flex flex-col gap-1">
                                                {payload.map((entry: any, index: number) => (
                                                    <div key={index} className="flex items-center gap-2 text-xs">
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ backgroundColor: entry.color }}
                                                        />
                                                        <span className="text-text-muted capitalize">{entry.name}:</span>
                                                        <span className="text-white font-mono font-bold">
                                                            {entry.name === 'sales' ? 'R$ ' : ''}{entry.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="meetings"
                            stroke="#06b6d4"
                            fillOpacity={1}
                            fill="url(#colorMeetings)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="#DECCA8"
                            fillOpacity={1}
                            fill="url(#colorSales)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
