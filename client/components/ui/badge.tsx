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
        // Design System v2.0: Status Neon
        default:
          "border-neon-green/30 bg-neon-green-bg text-neon-green-soft",
        secondary:
          "border-border-default bg-bg-elevated text-text-secondary",
        destructive:
          "border-neon-red/30 bg-neon-red-bg text-neon-red-soft",
        outline:
          "border-border-strong bg-transparent text-text-muted",
        warning:
          "border-neon-yellow/30 bg-neon-yellow-bg text-neon-yellow-soft",
        info:
          "border-neon-cyan/30 bg-neon-cyan-bg text-neon-cyan-soft",
        // Design System v2.0: RPG Ranks
        bronze:
          "border-rank-bronze/30 bg-rank-bronze-bg text-rank-bronze",
        silver:
          "border-rank-silver/30 bg-rank-silver-bg text-rank-silver",
        gold:
          "border-rank-gold/30 bg-rank-gold-bg text-rank-gold shadow-[0_0_8px_var(--color-rank-gold-bg)]",
        platinum:
          "border-rank-platinum/30 bg-rank-platinum-bg text-rank-platinum shadow-[0_0_8px_var(--color-rank-platinum-bg)]",
        diamond:
          "border-rank-diamond/30 bg-rank-diamond-bg text-rank-diamond shadow-[0_0_8px_var(--color-rank-diamond-bg)]",
        // Design System v2.0: XP Badge
        xp:
          "font-display border-neon-green/30 bg-neon-green-bg text-neon-green px-1.5 py-0",
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
