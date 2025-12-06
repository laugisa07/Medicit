"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api, getNombreRol } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LoadingPage } from "@/components/ui/loading-spinner"
import { StatusBadge } from "@/components/ui/status-badge"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ArrowLeft, Pencil, User, Phone, Mail, Calendar, FileText, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatDate, formatDateTime } from "@/lib/format"
import type { Usuario, Telefono, Correo, Antecedente, Cita, Especialidad } from "@/lib/types"

export default function UsuarioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canEdit, canDelete } = useAuth()
  const { toast } = useToast()
  const userId = Number(params.id)

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [telefonos, setTelefonos] = useState<Telefono[]>([])
  const [correos, setCorreos] = useState<Correo[]>([])
  const [antecedentes, setAntecedentes] = useState<Antecedente[]>([])
  const [citas, setCitas] = useState<Cita[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: "telefono" | "correo" | "antecedente" | null
    id: number | null
  }>({ open: false, type: null, id: null })

  const isPaciente = usuario ? getNombreRol(usuario).toLowerCase() === "paciente" : false
  const isMedico = usuario ? (getNombreRol(usuario).toLowerCase() === "medico" || getNombreRol(usuario).toLowerCase() === "médico") : false

  useEffect(() => {
    const loadData = async () => {
      try {
        const usuarioData = await api.getUsuario(userId)
        setUsuario(usuarioData)

        // Load related data
        const [allTelefonos, allCorreos, allEspecialidades] = await Promise.all([
          api.getTelefonos(),
          api.getCorreos(),
          api.getEspecialidades(),
        ])

        setTelefonos(allTelefonos.filter((t) => t.idUsuario === userId))
        setCorreos(allCorreos.filter((c) => c.idUsuario === userId))
        setEspecialidades(allEspecialidades)

        // Load role-specific data
        const rolNombre = getNombreRol(usuarioData).toLowerCase()
        if (rolNombre === "paciente") {
          try {
            const allAntecedentes = await api.getAntecedentes()
            setAntecedentes(allAntecedentes.filter((a) => a.idPaciente === userId))
          } catch (error) {
            console.error("Error loading antecedentes:", error)
            setAntecedentes([])
          }

          try {
            const citasPaciente = await api.getCitasPorPaciente(userId)
            setCitas(citasPaciente || [])
          } catch (error) {
            console.error("Error loading citas for paciente:", error)
            setCitas([])
          }
        } else if (rolNombre === "medico" || rolNombre === "médico") {
          try {
            const citasMedico = await api.getCitasPorMedico(userId)
            setCitas(citasMedico || [])
          } catch (error) {
            console.error("Error loading citas for medico:", error)
            setCitas([])
          }
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información del usuario",
        })
        router.push("/dashboard/usuarios")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId, router, toast])

  const handleDelete = async () => {
    if (!deleteDialog.type || !deleteDialog.id) return

    try {
      switch (deleteDialog.type) {
        case "telefono":
          await api.eliminarTelefono(deleteDialog.id)
          setTelefonos(telefonos.filter((t) => t.idTelefono !== deleteDialog.id))
          break
        case "correo":
          await api.eliminarCorreo(deleteDialog.id)
          setCorreos(correos.filter((c) => c.idCorreo !== deleteDialog.id))
          break
        case "antecedente":
          await api.eliminarAntecedente(deleteDialog.id)
          setAntecedentes(antecedentes.filter((a) => a.idAntecedente !== deleteDialog.id))
          break
      }
      toast({
        title: "Eliminado",
        description: "El registro ha sido eliminado correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el registro",
      })
    } finally {
      setDeleteDialog({ open: false, type: null, id: null })
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Detalle de Usuario">
        <LoadingPage />
      </DashboardLayout>
    )
  }

  if (!usuario) {
    return (
      <DashboardLayout title="Detalle de Usuario">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Usuario no encontrado</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Detalle de Usuario">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/usuarios">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h2 className="text-2xl font-bold">
                {usuario.nombres} {usuario.apellidos}
              </h2>
              <p className="text-muted-foreground">@{usuario.nombreUsuario}</p>
            </div>
          </div>
          {canEdit("modulo_usuarios") && (
            <Button asChild>
              <Link href={`/dashboard/usuarios/${userId}/editar`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          )}
        </div>

        {/* Main Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información general
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">ID</dt>
                <dd className="text-sm">{usuario.idUsuario}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">DUI</dt>
                <dd className="text-sm">{usuario.dui || "No registrado"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Fecha de nacimiento</dt>
                <dd className="text-sm">
                  {usuario.fechaNacimiento ? formatDate(usuario.fechaNacimiento) : "No registrada"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Correo</dt>
                <dd className="text-sm">{usuario.correo}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Rol</dt>
                <dd className="text-sm">{getNombreRol(usuario || {})}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
                <dd>
                  <StatusBadge status={usuario?.nombreEstado || usuario?.estado?.estado || ""} />
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="telefonos">
          <TabsList>
            <TabsTrigger value="telefonos" className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              Teléfonos
            </TabsTrigger>
            <TabsTrigger value="correos" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Correos
            </TabsTrigger>
            {isPaciente && (
              <>
                <TabsTrigger value="antecedentes" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Antecedentes
                </TabsTrigger>
                <TabsTrigger value="citas" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Citas
                </TabsTrigger>
              </>
            )}
            {isMedico && (
              <TabsTrigger value="citas" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Citas
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="telefonos" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Teléfonos</CardTitle>
                {canEdit("modulo_usuarios") && (
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/usuarios/${userId}/telefonos/crear`}>
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {telefonos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay teléfonos registrados</p>
                ) : (
                  <div className="space-y-2">
                    {telefonos.map((tel) => (
                      <div key={tel.idTelefono} className="flex items-center justify-between p-3 rounded-lg border">
                        <span>{tel.numero}</span>
                        {canDelete("modulo_usuarios") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                type: "telefono",
                                id: tel.idTelefono || null,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correos" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Correos adicionales</CardTitle>
                {canEdit("modulo_usuarios") && (
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/usuarios/${userId}/correos/crear`}>
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {correos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay correos adicionales registrados
                  </p>
                ) : (
                  <div className="space-y-2">
                    {correos.map((corr) => (
                      <div key={corr.idCorreo} className="flex items-center justify-between p-3 rounded-lg border">
                        <span>{corr.correo}</span>
                        {canDelete("modulo_usuarios") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                type: "correo",
                                id: corr.idCorreo || null,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isPaciente && (
            <TabsContent value="antecedentes" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Antecedentes médicos</CardTitle>
                  {canEdit("modulo_medico") && (
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/medico/antecedentes/crear?paciente=${userId}`}>
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                      </Link>
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {antecedentes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay antecedentes registrados</p>
                  ) : (
                    <div className="space-y-2">
                      {antecedentes.map((ant) => (
                        <div
                          key={ant.idAntecedente}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div>
                            <p className="font-medium">{ant.tipo || "General"}</p>
                            <p className="text-sm text-muted-foreground">{ant.descripcion}</p>
                          </div>
                          {canDelete("modulo_medico") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  type: "antecedente",
                                  id: ant.idAntecedente,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(isPaciente || isMedico) && (
            <TabsContent value="citas" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de citas</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={citas as unknown as Record<string, unknown>[]}
                    columns={[
                      {
                        key: "fechaHora",
                        header: "Fecha y hora",
                        render: (item: any) => formatDateTime((item as Cita).fechaHora),
                      },
                      {
                        key: isPaciente ? "medico" : "paciente",
                        header: isPaciente ? "Médico" : "Paciente",
                        render: (item: any) => {
                          const cita = item as Cita
                          return isPaciente
                            ? `${cita.medico?.nombres || ""} ${cita.medico?.apellidos || ""}`
                            : `${cita.paciente?.nombres || ""} ${cita.paciente?.apellidos || ""}`
                        },
                      },
                      { key: "motivo", header: "Motivo" },
                      {
                        key: "estado",
                        header: "Estado",
                        render: (item: any) => {
                          const cita = item as Cita
                          const status = cita.estado?.nombreEstado || cita.estadoCita || cita.estado?.estado || "Desconocido"
                          return <StatusBadge status={status} />
                        },
                      },
                    ] as any}
                    pageSize={5}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Confirmar eliminación"
        description="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  )
}
