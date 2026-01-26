"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Superdash Design System - Radio Group
 */

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        // Base
        "aspect-square size-5 shrink-0 rounded-full border border-white/15 bg-zinc-900/60 shadow-xs transition-all outline-none",
        "focus-visible:ring-2 focus-visible:ring-emerald-500/20",
        // Checked
        "data-[state=checked]:border-emerald-500 text-emerald-500",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center h-full w-full"
      >
        <CircleIcon className="fill-emerald-500 size-2 stroke-none shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
