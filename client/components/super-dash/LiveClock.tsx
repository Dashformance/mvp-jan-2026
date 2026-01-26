
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { DollarSign, Phone, Calendar } from 'lucide-react';

interface LiveClockProps {
    revenue: number;
    contacts: number;
    meetings: number;
    className?: string; // Allow custom styling
}

export const LiveClock: React.FC<LiveClockProps> = ({ revenue, contacts, meetings, className }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Format time parts
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');

    // Format date: "Segunda, 25 de Janeiro"
    const dateStr = time.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className={cn("flex flex-col items-center justify-center p-8 rounded-3xl bg-linear-to-b from-bg-elevated/50 to-bg-deep border border-white/5 backdrop-blur-xl shadow-2xl w-full", className)}>

            {/* Clock */}
            <div className="relative mb-6">
                <div className="font-display font-black text-9xl tracking-tighter text-white flex items-baseline gap-2 tabular-nums">
                    <span>{hours}</span>
                    <span className="text-white/20 animate-pulse">:</span>
                    <span>{minutes}</span>
                    <span className="text-4xl text-white/40 ml-2 font-medium">{seconds}</span>
                </div>
                <div className="text-center text-text-muted uppercase tracking-[0.3em] font-medium text-sm mt-[-10px]">
                    {dateStr}
                </div>
            </div>

            {/* Stats Container */}
            <div className="flex flex-col items-center gap-2 w-full animate-in slide-in-from-bottom-4 duration-1000 delay-300">
                {/* Revenue */}
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 text-[#DECCA8] mb-1">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-xs uppercase tracking-wider font-bold">Faturamento Total</span>
                    </div>
                    <div className="font-display text-6xl font-black text-[#DECCA8] tracking-tight drop-shadow-[0_0_30px_rgba(222,204,168,0.3)]">
                        R$ {revenue.toLocaleString('pt-BR')}
                    </div>
                </div>

                {/* Contacts & Meetings */}
                <div className="flex items-center gap-4 mt-6">
                    {/* Leads Contacted - Highlighted */}
                    <div className="flex flex-col items-center px-8 py-3 rounded-2xl bg-neon-purple/10 border border-neon-purple/30 shadow-[0_0_20px_rgba(139,92,246,0.15)] animate-pulse-slow">
                        <div className="flex items-center gap-2 text-neon-purple mb-1">
                            <Phone className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-wider font-bold">Leads Contatados</span>
                        </div>
                        <div className="font-display text-3xl font-bold text-white">
                            {contacts}
                        </div>
                    </div>

                    {/* Scheduled Meetings - Added */}
                    <div className="flex flex-col items-center px-6 py-3 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20">
                        <div className="flex items-center gap-2 text-neon-cyan mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-wider font-bold">Reuniões Agendadas</span>
                        </div>
                        <div className="font-display text-3xl font-bold text-white">
                            {meetings}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
