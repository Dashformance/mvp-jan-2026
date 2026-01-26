import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: "default" | "neon" | "danger";
    hoverEffect?: boolean;
}

export function GlassCard({
    children,
    className,
    variant = "default",
    hoverEffect = true,
    ...props
}: GlassCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300",
                // Base styles (Dark Void theme)
                "bg-zinc-900/40 border-white/5",

                // Variants
                variant === "default" && "shadow-lg shadow-black/20",
                variant === "neon" && "border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]",
                variant === "danger" && "border-rose-500/20 shadow-[0_0_15px_-3px_rgba(244,63,94,0.1)]",

                // Hover Effects
                hoverEffect && "hover:border-white/10 hover:bg-zinc-900/60 hover:-translate-y-1 hover:shadow-xl",

                className
            )}
            {...props}
        >
            {/* Inner Glow Gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {children}
        </div>
    );
}

export function GlassHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("border-b border-white/5 px-6 py-4", className)}>
            {children}
        </div>
    );
}

export function GlassContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("p-6", className)}>
            {children}
        </div>
    );
}
