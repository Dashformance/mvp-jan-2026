import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Superdash Design System - Button Variants
 * - Primary (neon): Green glow, dark text
 * - Glass: Translucent with subtle border
 * - Ghost: Transparent, muted text
 * - Secondary: Dark bg with border
 * - Destructive: Red glow
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent/30 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // War Room: Primary = Champagne
        default:
          "bg-accent text-bg-void font-bold hover:bg-accent-light hover:-translate-y-0.5 shadow-[0_0_20px_rgba(222,204,168,0.2)]",
        primary:
          "bg-accent text-bg-void font-bold hover:bg-accent-light hover:-translate-y-0.5 shadow-[0_0_20px_rgba(222,204,168,0.2)]",
        // War Room: Secondary = Elevated bg
        secondary:
          "bg-bg-elevated text-white border border-border-default hover:bg-bg-hover hover:border-border-strong hover:-translate-y-0.5",
        // War Room: Ghost = Minimalist
        ghost:
          "bg-transparent text-text-secondary hover:text-white hover:bg-white/5",
        // War Room: Destructive = Red Neon
        destructive:
          "bg-neon-red-bg text-neon-red border border-neon-red/30 hover:bg-neon-red/20 hover:shadow-[0_0_15px_rgba(255,71,87,0.4)] hover:-translate-y-0.5",
        // War Room: XP = Green Neon Glow
        xp:
          "bg-neon-green-bg text-neon-green border border-neon-green/30 hover:bg-neon-green/20 hover:shadow-[0_0_15px_rgba(0,255,136,0.4)] hover:-translate-y-0.5",
        // War Room: Glass = Pure Glassmorphism
        glass:
          "glass glass-hover text-white shadow-lg backdrop-blur-md hover:-translate-y-0.5",
        outline:
          "bg-transparent text-white border border-border-strong hover:bg-white/5 hover:border-accent/40",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-12 px-8 text-[15px]",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
