"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner, LoadingPage } from "@/components/ui/loading-spinner"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import type { Usuario } from "@/lib/types"

interface AntecedenteFormData {
  idPaciente: string
  tipo: string
  descripcion: string
}

export default function CrearAntecedentePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const preselectedPaciente = searchParams.get("paciente")

  const [pacientes, setPacientes] = useState<Usuario[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AntecedenteFormData>({
    defaultValues: {
      idPaciente: preselectedPaciente || "",
    },
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const usuarios = await api.getUsuarios()
        const pacientesList = usuarios.filter((u) => {
          // Manejar tanto estructura plana como anidada
          const rol = typeof u.nombreRol === 'string' ? u.nombreRol : u.rol?.nombreRol || u.nombreRol
          return rol?.toLowerCase() === "paciente"
        })
        setPacientes(pacientesList)

        if (preselectedPaciente) {
          setValue("idPaciente", preselectedPaciente)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los pacientes",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [preselectedPaciente, setValue, toast])

  const onSubmit = async (data: AntecedenteFormData) => {
    setIsSubmitting(true)
    try {
      await api.crearAntecedente({
        idPaciente: Number(data.idPaciente),
        tipo: data.tipo || undefined,
        descripcion: data.descripcion,
      })

      toast({
        title: "Antecedente creado",
        description: "El antecedente ha sido creado correctamente",
      })

      if (preselectedPaciente) {
        router.push(`/dashboard/usuarios/${preselectedPaciente}`)
      } else {
        router.push("/dashboard/medico")
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "No se pudo crear el antecedente",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingData) {
    return (
      <DashboardLayout title="Nuevo Antecedente">
        <LoadingPage />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Nuevo Antecedente">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={preselectedPaciente ? `/dashboard/usuarios/${preselectedPaciente}` : "/dashboard/medico"}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Nuevo antecedente médico</h2>
            <p className="text-muted-foreground">Registra un nuevo antecedente para un paciente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del antecedente</CardTitle>
              <CardDescription>Completa los datos del antecedente médico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idPaciente">Paciente *</Label>
                <Select
                  defaultValue={preselectedPaciente || ""}
                  onValueChange={(val) => setValue("idPaciente", val)}
                  disabled={!!preselectedPaciente}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map((paciente) => (
                      <SelectItem key={paciente.idUsuario} value={String(paciente.idUsuario)}>
                        {paciente.nombres} {paciente.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.idPaciente && <p className="text-xs text-destructive">{errors.idPaciente.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de antecedente</Label>
                <Input id="tipo" placeholder="Ej: Alergia, Cirugía, Enfermedad crónica..." {...register("tipo")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el antecedente médico..."
                  rows={5}
                  {...register("descripcion", {
                    required: "La descripción es requerida",
                    minLength: {
                      value: 10,
                      message: "La descripción debe tener al menos 10 caracteres",
                    },
                  })}
                />
                {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href={preselectedPaciente ? `/dashboard/usuarios/${preselectedPaciente}` : "/dashboard/medico"}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar antecedente
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
