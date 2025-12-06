"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { StatusBadge } from "@/components/ui/status-badge"
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
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Estado } from "@/lib/types"

export default function EstadosPage() {
  const { canCreate, canEdit, canDelete } = useAuth()
  const { toast } = useToast()

  const [estados, setEstados] = useState<Estado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; estado: Estado | null }>({
    open: false,
    estado: null,
  })
  const [formDialog, setFormDialog] = useState<{
    open: boolean
    estado: Estado | null
    nombreEstado: string
  }>({ open: false, estado: null, nombreEstado: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadEstados = async () => {
    try {
      const data = await api.getEstados()
      setEstados(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los estados",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEstados()
  }, [])

  const handleSubmit = async () => {
    if (!formDialog.nombreEstado.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre del estado es requerido",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (formDialog.estado) {
        await api.actualizarEstado(formDialog.estado.idEstado, formDialog.nombreEstado)
        toast({ title: "Estado actualizado", description: "El estado ha sido actualizado" })
      } else {
        await api.crearEstado(formDialog.nombreEstado)
        toast({ title: "Estado creado", description: "El estado ha sido creado" })
      }
      loadEstados()
      setFormDialog({ open: false, estado: null, nombreEstado: "" })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el estado",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.estado) return

    try {
      await api.eliminarEstado(deleteDialog.estado.idEstado)
      toast({ title: "Estado eliminado", description: "El estado ha sido eliminado" })
      loadEstados()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el estado",
      })
    } finally {
      setDeleteDialog({ open: false, estado: null })
    }
  }

  const columns = [
    { key: "idEstado", header: "ID", searchable: false },
    {
      key: "nombreEstado",
      header: "Estado",
      render: (estado: Estado) => (
        <StatusBadge status={estado.nombreEstado || estado.estado || "Desconocido"} />
      ),
    },
  ]

  return (
    <DashboardLayout title="Gestión de Estados">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Estados</h2>
            <p className="text-muted-foreground">Gestiona los estados de usuarios y citas</p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Listado de Estados</CardTitle>
              <CardDescription>Estados disponibles en el sistema</CardDescription>
            </div>
            {canCreate("modulo_catalogos") && (
              <Button onClick={() => setFormDialog({ open: true, estado: null, nombreEstado: "" })}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo estado
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <DataTable
              data={estados}
              columns={columns}
              isLoading={isLoading}
              searchPlaceholder="Buscar estado..."
              actions={(estado: Estado) => (
                <div className="flex items-center justify-end gap-2">
                  {canEdit("modulo_catalogos") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFormDialog({ open: true, estado, nombreEstado: estado.nombreEstado })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete("modulo_catalogos") && (
                    <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, estado })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={formDialog.open} onOpenChange={(open) => setFormDialog({ ...formDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formDialog.estado ? "Editar estado" : "Nuevo estado"}</DialogTitle>
            <DialogDescription>
              {formDialog.estado ? "Modifica el nombre del estado" : "Crea un nuevo estado"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombreEstado">Nombre del estado</Label>
              <Input
                id="nombreEstado"
                value={formDialog.nombreEstado}
                onChange={(e) => setFormDialog({ ...formDialog, nombreEstado: e.target.value })}
                placeholder="Ej: Activo, Pendiente, Cancelada..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialog({ open: false, estado: null, nombreEstado: "" })}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              {formDialog.estado ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Eliminar estado"
        description={`¿Estás seguro de que deseas eliminar el estado "${deleteDialog.estado?.nombreEstado}"?`}
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  )
}
