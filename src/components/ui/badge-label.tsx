
import { cn } from "@/lib/utils"

interface BadgeLabelProps {
  children: React.ReactNode
  variant?: "blue" | "green" | "orange" | "purple" | "default"
  className?: string
}

export function BadgeLabel({ 
  children, 
  variant = "default", 
  className 
}: BadgeLabelProps) {
  const variantClasses = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
    purple: "bg-purple-100 text-purple-800",
    default: "bg-sky-100 text-sky-800",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
