"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Plus, Eye, Pencil, Trash2, Stethoscope } from "lucide-react"
import Link from "next/link"
import type { Antecedente, Usuario } from "@/lib/types"

export default function GestionMedicaPage() {
  const { canCreate, canEdit, canDelete } = useAuth()
  const { toast } = useToast()

  const [antecedentes, setAntecedentes] = useState<Antecedente[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    antecedente: Antecedente | null
  }>({ open: false, antecedente: null })

  const loadData = async () => {
    try {
      const [antecedentesData, usuariosData] = await Promise.all([api.getAntecedentes(), api.getUsuarios()])
      setAntecedentes(antecedentesData)
      setUsuarios(usuariosData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los antecedentes",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getPacienteNombre = (antecedente: Antecedente) => {
    if (antecedente.usuario) {
      return `${antecedente.usuario.nombres} ${antecedente.usuario.apellidos}`
    }
    const idPaciente = antecedente.idPaciente
    if (!idPaciente) return "Desconocido"
    const paciente = usuarios.find((u) => u.idUsuario === idPaciente)
    return paciente ? `${paciente.nombres} ${paciente.apellidos}` : "Desconocido"
  }

  const handleDelete = async () => {
    if (!deleteDialog.antecedente) return

    try {
      await api.eliminarAntecedente(deleteDialog.antecedente.idAntecedente)
      toast({
        title: "Antecedente eliminado",
        description: "El antecedente ha sido eliminado correctamente",
      })
      loadData()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el antecedente",
      })
    } finally {
      setDeleteDialog({ open: false, antecedente: null })
    }
  }

  const columns = [
    { key: "idAntecedente", header: "ID", searchable: false },
    {
      key: "paciente",
      header: "Paciente",
      render: (ant: Antecedente) => getPacienteNombre(ant),
    },
    { key: "antecedente", header: "Tipo", render: (ant: Antecedente) => ant.antecedente || "General" },
    {
      key: "descripcion",
      header: "Descripción",
      render: (ant: Antecedente) => {
        const desc = ant.descripcion || ""
        return desc.length > 50 ? `${desc.substring(0, 50)}...` : desc
      },
    },
  ]

  return (
    <DashboardLayout title="Gestión Médica">
      <div className="space-y-6">
        {/* Botón de navegación a Especialidades */}
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/medico/especialidades">
              <Stethoscope className="mr-2 h-4 w-4" />
              Gestionar Especialidades de Médicos
            </Link>
          </Button>
        </div>

        {/* Card de Antecedentes */}
        <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Antecedentes Médicos
            </CardTitle>
            <CardDescription>Gestiona los antecedentes e historial clínico de los pacientes</CardDescription>
          </div>
          {canCreate("modulo_medico") && (
            <Button asChild>
              <Link href="/dashboard/medico/antecedentes/crear">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo antecedente
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <DataTable
            data={antecedentes as unknown as Record<string, unknown>[]}
            columns={columns as any}
            isLoading={isLoading}
            searchPlaceholder="Buscar por tipo o descripción..."
            actions={(item: any) => {
              const antecedente = item as Antecedente
              return (
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/medico/antecedentes/${antecedente.idAntecedente}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver</span>
                    </Link>
                  </Button>
                  {canEdit("modulo_medico") && (
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/medico/antecedentes/${antecedente.idAntecedente}/editar`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Link>
                    </Button>
                  )}
                  {canDelete("modulo_medico") && (
                    <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, antecedente })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  )}
                </div>
              )
            }}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Eliminar antecedente"
        description="¿Estás seguro de que deseas eliminar este antecedente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
      </div>
    </DashboardLayout>
  )
}
