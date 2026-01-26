"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

/**
 * XPToast - Notificação de XP ganho
 * DS v2.0: Slide in/out com glow verde
 */

interface XPToastProps {
    show: boolean;
    xp: number;
    message?: string;
    onComplete?: () => void;
}

export function XPToast({ show, xp, message, onComplete }: XPToastProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ x: 100, opacity: 0, scale: 0.8 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 100, opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onAnimationComplete={() => {
                        setTimeout(() => onComplete?.(), 2000);
                    }}
                    className="fixed top-20 right-6 z-[350] flex items-center gap-3 px-4 py-3 rounded-xl bg-neon-green-bg border border-neon-green/30 shadow-[0_0_30px_rgba(0,255,136,0.3)]"
                >
                    {/* Icon */}
                    <motion.div
                        animate={{
                            rotate: [0, -10, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center"
                    >
                        <Zap className="w-5 h-5 text-neon-green" />
                    </motion.div>

                    {/* Content */}
                    <div>
                        <motion.span
                            initial={{ scale: 0.5 }}
                            animate={{ scale: [0.5, 1.2, 1] }}
                            transition={{ delay: 0.1 }}
                            className="font-display text-2xl font-black text-neon-green"
                        >
                            +{xp} XP
                        </motion.span>
                        {message && (
                            <p className="text-xs text-neon-green-soft mt-0.5">{message}</p>
                        )}
                    </div>

                    {/* Progress bar that depletes */}
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 2.5, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-0.5 bg-neon-green rounded-b-xl"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
