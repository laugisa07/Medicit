"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface CorreoFormData {
  correo: string
}

export default function CrearCorreoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const userId = Number(params.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CorreoFormData>()

  const onSubmit = async (data: CorreoFormData) => {
    setIsSubmitting(true)
    try {
      await api.crearCorreo({
        correo: data.correo,
        usuario: { idUsuario: userId },
      })
      toast({
        title: "Correo agregado",
        description: "El correo ha sido agregado correctamente",
      })
      router.push(`/dashboard/usuarios/${userId}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar el correo",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Agregar Correo">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/usuarios/${userId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold">Agregar correo</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo correo</CardTitle>
            <CardDescription>Agrega un correo adicional al usuario</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="correo">Correo electrónico *</Label>
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

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/dashboard/usuarios/${userId}`}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                  Guardar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
