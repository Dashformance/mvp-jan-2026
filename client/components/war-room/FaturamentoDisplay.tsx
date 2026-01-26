'use client';

import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';

interface FaturamentoDisplayProps {
    value: number;
}

export function FaturamentoDisplay({ value }: FaturamentoDisplayProps) {
    const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
    }).format(value);

    return (
        <div className="flex flex-col items-center gap-2 mt-4">
            {/* Label */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-[2px] uppercase text-accent">
                <DollarSign className="w-4 h-4" />
                Faturamento Total
            </div>

            {/* Value */}
            <motion.div
                className="font-display text-[72px] font-bold text-accent leading-none"
                style={{
                    textShadow: '0 0 60px rgba(222, 204, 168, 0.3)',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {formatted}
            </motion.div>
        </div>
    );
}
