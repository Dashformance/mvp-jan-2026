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
        "flex h-10 w-full rounded-md border border-border-default bg-bg-elevated px-3 py-2 text-base ring-offset-bg-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}

export { Input }
