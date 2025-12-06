"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LoadingPage } from "@/components/ui/loading-spinner"
import { StatusBadge } from "@/components/ui/status-badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { formatDateTime } from "@/lib/format"
import { ArrowLeft, Calendar, User, Stethoscope, FileText, Check, X, Trash2 } from "lucide-react"
import Link from "next/link"
import type { Cita, Estado } from "@/lib/types"

export default function CitaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isPaciente, isMedico, isAdmin, canDelete } = useAuth()
  const { toast } = useToast()
  const citaId = Number(params.id)

  const [cita, setCita] = useState<Cita | null>(null)
  const [estados, setEstados] = useState<Estado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    action: "aceptar" | "rechazar" | null
  }>({ open: false, action: null })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [citaData, estadosData] = await Promise.all([api.getCita(citaId), api.getEstados()])
        setCita(citaData)
        setEstados(estadosData)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información de la cita",
        })
        router.push("/dashboard/citas")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [citaId, router, toast])

  const getEstadoId = (nombreEstado: string) => {
    const estado = estados.find((e) => (e.estado || e.nombreEstado || "").toLowerCase() === nombreEstado.toLowerCase())
    return estado?.idEstado
  }

  const handleStatusChange = async () => {
    if (!cita || !actionDialog.action) return

    const nuevoEstado = actionDialog.action === "aceptar" ? "Aceptada" : "Rechazada"
    const estadoId = getEstadoId(nuevoEstado)

    if (!estadoId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `No se encontró el estado "${nuevoEstado}"`,
      })
      return
    }

    try {
      const updatedCita = await api.actualizarCita(cita.idCita, {
        estado: { idEstado: estadoId },
      })
      setCita({ 
        ...cita, 
        estadoCita: nuevoEstado,
        estado: cita.estado ? { ...cita.estado, idEstado: estadoId, nombreEstado: nuevoEstado } : undefined
      })
      toast({
        title: "Cita actualizada",
        description: `La cita ha sido ${nuevoEstado.toLowerCase()}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la cita",
      })
    } finally {
      setActionDialog({ open: false, action: null })
    }
  }

  const handleDelete = async () => {
    if (!cita) return

    try {
      await api.eliminarCita(cita.idCita)
      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada correctamente",
      })
      router.push("/dashboard/citas")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cancelar la cita",
      })
    } finally {
      setDeleteDialog(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Detalle de Cita">
        <LoadingPage />
      </DashboardLayout>
    )
  }

  if (!cita) {
    return (
      <DashboardLayout title="Detalle de Cita">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cita no encontrada</p>
        </div>
      </DashboardLayout>
    )
  }

  const isPending = (cita.estadoCita || cita.estado?.estado || cita.estado?.nombreEstado || "").toLowerCase() === "pendiente"
  const canCancel = isPending || (cita.estadoCita || cita.estado?.estado || cita.estado?.nombreEstado || "").toLowerCase() === "aceptada"

  return (
    <DashboardLayout title="Detalle de Cita">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/citas">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Cita #{cita.idCita}</h2>
              <p className="text-muted-foreground">{formatDateTime(cita.fechaHora)}</p>
            </div>
          </div>
          <StatusBadge status={cita.estadoCita || cita.estado?.estado || cita.estado?.nombreEstado || "Desconocido"} />
        </div>

        {/* Main Info */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Nombre</dt>
                  <dd>
                    {cita.nombrePaciente || `${cita.paciente?.nombres} ${cita.paciente?.apellidos}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Usuario</dt>
                  <dd>@{cita.paciente?.nombreUsuario || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Correo</dt>
                  <dd>{cita.paciente?.correo || "N/A"}</dd>
                </div>
              </dl>
              {(isMedico() || isAdmin()) && cita.paciente && (
                <Button variant="outline" size="sm" className="mt-4 bg-transparent" asChild>
                  <Link href={`/dashboard/usuarios/${cita.paciente.idUsuario}`}>Ver perfil del paciente</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Doctor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Médico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Nombre</dt>
                  <dd>
                    Dr. {cita.nombreMedico || `${cita.medico?.nombres} ${cita.medico?.apellidos}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Usuario</dt>
                  <dd>@{cita.medico?.nombreUsuario || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Correo</dt>
                  <dd>{cita.medico?.correo || "N/A"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalles de la cita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Fecha y hora</dt>
                <dd className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDateTime(cita.fechaHora)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Motivo de la consulta</dt>
                <dd className="mt-1 p-3 bg-muted rounded-lg">{cita.motivo}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-end">
          {/* Doctor actions */}
          {isMedico() && isPending && (
            <>
              <Button
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                onClick={() => setActionDialog({ open: true, action: "aceptar" })}
              >
                <Check className="mr-2 h-4 w-4" />
                Aceptar cita
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                onClick={() => setActionDialog({ open: true, action: "rechazar" })}
              >
                <X className="mr-2 h-4 w-4" />
                Rechazar cita
              </Button>
            </>
          )}

          {/* Cancel action */}
          {(isPaciente() || isAdmin()) && canCancel && canDelete("modulo_citas") && (
            <Button variant="destructive" onClick={() => setDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Cancelar cita
            </Button>
          )}
        </div>
      </div>

      {/* Action Dialog */}
      <ConfirmDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
        title={actionDialog.action === "aceptar" ? "Aceptar cita" : "Rechazar cita"}
        description={
          actionDialog.action === "aceptar"
            ? "¿Confirmas que deseas aceptar esta cita? El paciente será notificado."
            : "¿Confirmas que deseas rechazar esta cita? El paciente será notificado."
        }
        confirmText={actionDialog.action === "aceptar" ? "Aceptar" : "Rechazar"}
        variant={actionDialog.action === "rechazar" ? "destructive" : "default"}
        onConfirm={handleStatusChange}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        title="Cancelar cita"
        description="¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer."
        confirmText="Cancelar cita"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  )
}
