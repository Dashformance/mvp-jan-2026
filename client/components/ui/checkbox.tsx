"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Superdash Design System - Checkbox
 * - Unchecked: Dark glass border
 * - Checked: Neon green fill
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Base
        "peer size-5 shrink-0 rounded-md",
        "bg-zinc-900/60 border border-white/15",
        "transition-all duration-200 outline-none",
        // Checked state - neon green
        "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500",
        "data-[state=checked]:shadow-[0_0_10px_rgba(16,185,129,0.4)]",
        // Focus
        "focus-visible:ring-2 focus-visible:ring-emerald-500/30",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-black"
      >
        <CheckIcon className="size-3.5 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
