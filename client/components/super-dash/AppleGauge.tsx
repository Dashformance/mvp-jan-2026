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
    const size = 140; // Reduzido de 200
    const strokeWidth = 10;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const arcLength = circumference * 0.75;
    const progress = (score / 100) * arcLength;

    const startAngle = 135;
    const endAngle = 405;

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
            "relative rounded-3xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/[0.04] shadow-2xl",
            "backdrop-blur-xl overflow-hidden h-full flex flex-row items-center justify-between p-6", // Flex Row layout
            className
        )}>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            {/* Left: Gauge SVG */}
            <div className="flex flex-col items-center justify-center relative shrink-0">
                <div style={{ width: size, height: size }} className="relative">
                    <svg width={size} height={size}>
                        <path
                            d={describeArc(center, center, radius, startAngle, endAngle)}
                            fill="none"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                        />
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
                            style={{ filter: `drop-shadow(0 0 8px ${colorData.from}40)` }}
                        />
                    </svg>

                    {/* Score Center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white tracking-tighter font-mono">
                            {score}
                        </span>
                        <span className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-medium mt-0.5">
                            Score
                        </span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={cn(
                    "mt-2 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide border backdrop-blur-sm",
                    score >= 80 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        score >= 60 ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                            score >= 40 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                    {colorData.label}
                </div>
            </div>

            {/* Right: Progress Bars */}
            <div className="flex-1 pl-6 space-y-3">
                {/* Pace Bar */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-cyan-400" />
                            <span className="text-[9px] uppercase tracking-wider text-white/50 font-medium">Ritmo</span>
                        </div>
                        <span className="text-xs font-mono text-white/70">{pace}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-1000"
                            style={{ width: `${pace}%` }}
                        />
                    </div>
                </div>

                {/* Quality Bar */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3 text-purple-400" />
                            <span className="text-[9px] uppercase tracking-wider text-white/50 font-medium">Qualidade</span>
                        </div>
                        <span className="text-xs font-mono text-white/70">{quality}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000"
                            style={{ width: `${quality}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
