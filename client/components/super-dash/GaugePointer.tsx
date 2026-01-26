"use client";

import { motion } from "framer-motion";

interface GaugePointerProps {
    rotation: number; // The rotation angle in degrees
    color?: string;
    size?: number;
}

export function GaugePointer({
    rotation,
    color = "#3B82F6", // Default to a nice blue
    size = 100,
}: GaugePointerProps) {
    return (
        <motion.div
            style={{
                width: size,
                height: size,
                position: "absolute",
                top: "50%",
                left: "50%",
                x: "-50%",
                y: "-50%",
                pointerEvents: "none",
                zIndex: 10,
                transformOrigin: "center center",
            }}
            animate={{ rotate: rotation }}
            transition={{ type: "spring", stiffness: 40, damping: 12 }}
        >
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            >
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Center Pivot with glow */}
                <circle cx="50" cy="50" r="8" fill="#0A0A0A" stroke={color} strokeWidth="1.5" />
                <circle cx="50" cy="50" r="4" fill={color} filter="url(#glow)" />

                {/* Pointer Needle - More sophisticated shape */}
                <path
                    d="M49 50 L50 12 L51 50 Q50 52 49 50 Z"
                    fill={color}
                    filter="url(#glow)"
                />

                {/* HUD detail lines */}
                <path
                    d="M50 15 L50 25"
                    stroke={color}
                    strokeWidth="0.5"
                    strokeOpacity="0.5"
                />
            </svg>
        </motion.div>
    );
}
