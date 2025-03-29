
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

interface BackButtonProps {
  label?: string
  className?: string
}

export function BackButton({ label = "חזרה", className }: BackButtonProps) {
  const navigate = useNavigate()

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => navigate(-1)}
    >
      <ArrowRight className="ml-1 h-4 w-4" />
      {label}
    </Button>
  )
}
