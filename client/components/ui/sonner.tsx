"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Superdash Design System - Sonner (Toasts)
 * - Glass effect using CSS variables
 * - Neon indicators for different states
 */

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "dark" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-400" />,
        info: <InfoIcon className="size-4 text-blue-400" />,
        warning: <TriangleAlertIcon className="size-4 text-orange-400" />,
        error: <OctagonXIcon className="size-4 text-rose-400" />,
        loading: <Loader2Icon className="size-4 text-emerald-400 animate-spin" />,
      }}
      toastOptions={{
        className: "bg-zinc-900/90 backdrop-blur-xl border border-white/10 text-zinc-100 rounded-xl shadow-2xl",
      }}
      style={
        {
          "--normal-bg": "rgba(24, 24, 27, 0.9)",
          "--normal-text": "#f4f4f5",
          "--normal-border": "rgba(255, 255, 255, 0.1)",
          "--border-radius": "12px",
          "--success-bg": "rgba(6, 78, 59, 0.2)",
          "--success-text": "#34d399",
          "--success-border": "rgba(52, 211, 153, 0.2)",
          "--error-bg": "rgba(159, 18, 57, 0.2)",
          "--error-text": "#fb7185",
          "--error-border": "rgba(251, 113, 133, 0.2)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
