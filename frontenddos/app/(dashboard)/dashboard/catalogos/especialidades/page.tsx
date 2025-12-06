"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus, Pencil, Trash2, ArrowLeft, Stethoscope } from "lucide-react"
import Link from "next/link"
import type { Especialidad } from "@/lib/types"

export default function EspecialidadesPage() {
  const { canCreate, canEdit, canDelete } = useAuth()
  const { toast } = useToast()

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    especialidad: Especialidad | null
  }>({ open: false, especialidad: null })
  const [formDialog, setFormDialog] = useState<{
    open: boolean
    especialidad: Especialidad | null
    nombre: string
  }>({ open: false, especialidad: null, nombre: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadEspecialidades = async () => {
    try {
      const data = await api.getEspecialidades()
      setEspecialidades(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las especialidades",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEspecialidades()
  }, [])

  const handleSubmit = async () => {
    if (!formDialog.nombre.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre de la especialidad es requerido",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (formDialog.especialidad) {
        await api.actualizarEspecialidad(formDialog.especialidad.idEspecialidad, formDialog.nombre)
        toast({ title: "Especialidad actualizada" })
      } else {
        await api.crearEspecialidad(formDialog.nombre)
        toast({ title: "Especialidad creada" })
      }
      loadEspecialidades()
      setFormDialog({ open: false, especialidad: null, nombre: "" })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la especialidad",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.especialidad) return

    try {
      await api.eliminarEspecialidad(deleteDialog.especialidad.idEspecialidad)
      toast({ title: "Especialidad eliminada" })
      loadEspecialidades()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la especialidad",
      })
    } finally {
      setDeleteDialog({ open: false, especialidad: null })
    }
  }

  const columns = [
    { key: "idEspecialidad", header: "ID", searchable: false },
    { key: "nombreEspecialidad", header: "Nombre de la Especialidad" },
  ]

  return (
    <DashboardLayout title="Especialidades">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/catalogos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Stethoscope className="h-6 w-6" />
              Especialidades Médicas
            </h2>
            <p className="text-muted-foreground">Gestiona las especialidades médicas del sistema</p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Listado de Especialidades</CardTitle>
              <CardDescription>Especialidades disponibles para asignar a médicos</CardDescription>
            </div>
            {canCreate("modulo_catalogos") && (
              <Button onClick={() => setFormDialog({ open: true, especialidad: null, nombre: "" })}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva especialidad
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <DataTable
              data={especialidades as unknown as Record<string, unknown>[]}
              columns={columns}
              isLoading={isLoading}
              searchPlaceholder="Buscar especialidad..."
              actions={(item: Record<string, unknown>) => {
                const especialidad = item as unknown as Especialidad
                return (
                  <div className="flex items-center justify-end gap-2">
                    {canEdit("modulo_catalogos") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setFormDialog({
                            open: true,
                            especialidad,
                            nombre: especialidad.nombreEspecialidad,
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete("modulo_catalogos") && (
                      <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, especialidad })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                )
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={formDialog.open} onOpenChange={(open) => setFormDialog({ ...formDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formDialog.especialidad ? "Editar especialidad" : "Nueva especialidad"}</DialogTitle>
            <DialogDescription>
              {formDialog.especialidad ? "Modifica el nombre de la especialidad" : "Crea una nueva especialidad médica"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombreEspecialidad">Nombre de la especialidad</Label>
              <Input
                id="nombreEspecialidad"
                value={formDialog.nombre}
                onChange={(e) => setFormDialog({ ...formDialog, nombre: e.target.value })}
                placeholder="Ej: Cardiología, Pediatría, Neurología..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialog({ open: false, especialidad: null, nombre: "" })}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              {formDialog.especialidad ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Eliminar especialidad"
        description={`¿Estás seguro de que deseas eliminar la especialidad "${deleteDialog.especialidad?.nombreEspecialidad}"?`}
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  )
}
