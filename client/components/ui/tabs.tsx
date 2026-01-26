"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/**
 * Superdash Design System - Tabs
 * - List: Glass background
 * - Trigger: Neon glow when active
 */

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-zinc-900/60 backdrop-blur-sm text-zinc-500 inline-flex h-11 w-full sm:w-fit items-center justify-center rounded-xl p-1 border border-white/5",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base
        "relative inline-flex h-full flex-1 items-center justify-center gap-2 rounded-lg px-6 py-2 text-sm font-medium whitespace-nowrap transition-all outline-none",
        "hover:text-white",
        // Active state
        "data-[state=active]:bg-white/10 data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm",
        "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 data-[state=active]:after:w-[30%] data-[state=active]:after:bg-emerald-500 data-[state=active]:after:rounded-full",
        // Focus
        "focus-visible:ring-2 focus-visible:ring-emerald-500/20",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-50",
        // SVG
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none mt-2", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
