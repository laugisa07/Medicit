"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LoadingPage, LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import type { Usuario, Rol, Estado, Especialidad } from "@/lib/types"

interface EditUserFormData {
  nombreUsuario: string
  nombres: string
  apellidos: string
  correo: string
  idRol: string
  idEstado: string
  especialidades: string[]
}

export default function EditarUsuarioPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const userId = Number(params.id)

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [roles, setRoles] = useState<Rol[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRol, setSelectedRol] = useState<string>("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditUserFormData>({
    defaultValues: {
      especialidades: [],
    },
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usuarioData, rolesData, estadosData, especialidadesData] = await Promise.all([
          api.getUsuario(userId),
          api.getRoles(),
          api.getEstados(),
          api.getEspecialidades(),
        ])

        setUsuario(usuarioData)
        setRoles(rolesData)
        setEstados(estadosData)
        setEspecialidades(especialidadesData)

        // Set form values
        setValue("nombreUsuario", usuarioData.nombreUsuario)
        setValue("nombres", usuarioData.nombres)
        setValue("apellidos", usuarioData.apellidos)
        setValue("correo", usuarioData.correo || "")
        
        // Set Rol - manejo de estructura anidada
        const rolId = usuarioData.rol?.idRol || usuarioData.idRol
        setValue("idRol", String(rolId || ""))
        setSelectedRol(String(rolId || ""))
        
        // Set Estado - manejo de estructura anidada
        const estadoId = usuarioData.estado?.idEstado || usuarioData.idEstado
        setValue("idEstado", String(estadoId || ""))
        
        // Set Especialidades si es médico
        if (usuarioData.especialidades && usuarioData.especialidades.length > 0) {
          setValue(
            "especialidades",
            usuarioData.especialidades.map((e) => String(e.idEspecialidad))
          )
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
  }, [userId, router, setValue, toast])

  const isMedico = () => {
    const rol = roles.find((r) => r.idRol === Number(selectedRol))
    const nombreRol = rol?.nombreRol?.toLowerCase?.() || ""
    return nombreRol === "medico" || nombreRol === "médico"
  }

  const onSubmit = async (data: EditUserFormData) => {
    setIsSubmitting(true)
    try {
      await api.actualizarUsuario(userId, {
        nombreUsuario: data.nombreUsuario,
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: data.correo,
        idRol: Number(data.idRol),
        idEstado: Number(data.idEstado),
      })

      // If doctor, update specialties
      if (isMedico() && data.especialidades?.length) {
        await api.asignarEspecialidades(userId, data.especialidades.map(Number))
      }

      toast({
        title: "Usuario actualizado",
        description: "Los cambios han sido guardados correctamente",
      })
      router.push(`/dashboard/usuarios/${userId}`)
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "No se pudo actualizar el usuario",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Editar Usuario">
        <LoadingPage />
      </DashboardLayout>
    )
  }

  if (!usuario) {
    return (
      <DashboardLayout title="Editar Usuario">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Usuario no encontrado</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Editar Usuario">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/usuarios/${userId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Editar usuario</h2>
            <p className="text-muted-foreground">
              Modifica la información de {usuario.nombres} {usuario.apellidos}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del usuario</CardTitle>
              <CardDescription>Actualiza los datos del usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres *</Label>
                  <Input id="nombres" {...register("nombres", { required: "Requerido" })} />
                  {errors.nombres && <p className="text-xs text-destructive">{errors.nombres.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input id="apellidos" {...register("apellidos", { required: "Requerido" })} />
                  {errors.apellidos && <p className="text-xs text-destructive">{errors.apellidos.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreUsuario">Nombre de usuario *</Label>
                  <Input id="nombreUsuario" {...register("nombreUsuario", { required: "Requerido" })} />
                  {errors.nombreUsuario && <p className="text-xs text-destructive">{errors.nombreUsuario.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo electrónico *</Label>
                  <Input
                    id="correo"
                    type="email"
                    {...register("correo", {
                      required: "Requerido",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Correo inválido",
                      },
                    })}
                  />
                  {errors.correo && <p className="text-xs text-destructive">{errors.correo.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idRol">Rol *</Label>
                  <Select
                    value={selectedRol}
                    onValueChange={(val) => {
                      setSelectedRol(val)
                      setValue("idRol", val)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((rol) => (
                        <SelectItem key={rol.idRol} value={String(rol.idRol)}>
                          {rol.nombreRol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idEstado">Estado *</Label>
                  <Select value={watch("idEstado")} onValueChange={(val) => setValue("idEstado", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados
                        .filter((e) => {
                          const estadoNombre = (e.estado || e.nombreEstado || "").toLowerCase()
                          return (
                            estadoNombre === "activo" ||
                            estadoNombre === "activa" ||
                            estadoNombre === "inactivo" ||
                            estadoNombre === "inactiva"
                          )
                        })
                        .map((estado) => (
                          <SelectItem key={estado.idEstado} value={String(estado.idEstado)}>
                            {estado.estado || estado.nombreEstado}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isMedico() && (
                <div className="space-y-2">
                  <Label>Especialidades</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {especialidades.map((esp) => {
                      const isChecked = watch("especialidades")?.includes(String(esp.idEspecialidad))
                      return (
                        <label
                          key={esp.idEspecialidad}
                          className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked || false}
                            value={String(esp.idEspecialidad)}
                            onChange={(e) => {
                              const currentEspecialidades = watch("especialidades") || []
                              if (e.target.checked) {
                                setValue("especialidades", [
                                  ...currentEspecialidades,
                                  String(esp.idEspecialidad),
                                ])
                              } else {
                                setValue(
                                  "especialidades",
                                  currentEspecialidades.filter((id) => id !== String(esp.idEspecialidad))
                                )
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{esp.nombreEspecialidad}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/dashboard/usuarios/${userId}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
