import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Superdash Design System - Textarea
 * - Background: Translucent dark with blur
 * - Border: Subtle white
 * - Focus: Neon green ring
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles
        "flex field-sizing-content min-h-24 w-full px-4 py-3",
        "bg-zinc-900/60 backdrop-blur-sm text-white placeholder:text-zinc-500",
        "border border-white/10 rounded-xl",
        "text-sm font-normal resize-none",
        "transition-all duration-200 outline-none",
        // Hover
        "hover:border-white/15 hover:bg-zinc-900/80",
        // Focus
        "focus:bg-zinc-900 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
