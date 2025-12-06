"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api, getNombreRol } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner, LoadingPage } from "@/components/ui/loading-spinner"
import { ArrowLeft, Save, Calendar, User, Stethoscope, UserCircle } from "lucide-react"
import Link from "next/link"
import type { Usuario, Estado, Especialidad } from "@/lib/types"

interface CitaFormData {
  idMedico: string
  idPaciente?: string
  fechaHora: string
  motivo: string
}

export default function CrearCitaPage() {
  const router = useRouter()
  const { user, isPaciente, isAdmin } = useAuth()
  const { toast } = useToast()

  const [medicos, setMedicos] = useState<Usuario[]>([])
  const [pacientes, setPacientes] = useState<Usuario[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [medicoEspecialidades, setMedicoEspecialidades] = useState<Map<number, Especialidad[]>>(new Map())
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CitaFormData>()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usuarios, estadosData, especialidadesData] = await Promise.all([
          api.getUsuarios(),
          api.getEstados(),
          api.getEspecialidades(),
        ])

        // Filter doctors - soporta ambas estructuras
        const medicosList = usuarios.filter((u) => {
          const nombreRol = getNombreRol(u).toLowerCase()
          return nombreRol === "medico" || nombreRol === "médico"
        })
        setMedicos(medicosList)
        setEspecialidades(especialidadesData)

        // Mapear especialidades por médico
        const especMap = new Map<number, Especialidad[]>()
        medicosList.forEach((medico) => {
          const espec = medico.especialidades || []
          especMap.set(medico.idUsuario, espec)
        })
        setMedicoEspecialidades(especMap)

        // Filter patients (only for admin)
        if (isAdmin()) {
          const pacientesList = usuarios.filter((u) => {
            const nombreRol = getNombreRol(u).toLowerCase()
            return nombreRol === "paciente"
          })
          setPacientes(pacientesList)
        }

        setEstados(estadosData)
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
  }, [isAdmin, toast])

  const onSubmit = async (data: CitaFormData) => {
    setIsSubmitting(true)

    // Get "Pendiente" state - soporta ambas estructuras
    const estadoPendiente = estados.find((e) => {
      const estadoName = (e.estado || e.nombreEstado || "").toLowerCase()
      return estadoName.includes("pendiente")
    })

    if (!estadoPendiente) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se encontró el estado 'Pendiente'",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const pacienteId = isPaciente() ? user!.idUsuario : Number(data.idPaciente)

      // Validate required fields
      if (!data.idMedico) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes seleccionar un médico",
        })
        setIsSubmitting(false)
        return
      }

      if (isAdmin() && !data.idPaciente) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes seleccionar un paciente",
        })
        setIsSubmitting(false)
        return
      }

      await api.crearCita({
        paciente: { idUsuario: pacienteId },
        medico: { idUsuario: Number(data.idMedico) },
        fechaHora: new Date(data.fechaHora).toISOString(),
        motivo: data.motivo,
        estado: { idEstado: estadoPendiente.idEstado },
      })

      toast({
        title: "Cita solicitada",
        description: "Tu solicitud de cita ha sido enviada correctamente",
      })
      router.push("/dashboard/citas")
    } catch (error: unknown) {
      const err = error as { message?: string; mensaje?: string; status?: number }
      toast({
        variant: "destructive",
        title: "Error",
        description: err.mensaje || err.message || "No se pudo crear la cita",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date-time (now)
  const minDateTime = new Date().toISOString().slice(0, 16)

  if (isLoadingData) {
    return (
      <DashboardLayout title="Solicitar Cita">
        <LoadingPage />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={isPaciente() ? "Solicitar Cita" : "Nueva Cita"}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/citas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{isPaciente() ? "Solicitar nueva cita" : "Crear nueva cita"}</h2>
            <p className="text-muted-foreground">
              {isPaciente()
                ? "Elige un médico y selecciona fecha y hora para tu consulta"
                : "Programa una cita para un paciente"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Selection (Admin only) */}
          {isAdmin() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Paciente
                </CardTitle>
                <CardDescription>Selecciona el paciente para la cita</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="idPaciente">Paciente *</Label>
                  <Select onValueChange={(val) => setValue("idPaciente", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {pacientes.map((paciente) => (
                        <SelectItem key={paciente.idUsuario} value={String(paciente.idUsuario)}>
                          {paciente.nombres} {paciente.apellidos} - {paciente.correo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.idPaciente && <p className="text-xs text-destructive">{errors.idPaciente.message}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Doctor Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Médico
              </CardTitle>
              <CardDescription>Selecciona el médico que deseas consultar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="idMedico">Médico *</Label>
                <Select onValueChange={(val) => setValue("idMedico", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicos.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">No hay médicos disponibles</div>
                    ) : (
                      medicos.map((medico) => {
                        const espec = medicoEspecialidades.get(medico.idUsuario) || []
                        const especNombre = espec.length > 0 ? espec.map(e => e.nombreEspecialidad).join(", ") : "Sin especialidad"
                        return (
                          <SelectItem key={medico.idUsuario} value={String(medico.idUsuario)}>
                            <div className="flex items-center gap-2">
                              <UserCircle className="h-4 w-4" />
                              <span>
                                Dr. {medico.nombres} {medico.apellidos} - {especNombre}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })
                    )}
                  </SelectContent>
                </Select>
                {errors.idMedico && <p className="text-xs text-destructive">{errors.idMedico.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Date and Reason */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detalles de la cita
              </CardTitle>
              <CardDescription>Fecha, hora y motivo de la consulta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fechaHora">Fecha y hora *</Label>
                <Input
                  id="fechaHora"
                  type="datetime-local"
                  min={minDateTime}
                  {...register("fechaHora", {
                    required: "La fecha y hora son requeridas",
                  })}
                />
                {errors.fechaHora && <p className="text-xs text-destructive">{errors.fechaHora.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo de la consulta *</Label>
                <Textarea
                  id="motivo"
                  placeholder="Describe brevemente el motivo de tu consulta..."
                  rows={4}
                  {...register("motivo", {
                    required: "El motivo es requerido",
                    minLength: {
                      value: 10,
                      message: "El motivo debe tener al menos 10 caracteres",
                    },
                  })}
                />
                {errors.motivo && <p className="text-xs text-destructive">{errors.motivo.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/citas">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
              {isPaciente() ? "Solicitar cita" : "Crear cita"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
