import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Superdash Design System - Input
 * - Background: Translucent dark with blur
 * - Border: Subtle white
 * - Focus: Neon green ring
 * - Radius: rounded-xl
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-11 w-full rounded-xl border border-white/8 bg-bg-card px-4 py-2 text-base ring-offset-bg-base placeholder:text-text-muted focus-visible:outline-none focus-visible:border-accent/50 focus-visible:ring-2 focus-visible:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300 shadow-inner shadow-black/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
