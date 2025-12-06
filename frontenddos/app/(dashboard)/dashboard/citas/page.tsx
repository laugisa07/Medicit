"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { formatDateTime } from "@/lib/format"
import { Plus, Eye, Check, X, Trash2, Calendar, UserCircle } from "lucide-react"
import Link from "next/link"
import type { Cita, Estado, Usuario, Especialidad } from "@/lib/types"

export default function CitasPage() {
  const { user, isPaciente, isMedico, isAdmin, canCreate, canEdit, canDelete } = useAuth()
  const { toast } = useToast()

  // Debug logs
  console.log("useAuth() completo:", { user, isPaciente: isPaciente(), isMedico: isMedico(), isAdmin: isAdmin() })
  console.log("Es paciente?", isPaciente())
  console.log("Es médico?", isMedico())
  console.log("Es admin?", isAdmin())

  const [citas, setCitas] = useState<Cita[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; cita: Cita | null }>({
    open: false,
    cita: null,
  })
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    cita: Cita | null
    action: "aceptar" | "rechazar" | null
  }>({ open: false, cita: null, action: null })

  const getEspecialidadesDelMedico = (cita: Cita): string => {
    // Primero, intenta obtener especialidades desde el objeto anidado
    if (cita.medico?.especialidades && cita.medico.especialidades.length > 0) {
      return cita.medico.especialidades.map((e) => e.nombreEspecialidad).join(", ")
    }
    
    // Si no, busca en la lista de usuarios (fallback)
    const idMedico = cita.idMedico || cita.medico?.idUsuario || 0
    const medico = usuarios.find((u) => u.idUsuario === idMedico)
    if (!medico?.especialidades || medico.especialidades.length === 0) return "Sin especialidad"
    return medico.especialidades.map((e) => e.nombreEspecialidad).join(", ")
  }

  const loadCitas = async () => {
    try {
      let data: Cita[] = []
      
      if (isPaciente()) {
        // Paciente: solo ver sus propias citas
        if (!user?.idUsuario) {
          throw new Error("Usuario no autenticado")
        }
        data = await api.getCitasPorPaciente(user.idUsuario)
      } else if (isMedico()) {
        // Médico: ver citas de sus pacientes
        if (!user?.idUsuario) {
          throw new Error("Usuario no autenticado")
        }
        data = await api.getCitasPorMedico(user.idUsuario)
      } else {
        // Admin: ver todas las citas
        data = await api.getCitas()
      }
      
      const [estadosData, usuariosData] = await Promise.all([api.getEstados(), api.getUsuarios()])
      setCitas(data)
      setEstados(estadosData)
      setUsuarios(usuariosData)
      
    } catch (error: unknown) {
      const err = error as { message?: string; mensaje?: string }
      toast({
        variant: "destructive",
        title: "Error",
        description: err.mensaje || err.message || "No se pudieron cargar las citas",
      })
    } finally {
      setIsLoading(false)
    }
  }

 
  useEffect(() => {
    loadCitas()
  }, [user])

  const getEstadoId = (nombreEstado: string) => {
    const estado = estados.find((e) => (e.estado || e.nombreEstado || "").toLowerCase() === nombreEstado.toLowerCase())
    return estado?.idEstado
  }

  const handleStatusChange = async () => {
    if (!actionDialog.cita || !actionDialog.action) return

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
      await api.actualizarCita(actionDialog.cita.idCita, {
        estado: { idEstado: estadoId },
      })
      toast({
        title: "Cita actualizada",
        description: `La cita ha sido ${nuevoEstado.toLowerCase()}`,
      })
      loadCitas()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la cita",
      })
    } finally {
      setActionDialog({ open: false, cita: null, action: null })
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.cita) return

    try {
      // Cambiar estado a "Cancelada" en lugar de eliminar
      const estadoId = getEstadoId("Cancelada")
      
      if (!estadoId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: 'No se encontró el estado "Cancelada"',
        })
        return
      }

      await api.actualizarCita(deleteDialog.cita.idCita, {
        estado: { idEstado: estadoId },
      })

      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada correctamente",
      })
      loadCitas()
    } catch (error: unknown) {
      const err = error as { message?: string; mensaje?: string }
      toast({
        variant: "destructive",
        title: "Error",
        description: err.mensaje || err.message || "No se pudo cancelar la cita",
      })
    } finally {
      setDeleteDialog({ open: false, cita: null })
    }
  }

  const filterCitasByStatus = (status: string) => {
    if (status === "todas") return citas
    return citas.filter((c) => (c.estadoCita || c.estado?.estado || c.estado?.nombreEstado || "").toLowerCase() === status.toLowerCase())
  }

  const baseColumns = [
    {
      key: "fechaHora",
      header: "Fecha y hora",
      render: (cita: Cita) => formatDateTime(cita.fechaHora),
    },
    { key: "motivo", header: "Motivo" },
    {
      key: "estado",
      header: "Estado",
      render: (cita: Cita) => <StatusBadge status={cita.estadoCita || cita.estado?.estado || cita.estado?.nombreEstado || "Desconocido"} />,
    }, 
  ]

  const pacienteColumns = [
    ...baseColumns.slice(0, 1),
    {
      key: "medico",
      header: "Médico",
      render: (cita: Cita) => {
        const nombreMedico = cita.nombreMedico || `${cita.medico?.nombres} ${cita.medico?.apellidos}`
        const espec = getEspecialidadesDelMedico(cita)
        return `Dr. ${nombreMedico} - ${espec}`
      },
    },
    ...baseColumns.slice(1),
  ]

  const medicoColumns = [
    ...baseColumns.slice(0, 1),
    {
      key: "paciente",
      header: "Paciente",
      render: (cita: Cita) => `${cita.nombrePaciente || `${cita.paciente?.nombres} ${cita.paciente?.apellidos}`}`,
    },
    ...baseColumns.slice(1),
  ]

  const adminColumns = [
    ...baseColumns.slice(0, 1),
    {
      key: "paciente",
      header: "Paciente",
      render: (cita: Cita) => `${cita.nombrePaciente || `${cita.paciente?.nombres} ${cita.paciente?.apellidos}`}`,
    },
    {
      key: "medico",
      header: "Médico",
      render: (cita: Cita) => {
        const nombreMedico = cita.nombreMedico || `${cita.medico?.nombres} ${cita.medico?.apellidos}`
        const espec = getEspecialidadesDelMedico(cita)
        return `Dr. ${nombreMedico} - ${espec}`
      },
    },
    ...baseColumns.slice(1),
  ]

  const columns = isPaciente() ? pacienteColumns : isMedico() ? medicoColumns : adminColumns

  const renderActions = (cita: Cita) => {
    const estadoActual = (cita.estadoCita || cita.estado?.estado || cita.estado?.nombreEstado || "").toLowerCase()
    const isPending = estadoActual === "pendiente"
    const canCancel = estadoActual !== "cancelada" && estadoActual !== "rechazada"
    
    // Verificar permisos de eliminación (cancelación) usando el formato correcto
    const hasDeletePermission = canDelete("moduloCitas")
    
    // Permitir cancelar según el rol y permisos
    const canCancelByRole = canCancel && hasDeletePermission

    return (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/citas/${cita.idCita}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">Ver</span>
          </Link>
        </Button>

        {/* Doctor actions: Accept/Reject */}
        {isMedico() && isPending && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => setActionDialog({ open: true, cita, action: "aceptar" })}
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Aceptar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setActionDialog({ open: true, cita, action: "rechazar" })}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Rechazar</span>
            </Button>
          </>
        )}

        {/* Cancel action */}
        {canCancelByRole && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setDeleteDialog({ open: true, cita })}
            title="Cancelar cita"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">Cancelar</span>
          </Button>
        )}
      </div>
    )
  }

  const title = isPaciente() ? "Mis Citas" : isMedico() ? "Citas de Mis Pacientes" : "Gestión de Citas"

  const description = isPaciente()
    ? "Gestiona tus citas médicas y solicita nuevas"
    : isMedico()
      ? "Revisa y gestiona las citas pendientes de tus pacientes"
      : "Administra todas las citas del sistema"

  return (
    <DashboardLayout title={title}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {(isPaciente() || (canCreate("modulo_citas") && isAdmin())) && (
            <Button asChild>
              <Link href="/dashboard/citas/crear">
                <Plus className="mr-2 h-4 w-4" />
                {isPaciente() ? "Solicitar cita" : "Nueva cita"}
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todas" className="space-y-4">
            <TabsList>
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
              <TabsTrigger value="aceptada">Aceptadas</TabsTrigger>
              <TabsTrigger value="rechazada">Rechazadas</TabsTrigger>
              <TabsTrigger value="cancelada">Canceladas</TabsTrigger>
            </TabsList>

            {["todas", "pendiente", "aceptada", "rechazada", "cancelada"].map((status) => (
              <TabsContent key={status} value={status}>
                <DataTable
                  data={filterCitasByStatus(status) as unknown as Record<string, unknown>[]}
                  columns={columns as any}
                  isLoading={isLoading}
                  searchPlaceholder="Buscar por motivo..."
                  actions={renderActions as any}
                />
              </TabsContent>
            ))}
          </Tabs>

          {citas.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No hay citas registradas</p>
              {isPaciente() && (
                <Button asChild className="mt-4">
                  <Link href="/dashboard/citas/crear">Solicitar tu primera cita</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog (Accept/Reject) */}
      <ConfirmDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
        title={actionDialog.action === "aceptar" ? "Aceptar cita" : "Rechazar cita"}
        description={
          actionDialog.action === "aceptar"
            ? "¿Confirmas que deseas aceptar esta cita?"
            : "¿Confirmas que deseas rechazar esta cita?"
        }
        confirmText={actionDialog.action === "aceptar" ? "Aceptar" : "Rechazar"}
        variant={actionDialog.action === "rechazar" ? "destructive" : "default"}
        onConfirm={handleStatusChange}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Cancelar cita"
        description={
          deleteDialog.cita
            ? `¿Estás seguro de que deseas cancelar la cita del ${formatDateTime(deleteDialog.cita.fechaHora)}? Una vez cancelada, podrás solicitar una nueva cita si es necesario.`
            : "¿Estás seguro de que deseas cancelar esta cita?"
        }
        confirmText="Cancelar cita"
        cancelText="Mantener cita"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  )
}
