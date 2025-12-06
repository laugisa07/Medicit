"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api, getNombreRol, normalizeUsuario } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Usuario } from "@/lib/types"

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; usuario: Usuario | null }>({
    open: false,
    usuario: null,
  })
  const { canCreate, canEdit, canDelete } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const loadUsuarios = async () => {
    try {
      const data = await api.getUsuarios()
      // Normalizar usuarios para que tengan estructura plana
      const normalized = data.map(normalizeUsuario)
      setUsuarios(normalized)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los usuarios",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsuarios()
  }, [])

  const handleDelete = async () => {
    if (!deleteDialog.usuario) return

    try {
      await api.eliminarUsuario(deleteDialog.usuario.idUsuario)
      toast({
        title: "Usuario desactivado",
        description: "El usuario ha sido desactivado correctamente",
      })
      loadUsuarios()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo desactivar el usuario",
      })
    } finally {
      setDeleteDialog({ open: false, usuario: null })
    }
  }

  const columns = [
    { key: "idUsuario", header: "ID", searchable: false },
    { key: "nombreUsuario", header: "Usuario" },
    { key: "nombres", header: "Nombres" },
    { key: "apellidos", header: "Apellidos" },
    { key: "correo", header: "Correo" },
    { key: "nombreRol", header: "Rol" },
    {
      key: "nombreEstado",
      header: "Estado",
      render: (usuario: any) => <StatusBadge status={usuario.nombreEstado || ""} />,
    },
  ]

  return (
    <DashboardLayout title="Gestión de Usuarios">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Administra los usuarios del sistema: pacientes, médicos y personal</CardDescription>
          </div>
          {canCreate("modulo_usuarios") && (
            <Button asChild>
              <Link href="/dashboard/usuarios/crear">
                <Plus className="mr-2 h-4 w-4" />
                Crear usuario
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <DataTable
            data={usuarios as unknown as Record<string, unknown>[]}
            columns={columns as any}
            isLoading={isLoading}
            searchPlaceholder="Buscar por usuario, nombre, apellido o correo..."
            actions={(item: any) => {
              const usuario = item as Usuario
              return (
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/usuarios/${usuario.idUsuario}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver</span>
                    </Link>
                  </Button>
                  {canEdit("modulo_usuarios") && (
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/usuarios/${usuario.idUsuario}/editar`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Link>
                    </Button>
                  )}
                  {canDelete("modulo_usuarios") && (
                    <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, usuario })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Desactivar</span>
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
        onOpenChange={(open) => setDeleteDialog({ open, usuario: deleteDialog.usuario })}
        title="Desactivar usuario"
        description={`¿Estás seguro de que deseas desactivar al usuario "${deleteDialog.usuario?.nombreUsuario}"? Esta acción puede revertirse.`}
        confirmText="Desactivar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  )
}
