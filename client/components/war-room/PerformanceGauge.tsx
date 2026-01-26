'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface PerformanceGaugeProps {
    value: number; // 0-100
    label?: string;
}

export function PerformanceGauge({ value, label = 'Performance' }: PerformanceGaugeProps) {
    // Animated value with spring physics
    const springValue = useSpring(0, { stiffness: 50, damping: 15 });

    useEffect(() => {
        springValue.set(value);
    }, [value, springValue]);

    // Transform spring value to rotation (-135 to +135 degrees)
    const rotation = useTransform(springValue, [0, 100], [-135, 135]);

    // Transform spring value to stroke-dashoffset (283 to 0)
    const strokeDashoffset = useTransform(springValue, [0, 100], [283, 0]);

    // Determine color class based on value
    const getColorClass = (v: number) => {
        if (v < 30) return 'critical';
        if (v < 50) return 'warning';
        if (v < 70) return 'attention';
        return 'good';
    };

    const colorClass = getColorClass(value);

    const colorStyles = {
        critical: { color: '#FF4757', shadow: 'rgba(255, 71, 87, 0.5)' },
        warning: { color: '#FF9F43', shadow: 'rgba(255, 159, 67, 0.5)' },
        attention: { color: '#FFE066', shadow: 'rgba(255, 224, 102, 0.5)' },
        good: { color: '#00FF88', shadow: 'rgba(0, 255, 136, 0.5)' },
    };

    const currentColor = colorStyles[colorClass];

    return (
        <div className="relative w-[320px] h-[200px]">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 320 220">
                <defs>
                    {/* Gradient for the gauge arc */}
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF4757" />
                        <stop offset="35%" stopColor="#FF9F43" />
                        <stop offset="60%" stopColor="#FFE066" />
                        <stop offset="100%" stopColor="#00FF88" />
                    </linearGradient>

                    {/* Glow filter */}
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background arc */}
                <path
                    d="M 40 180 A 120 120 0 0 1 280 180"
                    fill="none"
                    stroke="#1a1a1a"
                    strokeWidth="20"
                    strokeLinecap="round"
                />

                {/* Progress arc (animated) */}
                <motion.path
                    d="M 40 180 A 120 120 0 0 1 280 180"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    style={{ strokeDashoffset }}
                    filter="url(#glow)"
                />

                {/* Tick marks */}
                <g className="text-text-muted" fill="currentColor">
                    {/* 0 */}
                    <line x1="40" y1="180" x2="50" y2="180" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    <text x="28" y="185" fontSize="12" fontFamily="Space Grotesk">0</text>

                    {/* 20 */}
                    <text x="45" y="105" fontSize="12" fontFamily="Space Grotesk">20</text>

                    {/* 40 */}
                    <text x="100" y="55" fontSize="12" fontFamily="Space Grotesk">40</text>

                    {/* 60 */}
                    <text x="200" y="55" fontSize="12" fontFamily="Space Grotesk">60</text>

                    {/* 80 */}
                    <text x="265" y="105" fontSize="12" fontFamily="Space Grotesk">80</text>

                    {/* 100 */}
                    <line x1="280" y1="180" x2="270" y2="180" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    <text x="283" y="185" fontSize="12" fontFamily="Space Grotesk">100</text>
                </g>

                {/* Pointer (animated rotation) */}
                <motion.g
                    style={{
                        transformOrigin: '160px 180px',
                        rotate: rotation,
                    }}
                >
                    {/* Pointer needle */}
                    <polygon
                        points="160,90 155,175 165,175"
                        fill="white"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(255, 71, 87, 0.8))' }}
                    />
                    {/* Center circle */}
                    <circle
                        cx="160"
                        cy="180"
                        r="16"
                        fill="#FF4757"
                        style={{ filter: 'drop-shadow(0 0 12px #FF4757)' }}
                    />
                    {/* Center dot */}
                    <circle cx="160" cy="180" r="6" fill="#050505" />
                </motion.g>
            </svg>

            {/* Center Display */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <motion.div
                    className="font-display text-[56px] font-bold leading-none"
                    style={{
                        color: currentColor.color,
                        textShadow: `0 0 30px ${currentColor.shadow}`,
                    }}
                >
                    {Math.round(value)}%
                </motion.div>
                <span className="text-[11px] font-semibold tracking-[2px] uppercase text-text-secondary">
                    {label}
                </span>
            </div>
        </div>
    );
}
