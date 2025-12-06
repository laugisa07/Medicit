"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LoadingPage, LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, Stethoscope, Settings } from "lucide-react"
import Link from "next/link"
import type { Usuario, Especialidad } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function MedicoEspecialidadesPage() {
  const { canEdit } = useAuth()
  const { toast } = useToast()

  const [medicos, setMedicos] = useState<Usuario[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMedico, setSelectedMedico] = useState<Usuario | null>(null)
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<number[]>([])

  const loadData = async () => {
    try {
      const [medicosData, especialidadesData] = await Promise.all([
        api.getUsuarios(),
        api.getEspecialidades(),
      ])

      // Filtrar solo médicos
      const medicosList = medicosData.filter((u) => {
        const rol = typeof u.nombreRol === "string" ? u.nombreRol : u.rol?.nombreRol || u.nombreRol
        return rol?.toLowerCase() === "medico" || rol?.toLowerCase() === "médico"
      })

      setMedicos(medicosList)
      setEspecialidades(especialidadesData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenDialog = (medico: Usuario) => {
    setSelectedMedico(medico)
    setSelectedEspecialidades(medico.especialidades?.map((e) => e.idEspecialidad) || [])
    setDialogOpen(true)
  }

  const handleToggleEspecialidad = (idEspecialidad: number) => {
    setSelectedEspecialidades((prev) =>
      prev.includes(idEspecialidad)
        ? prev.filter((id) => id !== idEspecialidad)
        : [...prev, idEspecialidad]
    )
  }

  const handleSaveEspecialidades = async () => {
    if (!selectedMedico) return

    setIsSubmitting(true)
    try {
      await api.asignarEspecialidades(selectedMedico.idUsuario, selectedEspecialidades)
      toast({
        title: "Especialidades asignadas",
        description: "Las especialidades han sido asignadas correctamente",
      })
      loadData()
      setDialogOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron asignar las especialidades",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    { key: "idUsuario", header: "ID", searchable: false },
    {
      key: "nombres",
      header: "Nombre",
      render: (item: Record<string, unknown>) => {
        const medico = item as unknown as Usuario
        return `${medico.nombres} ${medico.apellidos}`
      },
    },
    { key: "nombreUsuario", header: "Usuario" },
    {
      key: "especialidades",
      header: "Especialidades",
      render: (item: Record<string, unknown>) => {
        const medico = item as unknown as Usuario
        return medico.especialidades && medico.especialidades.length > 0
          ? medico.especialidades.map((e) => e.nombreEspecialidad).join(", ")
          : "Sin especialidades"
      },
    },
  ]

  if (isLoading) {
    return (
      <DashboardLayout title="Especialidades de Médicos">
        <LoadingPage />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Especialidades de Médicos">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/medico">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Stethoscope className="h-6 w-6" />
              Especialidades de Médicos
            </h2>
            <p className="text-muted-foreground">Asigna especialidades a los médicos del sistema</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Médicos</CardTitle>
            <CardDescription>Haz clic en el botón de configuración para asignar especialidades</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={medicos as unknown as Record<string, unknown>[]}
              columns={columns}
              isLoading={isLoading}
              searchPlaceholder="Buscar médico..."
              actions={(item: Record<string, unknown>) => {
                const medico = item as unknown as Usuario
                return (
                  <div className="flex items-center justify-end gap-2">
                    {canEdit("modulo_medico") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(medico)}
                        title="Asignar especialidades"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialog para asignar especialidades */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar especialidades</DialogTitle>
            <DialogDescription>
              Selecciona las especialidades para {selectedMedico?.nombres} {selectedMedico?.apellidos}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {especialidades.map((especialidad) => (
              <div key={especialidad.idEspecialidad} className="flex items-center space-x-2">
                <Checkbox
                  id={`esp-${especialidad.idEspecialidad}`}
                  checked={selectedEspecialidades.includes(especialidad.idEspecialidad)}
                  onCheckedChange={() => handleToggleEspecialidad(especialidad.idEspecialidad)}
                />
                <Label
                  htmlFor={`esp-${especialidad.idEspecialidad}`}
                  className="cursor-pointer font-normal"
                >
                  {especialidad.nombreEspecialidad}
                </Label>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEspecialidades} disabled={isSubmitting}>
              {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
