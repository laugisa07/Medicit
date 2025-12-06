"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, Save, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import type { Rol, Estado, Especialidad, Pregunta } from "@/lib/types"

interface CreateUserFormData {
  nombreUsuario: string
  contrasenia: string
  nombres: string
  apellidos: string
  dui: string
  fechaNacimiento: string
  correo: string
  telefono: string
  idRol: string
  idEstado: string
  especialidades: string[]
  preguntasRespuestas: { idPregunta: number; respuesta: string }[]
}

export default function CrearUsuarioPage() {
  const [roles, setRoles] = useState<Rol[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRol, setSelectedRol] = useState<string>("")
  const { toast } = useToast()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    defaultValues: {
      especialidades: [],
      preguntasRespuestas: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "preguntasRespuestas",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rolesData, estadosData, especialidadesData, preguntasData] = await Promise.all([
          api.getRoles(),
          api.getEstados(),
          api.getEspecialidades(),
          api.getPreguntas(),
        ])
        setRoles(rolesData)
        setEstados(estadosData)
        setEspecialidades(especialidadesData)
        setPreguntas(preguntasData)

        // Set default state as "Activo"
        const estadoActivo = estadosData.find(
          (e) => e.estado?.toLowerCase() === "activo" || e.estado?.toLowerCase() === "activa"
        )
        if (estadoActivo) {
          setValue("idEstado", String(estadoActivo.idEstado))
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos necesarios",
        })
      } finally {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [toast, setValue])

  const isMedico = () => {
    const rol = roles.find((r) => r.idRol === Number(selectedRol))
    const nombreRol = rol?.nombreRol?.toLowerCase?.() || ""
    return nombreRol === "medico" || nombreRol === "médico"
  }

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true)
    try {
      await api.crearUsuarioCompleto({
        nombreUsuario: data.nombreUsuario,
        contrasenia: data.contrasenia,
        nombres: data.nombres,
        apellidos: data.apellidos,
        dui: data.dui,
        fechaNacimiento: data.fechaNacimiento,
        correo: data.correo,
        telefono: data.telefono,
        idRol: Number(data.idRol),
        idEstado: Number(data.idEstado),
        especialidades: data.especialidades.map(Number),
        preguntasRespuestas: data.preguntasRespuestas.filter((pr) => pr.idPregunta && pr.respuesta),
      })

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente",
      })
      router.push("/dashboard/usuarios")
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number }
      let errorMessage = "No se pudo crear el usuario"

      if (err.status === 409) {
        errorMessage = "El usuario, correo o DUI ya existe"
      } else if (err.message) {
        errorMessage = err.message
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addPregunta = () => {
    const usedPreguntas = fields.map((f) => f.idPregunta)
    const availablePreguntas = preguntas.filter((p) => !usedPreguntas.includes(p.idPregunta))
    if (availablePreguntas.length > 0) {
      append({ idPregunta: 0, respuesta: "" })
    }
  }

  if (isLoadingData) {
    return (
      <DashboardLayout title="Crear Usuario">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Crear Usuario">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/usuarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Crear nuevo usuario</h2>
            <p className="text-muted-foreground">Crea pacientes, médicos, administradores o recepcionistas</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>Datos personales del usuario</CardDescription>
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
                  <Label htmlFor="dui">DUI *</Label>
                  <Input
                    id="dui"
                    placeholder="00000000-0"
                    {...register("dui", {
                      required: "Requerido",
                      pattern: {
                        value: /^\d{8}-\d$/,
                        message: "Formato: 00000000-0",
                      },
                    })}
                  />
                  {errors.dui && <p className="text-xs text-destructive">{errors.dui.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de nacimiento *</Label>
                  <Input id="fechaNacimiento" type="date" {...register("fechaNacimiento", { required: "Requerido" })} />
                  {errors.fechaNacimiento && (
                    <p className="text-xs text-destructive">{errors.fechaNacimiento.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input id="telefono" {...register("telefono", { required: "Requerido" })} />
                  {errors.telefono && <p className="text-xs text-destructive">{errors.telefono.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Cuenta de usuario</CardTitle>
              <CardDescription>Credenciales de acceso y rol</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreUsuario">Nombre de usuario *</Label>
                  <Input
                    id="nombreUsuario"
                    {...register("nombreUsuario", {
                      required: "Requerido",
                      minLength: { value: 4, message: "Mínimo 4 caracteres" },
                    })}
                  />
                  {errors.nombreUsuario && <p className="text-xs text-destructive">{errors.nombreUsuario.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contrasenia">Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="contrasenia"
                      type={showPassword ? "text" : "password"}
                      {...register("contrasenia", {
                        required: "Requerido",
                        minLength: { value: 6, message: "Mínimo 6 caracteres" },
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.contrasenia && <p className="text-xs text-destructive">{errors.contrasenia.message}</p>}
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
                  {errors.idRol && <p className="text-xs text-destructive">{errors.idRol.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idEstado">Estado *</Label>
                  <Select onValueChange={(val) => setValue("idEstado", val)}>
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
                  {errors.idEstado && <p className="text-xs text-destructive">{errors.idEstado.message}</p>}
                </div>
              </div>

              {/* Specialties for Doctors */}
              {isMedico() && (
                <div className="space-y-2">
                  <Label>Especialidades</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {especialidades.map((esp) => (
                      <label
                        key={esp.idEspecialidad}
                        className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          value={esp.idEspecialidad}
                          {...register("especialidades")}
                          className="rounded"
                        />
                        <span className="text-sm">{esp.nombreEspecialidad}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preguntas de seguridad</CardTitle>
                  <CardDescription>Opcional: preguntas para recuperación de cuenta</CardDescription>
                </div>
                {preguntas.length > fields.length && (
                  <Button type="button" variant="outline" size="sm" onClick={addPregunta}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No se han agregado preguntas de seguridad
                </p>
              ) : (
                fields.map((field, index) => {
                  const usedPreguntas = fields.map((f, i) => (i !== index ? f.idPregunta : null)).filter(Boolean)
                  const availablePreguntas = preguntas.filter(
                    (p) => !usedPreguntas.includes(p.idPregunta) || p.idPregunta === field.idPregunta,
                  )

                  return (
                    <div key={field.id} className="flex gap-2">
                      <div className="flex-1 space-y-2">
                        <Select
                          value={field.idPregunta ? String(field.idPregunta) : ""}
                          onValueChange={(val) => setValue(`preguntasRespuestas.${index}.idPregunta`, Number(val))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar pregunta" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePreguntas.map((p) => (
                              <SelectItem key={p.idPregunta} value={String(p.idPregunta)}>
                                {p.pregunta}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input placeholder="Respuesta" {...register(`preguntasRespuestas.${index}.respuesta`)} />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 mt-1"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/usuarios">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
              Crear usuario
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
