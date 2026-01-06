import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Visualizen DS v3.1 Button Variants
 * - Primary: White bg, Black text (main CTAs)
 * - Secondary: Transparent with border
 * - Ghost: Transparent, muted text
 * - Accent: Champagne gradient (Landing page ONLY)
 * - Destructive: Error color with subtle border
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,255,255,0.24)] active:scale-[0.98]",
  {
    variants: {
      variant: {
        // DS v3.1: Primary = White bg, Black text
        default:
          "bg-white text-[#181818] hover:opacity-90 hover:-translate-y-px shadow-md",
        // DS v3.1: Secondary = Transparent with border
        secondary:
          "bg-transparent text-white border border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.06)]",
        // DS v3.1: Ghost = No border, muted text
        ghost:
          "bg-transparent text-[#8A8A8A] hover:text-white hover:bg-[rgba(255,255,255,0.06)]",
        // DS v3.1: Accent = Champagne gradient (Landing page ONLY)
        accent:
          "bg-gradient-to-br from-[#E8D8B8] to-[#C8AC8C] text-[#1A1814] hover:opacity-90 hover:-translate-y-px shadow-md",
        // DS v3.1: Destructive = Error color
        destructive:
          "bg-transparent text-[#F43F5E] border border-[rgba(244,63,94,0.3)] hover:bg-[rgba(244,63,94,0.12)]",
        // Outline (alias for secondary)
        outline:
          "bg-transparent text-white border border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.06)]",
        link: "text-[#44CCFF] underline-offset-4 hover:underline",
      },
      size: {
        // DS v3.1: Medium = 52px, Small = 40px, Large = 60px
        default: "h-[52px] px-7 py-3.5 min-w-[120px]",
        sm: "h-10 px-5 text-[13px]",
        lg: "h-[60px] px-9 text-[15px]",
        icon: "size-[52px]",
        "icon-sm": "size-10",
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
