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
import { Plus, Pencil, Trash2, HelpCircle } from "lucide-react"
import type { Pregunta } from "@/lib/types"

export default function PreguntasPage() {
  const { canCreate, canEdit, canDelete } = useAuth()
  const { toast } = useToast()

  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; pregunta: Pregunta | null }>({
    open: false,
    pregunta: null,
  })
  const [formDialog, setFormDialog] = useState<{
    open: boolean
    pregunta: Pregunta | null
    texto: string
  }>({ open: false, pregunta: null, texto: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadPreguntas = async () => {
    try {
      const data = await api.getPreguntas()
      setPreguntas(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las preguntas",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPreguntas()
  }, [])

  const handleSubmit = async () => {
    if (!formDialog.texto.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La pregunta es requerida",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (formDialog.pregunta) {
        await api.actualizarPregunta(formDialog.pregunta.idPregunta, formDialog.texto)
        toast({ title: "Pregunta actualizada" })
      } else {
        await api.crearPregunta(formDialog.texto)
        toast({ title: "Pregunta creada" })
      }
      loadPreguntas()
      setFormDialog({ open: false, pregunta: null, texto: "" })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la pregunta",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.pregunta) return

    try {
      await api.eliminarPregunta(deleteDialog.pregunta.idPregunta)
      toast({ title: "Pregunta eliminada" })
      loadPreguntas()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la pregunta",
      })
    } finally {
      setDeleteDialog({ open: false, pregunta: null })
    }
  }

  const columns = [
    { key: "idPregunta", header: "ID", searchable: false },
    { key: "pregunta", header: "Pregunta" },
  ]

  return (
    <DashboardLayout title="Preguntas de Seguridad">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Preguntas de Seguridad
            </CardTitle>
            <CardDescription>Gestiona las preguntas de seguridad para recuperación de cuenta</CardDescription>
          </div>
          {canCreate("modulo_administrativo") && (
            <Button onClick={() => setFormDialog({ open: true, pregunta: null, texto: "" })}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva pregunta
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <DataTable
            data={preguntas}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Buscar pregunta..."
            actions={(pregunta: Pregunta) => (
              <div className="flex items-center justify-end gap-2">
                {canEdit("modulo_administrativo") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormDialog({ open: true, pregunta, texto: pregunta.pregunta })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {canDelete("modulo_administrativo") && (
                  <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, pregunta })}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formDialog.open} onOpenChange={(open) => setFormDialog({ ...formDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formDialog.pregunta ? "Editar pregunta" : "Nueva pregunta"}</DialogTitle>
            <DialogDescription>
              {formDialog.pregunta ? "Modifica el texto de la pregunta" : "Crea una nueva pregunta de seguridad"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pregunta">Pregunta</Label>
              <Input
                id="pregunta"
                value={formDialog.texto}
                onChange={(e) => setFormDialog({ ...formDialog, texto: e.target.value })}
                placeholder="Ej: ¿Cuál es el nombre de tu mascota?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialog({ open: false, pregunta: null, texto: "" })}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              {formDialog.pregunta ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Eliminar pregunta"
        description="¿Estás seguro de que deseas eliminar esta pregunta de seguridad?"
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  )
}
