"use client";

import { cn } from "@/lib/utils";
import { Activity, TrendingUp, Users, Zap } from "lucide-react";

interface AppleGaugeProps {
    pace: number; // 0-100
    quality: number; // 0-100
    stats?: {
        leads: number;
        meetings: number;
        sales: number;
    };
    className?: string;
}

export function AppleGauge({ pace, quality, stats, className }: AppleGaugeProps) {
    // Combined score for the main gauge
    const score = Math.round((pace + quality) / 2);

    // Determine color and status based on score
    const getColorGradient = (value: number) => {
        if (value >= 80) return { from: "#10B981", to: "#34D399", label: "EXCELENTE", ring: "ring-emerald-500/30" };
        if (value >= 60) return { from: "#3B82F6", to: "#60A5FA", label: "ÓTIMO", ring: "ring-blue-500/30" };
        if (value >= 40) return { from: "#F59E0B", to: "#FBBF24", label: "ATENÇÃO", ring: "ring-amber-500/30" };
        return { from: "#EF4444", to: "#F87171", label: "CRÍTICO", ring: "ring-red-500/30" };
    };

    const colorData = getColorGradient(score);

    // SVG arc calculation for the gauge
    const size = 200;
    const strokeWidth = 12;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const arcLength = circumference * 0.75; // 270 degrees
    const progress = (score / 100) * arcLength;

    // Calculate the arc path
    const startAngle = 135; // Start from bottom-left
    const endAngle = 405; // End at bottom-right (270 degrees span)

    const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
        const radians = ((angle - 90) * Math.PI) / 180;
        return {
            x: cx + r * Math.cos(radians),
            y: cy + r * Math.sin(radians),
        };
    };

    const describeArc = (cx: number, cy: number, r: number, startA: number, endA: number) => {
        const start = polarToCartesian(cx, cy, r, endA);
        const end = polarToCartesian(cx, cy, r, startA);
        const largeArcFlag = endA - startA <= 180 ? "0" : "1";
        return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
    };

    const progressAngle = startAngle + (score / 100) * (endAngle - startAngle);

    return (
        <div className={cn(
            "relative rounded-3xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] p-8 border border-white/[0.04] shadow-2xl",
            "backdrop-blur-xl overflow-hidden",
            className
        )}>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            {/* Main Gauge Container */}
            <div className="flex flex-col items-center justify-center">
                {/* Gauge SVG */}
                <div className="relative" style={{ width: size, height: size }}>
                    <svg width={size} height={size} className="transform -rotate-[0deg]">
                        {/* Background track */}
                        <path
                            d={describeArc(center, center, radius, startAngle, endAngle)}
                            fill="none"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                        />

                        {/* Progress arc with gradient */}
                        <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={colorData.from} />
                                <stop offset="100%" stopColor={colorData.to} />
                            </linearGradient>
                        </defs>

                        <path
                            d={describeArc(center, center, radius, startAngle, progressAngle)}
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                            style={{
                                filter: `drop-shadow(0 0 8px ${colorData.from}40)`,
                            }}
                        />

                        {/* Tick marks */}
                        {[0, 25, 50, 75, 100].map((tick) => {
                            const tickAngle = startAngle + (tick / 100) * (endAngle - startAngle);
                            const innerPoint = polarToCartesian(center, center, radius - strokeWidth - 4, tickAngle);
                            const outerPoint = polarToCartesian(center, center, radius - strokeWidth - 10, tickAngle);
                            return (
                                <line
                                    key={tick}
                                    x1={innerPoint.x}
                                    y1={innerPoint.y}
                                    x2={outerPoint.x}
                                    y2={outerPoint.y}
                                    stroke="rgba(255,255,255,0.15)"
                                    strokeWidth={1.5}
                                    strokeLinecap="round"
                                />
                            );
                        })}
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-bold text-white tracking-tighter font-mono">
                            {score}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium mt-1">
                            Score Global
                        </span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={cn(
                    "mt-4 px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide",
                    "bg-gradient-to-r border backdrop-blur-sm transition-all",
                    score >= 80 && "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
                    score >= 60 && score < 80 && "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400",
                    score >= 40 && score < 60 && "from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400",
                    score < 40 && "from-red-500/10 to-red-600/5 border-red-500/20 text-red-400",
                )}>
                    {colorData.label}
                </div>

                {/* Dual Progress Bars */}
                <div className="w-full mt-8 space-y-4">
                    {/* Pace Bar */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-24">
                            <Zap className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">Ritmo</span>
                        </div>
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-1000"
                                style={{ width: `${pace}%` }}
                            />
                        </div>
                        <span className="text-sm font-mono text-white/70 w-10 text-right">{pace}%</span>
                    </div>

                    {/* Quality Bar */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-24">
                            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">Qualidade</span>
                        </div>
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000"
                                style={{ width: `${quality}%` }}
                            />
                        </div>
                        <span className="text-sm font-mono text-white/70 w-10 text-right">{quality}%</span>
                    </div>
                </div>

                {/* Stats Row */}
                {stats && (
                    <div className="w-full mt-8 grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                            <span className="text-2xl font-bold text-white font-mono">{stats.leads}</span>
                            <span className="text-[9px] uppercase tracking-wider text-white/40 mt-1">Leads</span>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                            <span className="text-2xl font-bold text-white font-mono">{stats.meetings}</span>
                            <span className="text-[9px] uppercase tracking-wider text-white/40 mt-1">Reuniões</span>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                            <span className="text-2xl font-bold text-white font-mono">{stats.sales}</span>
                            <span className="text-[9px] uppercase tracking-wider text-white/40 mt-1">Vendas</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
