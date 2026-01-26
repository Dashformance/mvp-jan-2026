"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({ className, value, variant = "default", ...props }: React.ComponentProps<typeof ProgressPrimitive.Root> & { variant?: "default" | "xp" }) {
    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            className={cn(
                "relative h-2 w-full overflow-hidden rounded-full bg-glass-bg",
                className
            )}
            {...props}
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className={cn(
                    "h-full w-full flex-1 transition-all duration-500 ease-spring",
                    variant === "default" && "bg-accent",
                    variant === "xp" && "bg-linear-to-r from-neon-green to-neon-cyan shadow-glow-green"
                )}
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </ProgressPrimitive.Root>
    )
}

export { Progress }
