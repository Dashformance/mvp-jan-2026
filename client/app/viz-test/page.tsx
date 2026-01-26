"use client";

import { useState } from "react";
import { DualGauge } from "@/components/super-dash/DualGauge";
import { InsightAlert } from "@/components/super-dash/InsightAlert";
import { FlowChart } from "@/components/super-dash/FlowChart";
import { Sparkline } from "@/components/super-dash/Sparkline";

// Mock Data
const flowchartData = [
    { name: "Seg", leads: 40, sales: 24 },
    { name: "Ter", leads: 30, sales: 13 },
    { name: "Qua", leads: 20, sales: 28 },
    { name: "Qui", leads: 27, sales: 39 },
    { name: "Sex", leads: 18, sales: 48 },
    { name: "Sab", leads: 23, sales: 38 },
    { name: "Dom", leads: 34, sales: 43 },
];

const sparklineData = [
    { value: 10 },
    { value: 15 },
    { value: 8 },
    { value: 20 },
    { value: 18 },
    { value: 25 },
    { value: 22 },
];

export default function TestPage() {
    const [pace, setPace] = useState(78);
    const [quality, setQuality] = useState(92);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-12 space-y-16 selection:bg-blue-500/30">
            {/* Background Gradient Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                            <div className="w-5 h-5 border-2 border-white rounded-md" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-blue-500">System Analytics</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-linear-to-b from-white to-gray-500">
                        SUPERDASH <br />
                        <span className="text-3xl font-medium tracking-normal text-gray-400">Visualization Engine v1.0</span>
                    </h1>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-6 p-6 bg-white/5 border border-white/10 rounded-4xl backdrop-blur-3xl shadow-2xl items-center">
                    <div className="w-48 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Ritmo</label>
                            <span className="text-xs font-numbers font-bold text-blue-400">{pace}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={pace}
                            onChange={(e) => setPace(Number(e.target.value))}
                            className="w-full accent-blue-500 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                        />
                    </div>
                    <div className="w-px h-10 bg-white/10 hidden sm:block" />
                    <div className="w-48 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Qualidade</label>
                            <span className="text-xs font-numbers font-bold text-emerald-400">{quality}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full accent-emerald-500 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                {/* Column 1: Primary Metrics */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Indicadores Críticos</h2>
                        </div>
                        <DualGauge pace={pace} quality={quality} />
                    </div>

                    <InsightAlert pace={pace} quality={quality} />
                </div>

                {/* Column 2: Historical & KPIs */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Análise Temporal</h2>
                        </div>
                        <FlowChart data={flowchartData} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-8 bg-linear-to-br from-white/5 to-transparent border border-white/5 rounded-[2.5rem] backdrop-blur-xl group hover:border-emerald-500/20 transition-colors">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6 group-hover:text-emerald-400 transition-colors">Conversão Total</h3>
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <div className="text-4xl font-numbers font-bold tracking-tighter italic">1.245</div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase">
                                        <TrendingUp size={12} />
                                        <span>+12.4% Estabilidade</span>
                                    </div>
                                </div>
                                <Sparkline data={sparklineData} dataKey="value" color="#10B981" className="w-32 h-16" />
                            </div>
                        </div>

                        <div className="p-8 bg-linear-to-br from-white/5 to-transparent border border-white/5 rounded-[2.5rem] backdrop-blur-xl group hover:border-red-500/20 transition-colors">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6 group-hover:text-red-400 transition-colors">Rejeição Média</h3>
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <div className="text-4xl font-numbers font-bold tracking-tighter italic">8.4%</div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase">
                                        <AlertCircle size={12} />
                                        <span>-2.1% Deterioração</span>
                                    </div>
                                </div>
                                <Sparkline data={sparklineData} dataKey="value" color="#EF4444" className="w-32 h-16" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="max-w-7xl mx-auto pt-16 border-t border-white/5 flex justify-between items-center text-gray-600">
                <p className="text-[10px] font-medium uppercase tracking-widest">Dashformance Engine v1.0.42_STABLE</p>
                <div className="flex gap-6">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-medium uppercase tracking-widest">Sistemas Operacionais</span>
                </div>
            </footer>
        </div>
    );
}

// Additional imports needed for the showcase decorations
import { AlertCircle, TrendingUp } from "lucide-react";
