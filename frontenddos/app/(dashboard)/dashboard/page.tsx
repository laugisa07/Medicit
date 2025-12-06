"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Users, Calendar, Stethoscope, Clock, UserCheck, AlertCircle } from "lucide-react"
import type { Cita } from "@/lib/types"
import { formatDateTime } from "@/lib/format"
import { StatusBadge } from "@/components/ui/status-badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface DashboardStats {
  totalUsuarios: number
  totalCitas: number
  citasPendientes: number
  citasHoy: number
}

export default function DashboardPage() {
  const { user, isPaciente, isMedico, isAdmin } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentCitas, setRecentCitas] = useState<Cita[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        let citas: Cita[] = []

        if (isPaciente()) {
          citas = await api.getCitasPorPaciente(user!.idUsuario)
          // Stats for paciente
          const today = new Date().toDateString()
          const citasHoy = citas.filter((c) => new Date(c.fechaHora).toDateString() === today).length
          const citasPendientes = citas.filter((c) => (c.estadoCita || c.estado?.estado || c.estado?.nombreEstado || "").toLowerCase() === "pendiente").length

          setStats({
            totalUsuarios: 0,
            totalCitas: citas.length,
            citasPendientes,
            citasHoy,
          })
        } else if (isMedico()) {
          citas = await api.getCitasPorMedico(user!.idUsuario)
          // Stats for médico
          const today = new Date().toDateString()
          const citasHoy = citas.filter((c) => new Date(c.fechaHora).toDateString() === today).length
          const citasPendientes = citas.filter((c) => (c.estadoCita || c.estado?.estado || c.estado?.nombreEstado || "").toLowerCase() === "pendiente").length

          setStats({
            totalUsuarios: 0,
            totalCitas: citas.length,
            citasPendientes,
            citasHoy,
          })
        } else {
          // Admin or receptionist sees all
          const [usuarios, allCitas] = await Promise.all([api.getUsuarios(), api.getCitas()])
          citas = allCitas

          const today = new Date().toDateString()
          const citasHoy = citas.filter((c) => new Date(c.fechaHora).toDateString() === today).length
          const citasPendientes = citas.filter((c) => (c.estadoCita || c.estado?.estado || c.estado?.nombreEstado || "").toLowerCase() === "pendiente").length

          setStats({
            totalUsuarios: usuarios.length,
            totalCitas: citas.length,
            citasPendientes,
            citasHoy,
          })
        }

        // Get recent/upcoming appointments
        const now = new Date()
        const upcoming = citas
          .filter((c) => {
            const citaDate = new Date(c.fechaHora)
            return citaDate >= now && (c.estadoCita || c.estado?.estado || c.estado?.nombreEstado || "").toLowerCase() !== "cancelada"
          })
          .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
          .slice(0, 5)

        setRecentCitas(upcoming)
      } catch (error: unknown) {
        console.error("Error loading dashboard:", error)
        const err = error as { message?: string; mensaje?: string; status?: number }
        console.error("Error details:", {
          message: err.message || err.mensaje || "Error desconocido",
          status: err.status,
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadDashboardData()
    }
  }, [user, isPaciente, isMedico])

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Message */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bienvenido, {user?.nombres}</h2>
          <p className="text-muted-foreground">
            {isPaciente() && "Gestiona tus citas médicas desde aquí."}
            {isMedico() && "Revisa tus citas y gestiona a tus pacientes."}
            {isAdmin() && "Panel de administración del sistema Medicit."}
          </p>
        </div>

        {/* Stats Cards - For everyone */}
        {stats && (
          <div className={`grid gap-4 ${isAdmin() ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
            {isAdmin() && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCitas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Citas Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.citasPendientes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.citasHoy}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isPaciente() && (
            <Card className="hover:bg-accent/50 transition-colors">
              <Link href="/dashboard/citas">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Mis Citas
                  </CardTitle>
                  <CardDescription>Gestiona tus citas médicas y solicita nuevas</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          )}

          {isMedico() && (
            <>
              <Card className="hover:bg-accent/50 transition-colors">
                <Link href="/dashboard/citas">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Mis Citas
                    </CardTitle>
                    <CardDescription>Revisa y gestiona las citas de tus pacientes</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
              <Card className="hover:bg-accent/50 transition-colors">
                <Link href="/dashboard/medico">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary" />
                      Historial Clínico
                    </CardTitle>
                    <CardDescription>Accede a los antecedentes de tus pacientes</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </>
          )}

          {isAdmin() && (
            <>
              <Card className="hover:bg-accent/50 transition-colors">
                <Link href="/dashboard/usuarios">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Gestión de Usuarios
                    </CardTitle>
                    <CardDescription>Administra usuarios, médicos y personal</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
              <Card className="hover:bg-accent/50 transition-colors">
                <Link href="/dashboard/citas">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Gestión de Citas
                    </CardTitle>
                    <CardDescription>Administra todas las citas del sistema</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
              <Card className="hover:bg-accent/50 transition-colors">
                <Link href="/dashboard/admin">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      Administración
                    </CardTitle>
                    <CardDescription>Roles, permisos y configuración del sistema</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </>
          )}
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Citas</CardTitle>
            <CardDescription>
              {isPaciente() && "Tus próximas citas programadas"}
              {isMedico() && "Próximas consultas con tus pacientes"}
              {isAdmin() && "Citas próximas en el sistema"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentCitas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No hay citas próximas</p>
                {isPaciente() && (
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/citas">Solicitar una cita</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {recentCitas.map((cita) => (
                  <div key={cita.idCita} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {isPaciente()
                          ? `Dr. ${cita.nombreMedico || `${cita.medico?.nombres} ${cita.medico?.apellidos}`}`
                          : `${cita.nombrePaciente || `${cita.paciente?.nombres} ${cita.paciente?.apellidos}`}`}
                      </p>
                      <p className="text-sm text-muted-foreground">{cita.motivo}</p>
                      <p className="text-sm text-muted-foreground">{formatDateTime(cita.fechaHora)}</p>
                    </div>
                    <StatusBadge status={cita.estadoCita || cita.estado?.estado || cita.estado?.nombreEstado || "Desconocido"} />
                  </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/dashboard/citas">Ver todas las citas</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
