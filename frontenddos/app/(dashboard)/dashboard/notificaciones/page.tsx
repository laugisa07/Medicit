"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Construction } from "lucide-react"

export default function NotificacionesPage() {
  return (
    <DashboardLayout title="Notificaciones">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Construction className="h-5 w-5" />
              Módulo en Construcción
            </CardTitle>
            <CardDescription>Esta funcionalidad estará disponible próximamente</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">El módulo de notificaciones te permitirá:</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Recibir recordatorios automáticos de citas</li>
              <li>Notificaciones de cambios en el estado de tus citas</li>
              <li>Alertas del sistema para administradores</li>
              <li>Mensajes importantes de tu médico</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
