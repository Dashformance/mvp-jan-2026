import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Superdash Design System - Badge
 * - Default: Neon green
 * - Secondary: Dark glass
 * - Destructive: Red glow
 * - Outline: Subtle border
 * - Gold/Silver/Bronze: Gamification tiers
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        // War Room: Status Neon
        default:
          "border-neon-green/30 bg-neon-green-bg text-neon-green font-semibold shadow-[0_0_10px_rgba(0,255,136,0.1)]",
        secondary:
          "border-white/[0.08] bg-white/[0.03] text-text-secondary hover:text-white",
        destructive:
          "border-neon-red/30 bg-neon-red-bg text-neon-red font-semibold shadow-[0_0_10px_rgba(255,71,87,0.1)]",
        outline:
          "border-white/[0.15] bg-transparent text-text-muted",
        warning:
          "border-neon-yellow/30 bg-neon-yellow-bg text-neon-yellow font-semibold shadow-[0_0_10px_rgba(255,224,102,0.1)]",
        info:
          "border-neon-cyan/30 bg-neon-cyan-bg text-neon-cyan font-semibold shadow-[0_0_10px_rgba(0,212,255,0.1)]",
        // War Room: RPG Ranks
        bronze:
          "border-rank-bronze/30 bg-rank-bronze-bg text-rank-bronze brightness-110",
        silver:
          "border-rank-silver/30 bg-rank-silver-bg text-rank-silver brightness-110",
        gold:
          "border-rank-gold/30 bg-rank-gold-bg text-rank-gold shadow-[0_0_12px_rgba(255,215,0,0.2)] brightness-125",
        platinum:
          "border-rank-platinum/30 bg-rank-platinum-bg text-rank-platinum shadow-[0_0_12px_rgba(229,228,226,0.2)] brightness-125",
        diamond:
          "border-rank-diamond/30 bg-rank-diamond-bg text-rank-diamond shadow-[0_0_12px_rgba(185,242,255,0.2)] brightness-125",
        // War Room: XP Badge
        xp:
          "font-display border-neon-green/40 bg-neon-green/20 text-neon-green px-1.5 py-0 shadow-[0_0_8px_rgba(0,255,136,0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
