import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "method"
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, variant = "default", ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-11 w-full rounded-xl border border-input bg-white px-4 py-2 text-sm font-medium shadow-sm",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "appearance-none cursor-pointer pr-10 transition-all",
            variant === "method" && "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown 
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform",
            "text-muted-foreground",
            variant === "method" && "text-blue-600"
          )} 
        />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
