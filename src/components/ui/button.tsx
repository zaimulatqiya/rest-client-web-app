import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm active:scale-95",
          {
            "bg-primary text-white hover:bg-primary/90 hover:shadow-primary hover:-translate-y-0.5": variant === "default",
            "border border-input bg-white hover:bg-gray-50 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5": variant === "outline",
            "hover:bg-gray-100 hover:shadow-sm": variant === "ghost",
            "bg-destructive text-white hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/30": variant === "destructive",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-lg px-3": size === "sm",
            "h-11 rounded-xl px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

