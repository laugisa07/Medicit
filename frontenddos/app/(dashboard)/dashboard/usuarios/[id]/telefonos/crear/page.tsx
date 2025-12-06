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

interface TelefonoFormData {
  numero: string
}

export default function CrearTelefonoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const userId = Number(params.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TelefonoFormData>()

  const onSubmit = async (data: TelefonoFormData) => {
    setIsSubmitting(true)
    try {
      await api.crearTelefono({
        numero: data.numero,
        usuario: { idUsuario: userId },
      })
      toast({
        title: "Teléfono agregado",
        description: "El teléfono ha sido agregado correctamente",
      })
      router.push(`/dashboard/usuarios/${userId}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar el teléfono",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Agregar Teléfono">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/usuarios/${userId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold">Agregar teléfono</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo teléfono</CardTitle>
            <CardDescription>Agrega un número de teléfono al usuario</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Número de teléfono *</Label>
                <Input id="numero" placeholder="0000-0000" {...register("numero", { required: "Requerido" })} />
                {errors.numero && <p className="text-xs text-destructive">{errors.numero.message}</p>}
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
