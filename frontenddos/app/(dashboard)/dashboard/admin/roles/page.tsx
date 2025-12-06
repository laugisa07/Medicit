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
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Rol } from "@/lib/types"

export default function RolesPage() {
  const { canCreate, canEdit, canDelete } = useAuth()
  const { toast } = useToast()

  const [roles, setRoles] = useState<Rol[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; rol: Rol | null }>({
    open: false,
    rol: null,
  })
  const [formDialog, setFormDialog] = useState<{
    open: boolean
    rol: Rol | null
    nombreRol: string
  }>({ open: false, rol: null, nombreRol: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadRoles = async () => {
    try {
      const data = await api.getRoles()
      setRoles(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los roles",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const handleSubmit = async () => {
    if (!formDialog.nombreRol.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre del rol es requerido",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (formDialog.rol) {
        await api.actualizarRol(formDialog.rol.idRol, formDialog.nombreRol)
        toast({ title: "Rol actualizado", description: "El rol ha sido actualizado correctamente" })
      } else {
        await api.crearRol(formDialog.nombreRol)
        toast({ title: "Rol creado", description: "El rol ha sido creado correctamente" })
      }
      loadRoles()
      setFormDialog({ open: false, rol: null, nombreRol: "" })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el rol",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.rol) return

    try {
      await api.eliminarRol(deleteDialog.rol.idRol)
      toast({ title: "Rol eliminado", description: "El rol ha sido eliminado correctamente" })
      loadRoles()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el rol",
      })
    } finally {
      setDeleteDialog({ open: false, rol: null })
    }
  }

  const columns = [
    { key: "idRol", header: "ID", searchable: false },
    { key: "nombreRol", header: "Nombre del Rol" },
  ]

  return (
    <DashboardLayout title="Gestión de Roles">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Roles</h2>
            <p className="text-muted-foreground">Gestiona los roles del sistema</p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Listado de Roles</CardTitle>
              <CardDescription>Roles disponibles en el sistema</CardDescription>
            </div>
            {canCreate("modulo_catalogos") && (
              <Button onClick={() => setFormDialog({ open: true, rol: null, nombreRol: "" })}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo rol
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <DataTable
              data={roles as unknown as Record<string, unknown>[]}
              columns={columns}
              isLoading={isLoading}
              searchPlaceholder="Buscar rol..."
              actions={(item: Record<string, unknown>) => {
                const rol = item as unknown as Rol
                return (
                  <div className="flex items-center justify-end gap-2">
                    {canEdit("modulo_catalogos") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFormDialog({ open: true, rol, nombreRol: rol.nombreRol })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete("modulo_catalogos") && (
                      <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, rol })}>
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
            <DialogTitle>{formDialog.rol ? "Editar rol" : "Nuevo rol"}</DialogTitle>
            <DialogDescription>
              {formDialog.rol ? "Modifica el nombre del rol" : "Crea un nuevo rol en el sistema"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombreRol">Nombre del rol</Label>
              <Input
                id="nombreRol"
                value={formDialog.nombreRol}
                onChange={(e) => setFormDialog({ ...formDialog, nombreRol: e.target.value })}
                placeholder="Ej: Administrador, Médico, Paciente..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialog({ open: false, rol: null, nombreRol: "" })}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              {formDialog.rol ? "Guardar cambios" : "Crear rol"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Eliminar rol"
        description={`¿Estás seguro de que deseas eliminar el rol "${deleteDialog.rol?.nombreRol}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  )
}
