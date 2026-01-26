"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { Zap, Star, Crown } from "lucide-react";

/**
 * LevelUpCelebration - Overlay fullscreen épico
 * DS v2.0: Partículas, glow intenso, confetti, auto-dismiss
 */

interface LevelUpCelebrationProps {
    show: boolean;
    newLevel: number;
    title: string;
    onComplete?: () => void;
}

export function LevelUpCelebration({ show, newLevel, title, onComplete }: LevelUpCelebrationProps) {
    const fireConfetti = useCallback(() => {
        // Left cannon
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.1, y: 0.6 },
            colors: ['#DECCA8', '#00FF88', '#FFE066', '#00D4FF']
        });

        // Right cannon
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.9, y: 0.6 },
            colors: ['#DECCA8', '#00FF88', '#FFE066', '#00D4FF']
        });

        // Center burst
        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 120,
                origin: { x: 0.5, y: 0.5 },
                colors: ['#DECCA8', '#00FF88', '#FFE066']
            });
        }, 200);
    }, []);

    useEffect(() => {
        if (show) {
            fireConfetti();
            const timer = setTimeout(() => {
                onComplete?.();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [show, fireConfetti, onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[400] flex items-center justify-center bg-black/90 backdrop-blur-lg"
                    onClick={onComplete}
                >
                    {/* Glow rings */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 2], opacity: [0, 0.3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute w-[400px] h-[400px] rounded-full border-2 border-accent/50"
                    />
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.2, 1.8], opacity: [0, 0.2, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                        className="absolute w-[500px] h-[500px] rounded-full border border-neon-green/30"
                    />

                    {/* Main content */}
                    <div className="relative flex flex-col items-center text-center px-8">
                        {/* Crown icon */}
                        <motion.div
                            initial={{ y: -50, opacity: 0, scale: 0 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            <Crown className="w-16 h-16 text-accent mb-4" />
                        </motion.div>

                        {/* LEVEL UP text */}
                        <motion.h1
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
                            className="font-display text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent via-neon-green to-accent tracking-tight"
                            style={{
                                textShadow: '0 0 60px rgba(222,204,168,0.8), 0 0 100px rgba(0,255,136,0.5)'
                            }}
                        >
                            LEVEL UP!
                        </motion.h1>

                        {/* Level number */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 flex items-center gap-4"
                        >
                            <div className="w-px h-12 bg-gradient-to-b from-transparent via-accent to-transparent" />
                            <div>
                                <motion.span
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: [0.5, 1.2, 1] }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className="font-display text-8xl font-black text-white"
                                    style={{
                                        textShadow: '0 0 40px rgba(255,255,255,0.4)'
                                    }}
                                >
                                    {newLevel}
                                </motion.span>
                            </div>
                            <div className="w-px h-12 bg-gradient-to-b from-transparent via-accent to-transparent" />
                        </motion.div>

                        {/* Title */}
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="mt-4 text-2xl font-semibold text-accent"
                        >
                            {title}
                        </motion.p>

                        {/* Dismiss hint */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 }}
                            className="mt-8 text-sm text-text-muted"
                        >
                            Clique para continuar
                        </motion.p>
                    </div>

                    {/* Floating particles */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: window.innerHeight + 20,
                                opacity: 0
                            }}
                            animate={{
                                y: -20,
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                delay: Math.random() * 2,
                                repeat: Infinity
                            }}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                background: ['#DECCA8', '#00FF88', '#FFE066', '#00D4FF'][i % 4],
                                boxShadow: `0 0 10px ${['#DECCA8', '#00FF88', '#FFE066', '#00D4FF'][i % 4]}`
                            }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
