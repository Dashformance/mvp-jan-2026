"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";
import { CopyPlus } from "lucide-react";

interface FlowChartProps {
    data: any[];
    className?: string;
}

// Custom Tooltip Component using ContentType from Recharts
interface TooltipPayloadItem {
    color?: string;
    name?: string;
    value?: number;
}

interface GlassTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}

const GlassTooltip = ({ active, payload, label }: GlassTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[160px]">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-3 font-medium">{label}</p>
                <div className="space-y-3">
                    {payload.map((entry: TooltipPayloadItem, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                                    style={{ backgroundColor: entry.color, color: entry.color }}
                                />
                                <span className="text-xs font-medium text-gray-300 uppercase tracking-tight">
                                    {entry.name}
                                </span>
                            </div>
                            <span className="text-sm font-bold text-white font-numbers">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export function FlowChart({ data, className }: FlowChartProps) {
    return (
        <div className={cn("w-full h-[320px] bg-linear-to-b from-gray-900/40 to-black/60 rounded-3xl border border-white/5 p-6 relative group backdrop-blur-xl overflow-hidden shadow-2xl", className)}>
            {/* Header / Actions */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-white text-lg font-bold tracking-tight">Análise de Fluxo</h3>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-[0.15em]">Leads vs Vendas ・ Semanal</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full border border-white/10 transition-all backdrop-blur-md">
                        <CopyPlus size={14} />
                        Comparar
                    </button>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#444"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            className="font-medium uppercase tracking-tighter"
                        />
                        <YAxis
                            stroke="#444"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            className="font-numbers"
                        />
                        <Tooltip
                            content={<GlassTooltip />}
                            cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                            animationDuration={200}
                        />
                        <Area
                            type="monotone"
                            dataKey="leads"
                            name="Leads"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorLeads)"
                            animationDuration={1500}
                        />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            name="Vendas"
                            stroke="#10B981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
