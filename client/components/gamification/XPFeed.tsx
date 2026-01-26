"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

/**
 * XPFeed - Feed live de atividades com XP
 * DS v2.0: Dot pulsante LIVE, eventos deslizando
 */

interface XPEvent {
    id: string;
    message: string;
    xp: number;
    timestamp: Date;
    type: 'lead' | 'conversion' | 'task' | 'streak' | 'badge';
}

interface XPFeedProps {
    events: XPEvent[];
    maxEvents?: number;
    className?: string;
}

export function XPFeed({ events, maxEvents = 5, className = "" }: XPFeedProps) {
    const [displayedEvents, setDisplayedEvents] = useState<XPEvent[]>([]);

    useEffect(() => {
        setDisplayedEvents(events.slice(0, maxEvents));
    }, [events, maxEvents]);

    const getEventIcon = (type: XPEvent['type']) => {
        switch (type) {
            case 'lead': return '📞';
            case 'conversion': return '🏆';
            case 'task': return '✅';
            case 'streak': return '🔥';
            case 'badge': return '🎖️';
            default: return '⚡';
        }
    };

    const getEventColor = (type: XPEvent['type']) => {
        switch (type) {
            case 'conversion': return 'text-neon-green-soft';
            case 'streak': return 'text-neon-orange';
            case 'badge': return 'text-accent';
            default: return 'text-neon-cyan-soft';
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins}min`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className={`bg-bg-elevated border border-border-subtle rounded-xl overflow-hidden ${className}`}>
            {/* Header with LIVE indicator */}
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Atividades</h3>
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.7, 1]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-neon-red"
                    />
                    <span className="text-[10px] font-bold text-neon-red uppercase tracking-wider">LIVE</span>
                </div>
            </div>

            {/* Events List */}
            <div className="py-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {displayedEvents.map((event) => (
                        <motion.div
                            key={event.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-4 py-3 bg-bg-surface/30 rounded-lg border border-white/5 mb-2 mx-2 flex items-center gap-3 hover:bg-bg-hover transition-colors"
                        >
                            {/* Icon */}
                            <span className="text-xl p-2 rounded-full bg-white/5">{getEventIcon(event.type)}</span>

                            {/* Message */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-medium truncate">{event.message}</p>
                                <p className="text-[10px] text-text-muted">{formatTime(event.timestamp)}</p>
                            </div>

                            {/* XP Badge */}
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className={`font-display text-sm font-bold ${getEventColor(event.type)}`}
                            >
                                +{event.xp} XP
                            </motion.span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {displayedEvents.length === 0 && (
                    <div className="px-4 py-8 text-center text-text-muted text-sm">
                        Nenhuma atividade recente
                    </div>
                )}
            </div>
        </div>
    );
}
