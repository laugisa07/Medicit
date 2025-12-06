"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LoadingPage, LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import type { Rol, Permiso } from "@/lib/types"

const MODULOS = [
  { key: "modulo_dashboard", label: "Dashboard", editable: true },
  { key: "modulo_inicio", label: "Inicio", editable: true },
  { key: "modulo_usuarios", label: "Gestión de Usuarios", editable: true },
  { key: "modulo_citas", label: "Gestión de Citas", editable: true },
  { key: "modulo_medico", label: "Gestión Médica", editable: true },
  { key: "modulo_administrativo", label: "Gestión Administrativa (Permisos)", editable: true },
  { key: "modulo_catalogos", label: "Catálogos (Roles/Estados/Especialidades)", editable: true },
  { key: "modulo_configuracion", label: "Configuración Personal", editable: true },
]

export default function PermisosPage() {
  const { canEdit } = useAuth()
  const { toast } = useToast()

  const [roles, setRoles] = useState<Rol[]>([])
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [selectedRol, setSelectedRol] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [localPermisos, setLocalPermisos] = useState<Record<string, Permiso>>({})

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rolesData, permisosData] = await Promise.all([api.getRoles(), api.getPermisos()])
        setRoles(rolesData || [])
        setPermisos(permisosData || [])
        if (rolesData && rolesData.length > 0) {
          setSelectedRol(String(rolesData[0].idRol))
        }
      } catch (error: unknown) {
        const err = error as { message?: string; mensaje?: string }
        toast({
          variant: "destructive",
          title: "Error",
          description: err.mensaje || err.message || "No se pudieron cargar los datos",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  useEffect(() => {
    if (selectedRol) {
      const rolPermisos = permisos.filter((p) => p.idRol === Number(selectedRol))
      const permisosMap: Record<string, Permiso> = {}

      MODULOS.forEach((modulo) => {
        const existingPermiso = rolPermisos.find((p) => p.modulo === modulo.key)
        if (existingPermiso) {
          permisosMap[modulo.key] = existingPermiso
        } else {
          permisosMap[modulo.key] = {
            idPermiso: 0,
            idRol: Number(selectedRol),
            modulo: modulo.key,
            ver: false,
            crear: false,
            editar: false,
            eliminar: false,
            descargar: false,
          }
        }
      })

      setLocalPermisos(permisosMap)
    }
  }, [selectedRol, permisos])

  const handlePermisoChange = (modulo: string, campo: keyof Permiso, value: boolean) => {
    setLocalPermisos((prev) => ({
      ...prev,
      [modulo]: {
        ...prev[modulo],
        [campo]: value,
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      for (const [modulo, permiso] of Object.entries(localPermisos)) {
        if (permiso.idPermiso) {
          // Actualizar permiso existente con estructura completa
          await api.actualizarPermiso(permiso.idPermiso, {
            modulo,
            ver: permiso.ver,
            crear: permiso.crear,
            editar: permiso.editar,
            eliminar: permiso.eliminar,
            descargar: permiso.descargar,
            rol: { idRol: Number(selectedRol) },
          } as any)
        } else {
          // Crear nuevo permiso
          await api.crearPermiso({
            modulo,
            ver: permiso.ver,
            crear: permiso.crear,
            editar: permiso.editar,
            eliminar: permiso.eliminar,
            descargar: permiso.descargar,
            rol: { idRol: Number(selectedRol) },
          } as any)
        }
      }

      // Reload permisos
      const newPermisos = await api.getPermisos()
      setPermisos(newPermisos)

      toast({
        title: "Permisos guardados",
        description: "Los permisos han sido actualizados correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los permisos",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Gestión de Permisos">
        <LoadingPage />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Gestión de Permisos">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Permisos</h2>
            <p className="text-muted-foreground">Configura los permisos por rol y módulo</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Matriz de Permisos</CardTitle>
            <CardDescription>Selecciona un rol y configura sus permisos por módulo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <strong>Nota:</strong> El administrador puede editar todos los permisos. Los módulos "Gestión Administrativa" y "Catálogos" pueden ser editados para asignar permisos a otros roles.
            </div>
            <Tabs value={selectedRol} onValueChange={setSelectedRol}>
              <TabsList className="flex-wrap h-auto">
                {roles.map((rol) => (
                  <TabsTrigger key={rol.idRol} value={String(rol.idRol)}>
                    {rol.nombreRol}
                  </TabsTrigger>
                ))}
              </TabsList>

              {roles.map((rol) => (
                <TabsContent key={rol.idRol} value={String(rol.idRol)} className="mt-6">
                  <div className="space-y-6">
                    {MODULOS.map((modulo) => {
                      const permiso = localPermisos[modulo.key]
                      if (!permiso) return null

                      return (
                        <div key={modulo.key} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-4">{modulo.label}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {(["ver", "crear", "editar", "eliminar", "descargar"] as const).map((campo) => (
                              <div key={campo} className="flex items-center gap-2">
                                <Switch
                                  id={`${modulo.key}-${campo}`}
                                  checked={permiso[campo]}
                                  onCheckedChange={(checked) => handlePermisoChange(modulo.key, campo, checked)}
                                  disabled={!canEdit("modulo_administrativo")}
                                />
                                <Label htmlFor={`${modulo.key}-${campo}`} className="capitalize">
                                  {campo}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}

                    {canEdit("modulo_administrativo") && (
                      <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                          Guardar permisos
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
