"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    level: number;
    userName: string;
    avatar: string; // Emoji or URL
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
    isOpen,
    onClose,
    level,
    userName,
    avatar
}) => {

    useEffect(() => {
        if (isOpen) {
            // Trigger Confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#DECCA8', '#22C55E', '#FFFFFF']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#DECCA8', '#22C55E', '#FFFFFF']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();

            // Big burst
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 9999
            });
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        className="relative w-full max-w-md bg-gradient-to-b from-bg-elevated to-bg-surface border border-accent/20 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(222,204,168,0.2)]"
                    >
                        {/* Radiant Background Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

                        {/* Animated Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                            className="relative mx-auto w-32 h-32 mb-6"
                        >
                            <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
                            <div className="relative w-full h-full bg-gradient-to-br from-accent to-yellow-600 rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl">
                                <Trophy className="w-16 h-16 text-white drop-shadow-lg" />
                            </div>

                            {/* Floating Stars */}
                            <motion.div
                                animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -top-2 -right-4 text-yellow-400"
                            >
                                <Star className="w-8 h-8 fill-yellow-400 drop-shadow-lg" />
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                                className="absolute -bottom-2 -left-4 text-white"
                            >
                                <Zap className="w-8 h-8 fill-accent drop-shadow-lg" />
                            </motion.div>
                        </motion.div>

                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wide">
                                Level Up!
                            </h2>
                            <p className="text-text-muted mb-6">
                                Parabéns <span className="text-white font-bold">{userName}</span>! Você alcançou um novo patamar de excelência.
                            </p>

                            <div className="flex items-center justify-center gap-4 mb-8">
                                <div className="text-right">
                                    <div className="text-xs text-text-muted uppercase">Nível Anterior</div>
                                    <div className="text-2xl font-bold text-white/50">{level - 1}</div>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div className="text-left">
                                    <div className="text-xs text-accent uppercase font-bold">Novo Nível</div>
                                    <div className="text-5xl font-black text-accent drop-shadow-[0_0_15px_rgba(222,204,168,0.5)]">
                                        {level}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={onClose}
                                className="w-full bg-accent hover:bg-accent/90 text-bg-surface font-bold text-lg h-12 rounded-xl shadow-lg shadow-accent/20 transition-all hover:scale-[1.02]"
                            >
                                Continuar
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
