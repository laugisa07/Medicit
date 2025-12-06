import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusColors: Record<string, string> = {
  activo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  inactivo: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  aceptada: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  rechazada: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  cancelada: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  completada: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Validar que status exista y sea un string
  if (!status || typeof status !== "string") {
    return (
      <Badge variant="outline" className={cn("font-medium", statusColors.activo, className)}>
        Desconocido
      </Badge>
    )
  }

  const normalizedStatus = status.toLowerCase()
  const colorClass = statusColors[normalizedStatus] || statusColors.activo

  return (
    <Badge variant="outline" className={cn("font-medium", colorClass, className)}>
      {status}
    </Badge>
  )
}
