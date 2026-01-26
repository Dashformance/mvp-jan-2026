"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import { GaugePointer } from "./GaugePointer";
import { cn } from "@/lib/utils";

// Dynamically import Chart to avoid SSR issues with ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DualGaugeProps {
    pace: number; // e.g., 0-100
    quality: number; // e.g., 0-100
    stats?: {
        leads: number;
        meetings: number;
        sales: number;
    };
    className?: string;
}

export function DualGauge({ pace, quality, stats, className }: DualGaugeProps) {
    // Determine color based on score
    const getColor = (value: number) => {
        if (value >= 80) return "#10B981"; // Excellent (Green)
        if (value >= 60) return "#3B82F6"; // Good (Blue)
        if (value >= 40) return "#F59E0B"; // Warning (Amber)
        return "#EF4444"; // Critical (Red)
    };

    const chartOptions: ApexOptions = {
        chart: {
            type: "radialBar",
            animations: {
                enabled: true,
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150,
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350,
                },
            },
            fontFamily: "var(--font-numbers), var(--font-sans)",
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                hollow: {
                    margin: 20,
                    size: "45%",
                    background: "transparent",
                },
                track: {
                    background: "rgba(255,255,255,0.05)",
                    strokeWidth: "100%",
                    margin: 12,
                },
                dataLabels: {
                    show: true,
                    name: {
                        offsetY: 20,
                        show: true,
                        color: "#555",
                        fontSize: "10px",
                        fontWeight: 600,
                    },
                    value: {
                        offsetY: -15,
                        color: "#FFF",
                        fontSize: "28px",
                        show: true,
                        fontWeight: 700,
                    },
                    total: {
                        show: true,
                        label: "QUALIDADE",
                        color: "#555",
                        fontSize: "10px",
                        fontWeight: 600,
                        formatter: function () {
                            return quality.toString() + "%";
                        },
                    },
                },
            },
        },
        stroke: {
            lineCap: "round",
            width: 8,
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "dark",
                type: "horizontal",
                shadeIntensity: 0.5,
                gradientToColors: [getColor(pace), getColor(quality)],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100],
            },
        },
        series: [pace, quality],
        labels: ["RITMO", "QUALIDADE"],
        colors: [getColor(pace), getColor(quality)],
        legend: {
            show: true,
            position: "bottom",
            horizontalAlign: "center",
            fontSize: "10px",
            fontFamily: "var(--font-sans)",
            labels: {
                colors: "#888",
            },
            markers: {
                offsetX: -4,
            },
            itemMargin: {
                horizontal: 15,
                vertical: 5,
            },
            formatter: function (seriesName, opts) {
                return (seriesName + ": " + opts.w.globals.series[opts.seriesIndex] + "%").toUpperCase();
            },
        },
    };

    // Calculate pointer rotation based on Pace (outer ring approximation)
    // -135deg is 0%, 135deg is 100% => Range is 270 degrees
    const paceRotation = -135 + (Math.min(100, Math.max(0, pace)) / 100) * 270;

    return (
        <div className={cn("relative flex items-center justify-center rounded-3xl bg-linear-to-b from-gray-900/40 to-black/60 p-6 border border-white/5 backdrop-blur-xl shadow-2xl overflow-hidden group", className)}>
            {/* Background HUD Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 400 400">
                    <circle cx="200" cy="200" r="180" stroke="#FFF" strokeWidth="0.5" strokeDasharray="4 8" />
                    <circle cx="200" cy="200" r="140" stroke="#FFF" strokeWidth="0.5" strokeOpacity="0.3" />
                    <path d="M200 20 L200 40 M200 360 L200 380 M20 200 L40 200 M360 200 L380 200" stroke="#FFF" strokeWidth="1" />
                </svg>
            </div>

            <div className="relative w-full h-[380px] flex items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-full">
                    <Chart
                        options={chartOptions}
                        series={[pace, quality]}
                        type="radialBar"
                        height="100%"
                        width="100%"
                    />
                </div>

                {/* Overlaying Pointer */}
                <div className="z-20 pointer-events-none">
                    <GaugePointer rotation={paceRotation} size={220} color={getColor(pace)} />
                </div>

                {/* Left/Right Stats Overlay */}
                {stats && (
                    <>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 text-left pointer-events-none">
                            <div>
                                <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-0.5">Leads</span>
                                <span className="font-display text-2xl font-bold text-white">{stats.leads}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-0.5">Reuniões</span>
                                <span className="font-display text-2xl font-bold text-white">{stats.meetings}</span>
                            </div>
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 text-right pointer-events-none">
                            <div>
                                <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-0.5">Vendas</span>
                                <span className="font-display text-2xl font-bold text-white">{stats.sales}</span>
                            </div>
                            {/* Placeholder for future stat or just balancing layout */}
                            <div>
                                <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-0.5">Ativos</span>
                                <span className="font-display text-lg font-bold text-text-muted">-</span>
                            </div>
                        </div>
                    </>
                )}

                {/* Score badge at the bottom */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium mb-1">Status Global</span>
                    <div className={cn(
                        "px-4 py-1 rounded-full text-xs font-bold border backdrop-blur-md",
                        pace >= 80 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            pace >= 60 ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                pace >= 40 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                    "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                        {pace >= 80 ? "EXCELENTE" : pace >= 60 ? "ÓTIMO" : pace >= 40 ? "ALERTA" : "CRÍTICO"}
                    </div>
                </div>
            </div>
        </div>
    );
}
