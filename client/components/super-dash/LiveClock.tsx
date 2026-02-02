
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { DollarSign, Phone, Calendar } from 'lucide-react';

interface LiveClockProps {
    revenue: number;
    contacts: number;
    meetings: number;
    className?: string;
}

export const LiveClock: React.FC<LiveClockProps> = ({ revenue, contacts, meetings, className }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    const dateStr = time.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className={cn(
            "flex items-center gap-6 p-5 rounded-2xl bg-linear-to-r from-bg-elevated/80 to-bg-deep/50 border border-white/5 backdrop-blur-xl",
            className
        )}>
            {/* Clock - Compacto */}
            <div className="flex flex-col items-center shrink-0 pr-6 border-r border-white/10">
                <div className="font-display font-black text-6xl tracking-tighter text-white flex items-baseline gap-1 tabular-nums">
                    <span>{hours}</span>
                    <span className="text-white/30 animate-pulse">:</span>
                    <span>{minutes}</span>
                    <span className="text-2xl text-white/40 ml-1">{seconds}</span>
                </div>
                <div className="text-center text-text-muted uppercase tracking-widest font-medium text-[10px] mt-1">
                    {dateStr}
                </div>
            </div>

            {/* Revenue - Centro */}
            <div className="flex flex-col items-center flex-1">
                <div className="flex items-center gap-2 text-[#DECCA8] mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">Faturamento Total</span>
                </div>
                <div className="font-display text-4xl font-black text-[#DECCA8] tracking-tight">
                    R$ {revenue.toLocaleString('pt-BR')}
                </div>
            </div>

            {/* Stats Pills */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Leads */}
                <div className="flex flex-col items-center px-5 py-2.5 rounded-xl bg-neon-purple/10 border border-neon-purple/20">
                    <div className="flex items-center gap-1.5 text-neon-purple mb-0.5">
                        <Phone className="w-3 h-3" />
                        <span className="text-[9px] uppercase tracking-wider font-bold">Leads</span>
                    </div>
                    <div className="font-display text-2xl font-bold text-white">
                        {contacts}
                    </div>
                </div>

                {/* Reuniões */}
                <div className="flex flex-col items-center px-5 py-2.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
                    <div className="flex items-center gap-1.5 text-neon-cyan mb-0.5">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[9px] uppercase tracking-wider font-bold">Reuniões</span>
                    </div>
                    <div className="font-display text-2xl font-bold text-white">
                        {meetings}
                    </div>
                </div>
            </div>
        </div>
    );
};
