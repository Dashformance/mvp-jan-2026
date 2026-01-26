'use client';

import { motion } from 'framer-motion';

export function LiveBadge() {
    return (
        <div className="fixed top-6 right-6 flex items-center gap-2 px-4 py-2 bg-bg-card border border-white/8 rounded-full">
            <motion.div
                className="w-2 h-2 bg-[#FF4757] rounded-full"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1],
                    boxShadow: [
                        '0 0 0 0 rgba(255, 71, 87, 0.7)',
                        '0 0 0 8px rgba(255, 71, 87, 0)',
                        '0 0 0 0 rgba(255, 71, 87, 0.7)',
                    ],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            <span className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
                Ao Vivo
            </span>
        </div>
    );
}
