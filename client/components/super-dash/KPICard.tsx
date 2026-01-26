
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sparkline } from './Sparkline';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend: string;
    trendPositive?: boolean;
    xp?: number;
    subtext?: string;
    variant?: 'default' | 'gold' | 'neon';
    className?: string;
    iconColor?: string;
    progressColor?: string;
    sparklineData?: number[];
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    trendPositive = true,
    xp = 10,
    subtext,
    variant = 'default',
    className,
    iconColor = "text-white",
    progressColor = "bg-accent",
    sparklineData
}) => {
    const isGold = variant === 'gold';

    return (
        <motion.div
            whileHover={{ translateY: -4 }}
            className={cn(
                "rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden",
                isGold
                    ? "bg-gradient-to-br from-[#DECCA8]/10 to-bg-elevated border-[#DECCA8]/30 shadow-[0_0_20px_rgba(222,204,168,0.05)]"
                    : "bg-bg-elevated border-border-subtle hover:bg-bg-hover hover:border-border",
                className
            )}
        >
            {/* Sparkline Background */}
            {sparklineData && (
                <div className="absolute bottom-0 right-0 opacity-20 pointer-events-none">
                    <Sparkline
                        data={sparklineData}
                        color={isGold ? "#DECCA8" : (trendPositive ? "#10B981" : "#EF4444")}
                        className="w-32 h-16"
                    />
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                    "p-2 rounded-lg border",
                    isGold
                        ? "bg-[#DECCA8]/10 border-[#DECCA8]/20 text-[#DECCA8]"
                        : "bg-white/5 border-white/10 " + iconColor
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                    "text-[10px] uppercase tracking-[0.15em] font-bold",
                    isGold ? "text-[#DECCA8]" : "text-text-muted"
                )}>
                    {title}
                </span>
            </div>

            {/* Value */}
            <div className={cn(
                "font-display text-4xl font-bold mb-2",
                isGold ? "text-[#DECCA8] drop-shadow-md" : "text-white"
            )}>
                {value}
            </div>

            {/* XP Bar */}
            <div className="w-full h-1.5 bg-black/40 rounded-full mb-3 overflow-hidden">
                <div
                    className={cn("h-full rounded-full", progressColor)}
                    style={{ width: `${Math.min(xp, 100)}%` }}
                />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted font-medium">{subtext}</span>
                <span className={cn(
                    "flex items-center font-bold",
                    trendPositive ? "text-emerald-400" : "text-red-400"
                )}>
                    {trendPositive ? "↑" : "↓"} {trend}
                </span>
            </div>

            {/* XP Floater (Visual Flair) */}
            <div className={cn(
                "absolute top-4 right-4 text-[10px] font-bold opacity-30 px-2 py-0.5 rounded-full border",
                isGold ? "text-[#DECCA8] border-[#DECCA8]" : "text-white border-white"
            )}>
                +{xp} XP
            </div>
        </motion.div>
    );
};
