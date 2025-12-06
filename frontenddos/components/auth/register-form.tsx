"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Eye, EyeOff, UserPlus, Plus, Trash2 } from "lucide-react"
import type { Pregunta, Rol, Estado } from "@/lib/types"

interface RegisterFormData {
  nombreUsuario: string
  contrasenia: string
  confirmarContrasenia: string
  nombres: string
  apellidos: string
  dui: string
  fechaNacimiento: string
  correo: string
  telefono: string
  preguntasRespuestas: { idPregunta: number; respuesta: string }[]
}

interface RegisterFormProps {
  onSuccess: (username: string) => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      preguntasRespuestas: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "preguntasRespuestas",
  })

  const password = watch("contrasenia")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [preguntasData, rolesData, estadosData] = await Promise.all([
          api.getPreguntas(),
          api.getRoles(),
          api.getEstados(),
        ])
        setPreguntas(preguntasData)
        setRoles(rolesData)
        setEstados(estadosData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [])

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
 
    try {
      // Find Paciente role and Activo state
      const rolPaciente = roles.find((r) => r.idRol === 1)
      const estadoActivo = estados.find((e) => e.idEstado === 1)

      if (!rolPaciente) {
        throw new Error("No se encontró el rol de Paciente")
      }
      if (!estadoActivo) {
        throw new Error("No se encontró el estado Activo")
      }
      
      await api.crearUsuarioCompleto({
        nombreUsuario: data.nombreUsuario,
        contrasenia: data.contrasenia,
        nombres: data.nombres,
        apellidos: data.apellidos,
        dui: data.dui,
        fechaNacimiento: data.fechaNacimiento,
        correo: data.correo,
        telefono: data.telefono,
        idRol: rolPaciente.idRol,
        idEstado: estadoActivo.idEstado,
        preguntasRespuestas: data.preguntasRespuestas.filter((pr) => pr.idPregunta && pr.respuesta),
      })

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
      })
      onSuccess(data.nombreUsuario)
    } catch (error: unknown) {
      const err = error as { 
        message?: string
        status?: number
        tipo?: string
        mensaje?: string
      }
      let errorMessage = "Ha ocurrido un error al registrarte"
      
      // Extraer mensaje del backend si está disponible
      if (err.mensaje) {
        errorMessage = err.mensaje
      } else if (err.message) {
        errorMessage = err.message
      } else if (err.status === 409 || err.status === 400) {
        errorMessage = "Los datos ingresados ya existen o son inválidos"
      }
      toast({
        variant: "destructive",
        title: "Error de registro",
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
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombres">Nombres</Label>
          <Input id="nombres" placeholder="Tus nombres" {...register("nombres", { required: "Requerido" })} />
          {errors.nombres && <p className="text-xs text-destructive">{errors.nombres.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="apellidos">Apellidos</Label>
          <Input id="apellidos" placeholder="Tus apellidos" {...register("apellidos", { required: "Requerido" })} />
          {errors.apellidos && <p className="text-xs text-destructive">{errors.apellidos.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dui">DUI</Label>
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
          <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
          <Input id="fechaNacimiento" type="date" {...register("fechaNacimiento", { required: "Requerido" })} />
          {errors.fechaNacimiento && <p className="text-xs text-destructive">{errors.fechaNacimiento.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="correo">Correo electrónico</Label>
        <Input
          id="correo"
          type="email"
          placeholder="correo@ejemplo.com"
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
        <Label htmlFor="telefono">Teléfono</Label>
        <Input id="telefono" placeholder="0000-0000" {...register("telefono", { required: "Requerido" })} />
        {errors.telefono && <p className="text-xs text-destructive">{errors.telefono.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nombreUsuario">Nombre de usuario</Label>
        <Input
          id="nombreUsuario"
          placeholder="usuario123"
          {...register("nombreUsuario", {
            required: "Requerido",
            minLength: { value: 4, message: "Mínimo 4 caracteres" },
          })}
        />
        {errors.nombreUsuario && <p className="text-xs text-destructive">{errors.nombreUsuario.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contrasenia">Contraseña</Label>
          <div className="relative">
            <Input
              id="contrasenia"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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
        <div className="space-y-2">
          <Label htmlFor="confirmarContrasenia">Confirmar</Label>
          <Input
            id="confirmarContrasenia"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("confirmarContrasenia", {
              required: "Requerido",
              validate: (value) => value === password || "Las contraseñas no coinciden",
            })}
          />
          {errors.confirmarContrasenia && (
            <p className="text-xs text-destructive">{errors.confirmarContrasenia.message}</p>
          )}
        </div>
      </div>

      {/* Security Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Preguntas de seguridad (opcional)</Label>
          {preguntas.length > fields.length && (
            <Button type="button" variant="outline" size="sm" onClick={addPregunta}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          )}
        </div>
        {fields.map((field, index) => {
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
                  <SelectTrigger className="text-sm">
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
                <Input placeholder="Tu respuesta" {...register(`preguntasRespuestas.${index}.respuesta`)} />
              </div>
              <Button type="button" variant="ghost" size="icon" className="shrink-0 mt-1" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )
        })}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <UserPlus className="mr-2 h-4 w-4" />}
        Registrarme como paciente
      </Button>
    </form>
  )
}
