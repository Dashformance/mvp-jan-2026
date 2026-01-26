'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // Only access window/document on client
        setTime(new Date());

        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');

    const dateStr = time.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Time */}
            <div className="flex items-baseline gap-1">
                <span
                    className="font-display text-[96px] font-bold tracking-[-4px]"
                    style={{
                        background: 'linear-gradient(180deg, #FFFFFF 0%, #888888 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {hours}
                    <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        :
                    </motion.span>
                    {minutes}
                </span>
                <span className="font-display text-[32px] font-medium text-text-muted">
                    {seconds}
                </span>
            </div>

            {/* Date */}
            <span className="text-sm font-medium tracking-[3px] uppercase text-text-secondary">
                {dateStr}
            </span>
        </div>
    );
}
