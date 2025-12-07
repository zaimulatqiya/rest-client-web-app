import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error" | "warning" | "info"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-105",
        {
          "border-transparent bg-primary text-white shadow-sm shadow-primary/30": variant === "default",
          "border-transparent bg-emerald-100 text-emerald-800 shadow-sm": variant === "success",
          "border-transparent bg-rose-100 text-rose-800 shadow-sm": variant === "error",
          "border-transparent bg-amber-100 text-amber-800 shadow-sm": variant === "warning",
          "border-transparent bg-blue-100 text-blue-800 shadow-sm": variant === "info",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }

