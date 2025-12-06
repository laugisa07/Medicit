"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner, LoadingPage } from "@/components/ui/loading-spinner"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import type { Antecedente, Usuario } from "@/lib/types"

interface AntecedenteFormData {
  antecedente: string
  descripcion: string
}

export default function EditarAntecedentePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const antecedenteId = Number(params.id)

  const [antecedente, setAntecedente] = useState<Antecedente | null>(null)
  const [paciente, setPaciente] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AntecedenteFormData>()

  useEffect(() => {
    const loadData = async () => {
      try {
        const antecedenteData = await api.getAntecedente(antecedenteId)
        setAntecedente(antecedenteData)
        setValue("antecedente", antecedenteData.antecedente || "")
        setValue("descripcion", antecedenteData.descripcion || "")

        // Obtener paciente del objeto usuario anidado o por ID
        if (antecedenteData.usuario) {
          setPaciente(antecedenteData.usuario)
        } else if (antecedenteData.idPaciente) {
          const pacienteData = await api.getUsuario(antecedenteData.idPaciente)
          setPaciente(pacienteData)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el antecedente",
        })
        router.push("/dashboard/medico")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [antecedenteId, router, setValue, toast])

  const onSubmit = async (data: AntecedenteFormData) => {
    setIsSubmitting(true)
    try {
      await api.actualizarAntecedente(antecedenteId, {
        antecedente: data.antecedente || undefined,
        descripcion: data.descripcion,
      })

      toast({
        title: "Antecedente actualizado",
        description: "Los cambios han sido guardados correctamente",
      })
      router.push(`/dashboard/medico/antecedentes/${antecedenteId}`)
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "No se pudo actualizar el antecedente",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Editar Antecedente">
        <LoadingPage />
      </DashboardLayout>
    )
  }

  if (!antecedente) {
    return (
      <DashboardLayout title="Editar Antecedente">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Antecedente no encontrado</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Editar Antecedente">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/medico/antecedentes/${antecedenteId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Editar antecedente</h2>
            {paciente && (
              <p className="text-muted-foreground">
                Paciente: {paciente.nombres} {paciente.apellidos}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del antecedente</CardTitle>
              <CardDescription>Modifica los datos del antecedente médico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="antecedente">Tipo de antecedente</Label>
                <Input id="antecedente" placeholder="Ej: Alergia, Cirugía, Enfermedad crónica..." {...register("antecedente")} />
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
              <Link href={`/dashboard/medico/antecedentes/${antecedenteId}`}>Cancelar</Link>
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
