'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    icon: LucideIcon;
    label: string;
    value: number;
    color: 'cyan' | 'green' | 'yellow' | 'red';
}

const colorMap = {
    cyan: {
        text: '#00D4FF',
        border: 'rgba(0, 212, 255, 0.3)',
        glow: 'rgba(0, 212, 255, 0.15)',
        gradient: 'linear-gradient(90deg, transparent, #00D4FF, transparent)',
    },
    green: {
        text: '#00FF88',
        border: 'rgba(0, 255, 136, 0.3)',
        glow: 'rgba(0, 255, 136, 0.15)',
        gradient: 'linear-gradient(90deg, transparent, #00FF88, transparent)',
    },
    yellow: {
        text: '#FFE066',
        border: 'rgba(255, 224, 102, 0.3)',
        glow: 'rgba(255, 224, 102, 0.15)',
        gradient: 'linear-gradient(90deg, transparent, #FFE066, transparent)',
    },
    red: {
        text: '#FF4757',
        border: 'rgba(255, 71, 87, 0.3)',
        glow: 'rgba(255, 71, 87, 0.15)',
        gradient: 'linear-gradient(90deg, transparent, #FF4757, transparent)',
    },
};

export function KPICard({ icon: Icon, label, value, color }: KPICardProps) {
    const colors = colorMap[color];

    return (
        <motion.div
            className="relative flex flex-col items-center gap-2 px-10 py-5 bg-[#111111] rounded-2xl overflow-hidden"
            whileHover={{ y: -4, boxShadow: `0 20px 40px ${colors.glow}` }}
            transition={{ duration: 0.2 }}
        >
            {/* Top border gradient */}
            <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: colors.gradient }}
            />

            {/* Label */}
            <div
                className="flex items-center gap-2 text-[11px] font-semibold tracking-[1.5px] uppercase"
                style={{ color: colors.text }}
            >
                <Icon className="w-[14px] h-[14px]" />
                {label}
            </div>

            {/* Value */}
            <span className="font-display text-5xl font-bold text-white">
                {value}
            </span>
        </motion.div>
    );
}
