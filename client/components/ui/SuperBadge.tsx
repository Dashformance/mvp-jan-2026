import { cn } from "@/lib/utils";
import { Trophy, Medal, Crown, Star } from "lucide-react";

type BadgeTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

interface SuperBadgeProps {
    tier?: BadgeTier;
    label: string;
    icon?: React.ReactNode;
    className?: string;
    size?: "sm" | "md" | "lg";
}

const TIER_STYLES: Record<BadgeTier, string> = {
    bronze: "bg-gradient-to-br from-orange-900/80 to-orange-700/80 border-orange-500/30 text-orange-100",
    silver: "bg-gradient-to-br from-slate-600/80 to-slate-400/80 border-slate-300/30 text-slate-100",
    gold: "bg-gradient-to-br from-yellow-700/80 to-yellow-500/80 border-yellow-400/40 text-yellow-50 shadow-[0_0_15px_rgba(234,179,8,0.3)]",
    platinum: "bg-gradient-to-br from-cyan-900/80 to-cyan-500/80 border-cyan-400/40 text-cyan-50 shadow-[0_0_15px_rgba(34,211,238,0.3)]",
    diamond: "bg-gradient-to-br from-purple-900/80 to-fuchsia-600/80 border-fuchsia-400/50 text-fuchsia-50 shadow-[0_0_20px_rgba(192,38,211,0.5)] animate-pulse-slow",
};

const TIER_ICONS: Record<BadgeTier, React.ReactNode> = {
    bronze: <Medal className="w-3 h-3" />,
    silver: <Medal className="w-3 h-3" />,
    gold: <Trophy className="w-3 h-3" />,
    platinum: <Star className="w-3 h-3" />,
    diamond: <Crown className="w-3 h-3" />,
};

export function SuperBadge({
    tier = "bronze",
    label,
    icon,
    size = "md",
    className
}: SuperBadgeProps) {
    const Icon = icon || TIER_ICONS[tier];

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md font-medium tracking-wide shadow-sm transition-all hover:scale-105",
                TIER_STYLES[tier],

                // Sizes
                size === "sm" && "px-2 py-0.5 text-[10px]",
                size === "md" && "px-3 py-1 text-xs",
                size === "lg" && "px-4 py-1.5 text-sm",

                className
            )}
        >
            {Icon}
            <span>{label}</span>
        </div>
    );
}
