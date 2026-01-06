import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Visualizen DS v3.1 Input
 * - Background: bg-elevated (#222222)
 * - Border: border-default (rgba 10%)
 * - Focus: border-focus (rgba 24%) + bg-muted
 * - Radius: Pill (9999px)
 * - Height: 52px
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "w-full min-w-0 h-[52px] px-[18px] py-3.5",
        "bg-[#222222] text-white placeholder:text-[#6B6B6B]",
        "border border-[rgba(255,255,255,0.10)] rounded-full",
        "text-sm font-normal",
        "transition-all duration-150 ease-out outline-none",
        // Hover
        "hover:border-[rgba(255,255,255,0.16)]",
        // Focus
        "focus:bg-[#141414] focus:border-[rgba(255,255,255,0.24)]",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
        // File input
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
