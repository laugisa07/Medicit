"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LoadingPage } from "@/components/ui/loading-spinner"
import { ArrowLeft, Pencil, User, FileText } from "lucide-react"
import Link from "next/link"
import type { Antecedente, Usuario } from "@/lib/types"

export default function AntecedenteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canEdit } = useAuth()
  const { toast } = useToast()
  const antecedenteId = Number(params.id)

  const [antecedente, setAntecedente] = useState<Antecedente | null>(null)
  const [paciente, setPaciente] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const antecedenteData = await api.getAntecedente(antecedenteId)
        setAntecedente(antecedenteData)

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
  }, [antecedenteId, router, toast])

  if (isLoading) {
    return (
      <DashboardLayout title="Detalle de Antecedente">
        <LoadingPage />
      </DashboardLayout>
    )
  }

  if (!antecedente) {
    return (
      <DashboardLayout title="Detalle de Antecedente">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Antecedente no encontrado</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Detalle de Antecedente">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/medico">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Antecedente #{antecedente.idAntecedente}</h2>
              <p className="text-muted-foreground">{antecedente.antecedente || "General"}</p>
            </div>
          </div>
          {canEdit("modulo_medico") && (
            <Button asChild>
              <Link href={`/dashboard/medico/antecedentes/${antecedenteId}/editar`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          )}
        </div>

        {paciente && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Nombre</dt>
                  <dd>
                    {paciente.nombres} {paciente.apellidos}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Correo</dt>
                  <dd>{paciente.correo}</dd>
                </div>
              </dl>
              <Button variant="outline" size="sm" className="mt-4 bg-transparent" asChild>
                <Link href={`/dashboard/usuarios/${paciente.idUsuario}`}>Ver perfil completo</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Descripción del antecedente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{antecedente.descripcion}</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
