"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner, LoadingPage } from "@/components/ui/loading-spinner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { User, Phone, Mail, Lock, Save, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import type { Telefono, Correo } from "@/lib/types"

interface ProfileFormData {
  nombres: string
  apellidos: string
  correo: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ConfiguracionPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [telefonos, setTelefonos] = useState<Telefono[]>([])
  const [correos, setCorreos] = useState<Correo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: "telefono" | "correo" | null
    id: number | null
  }>({ open: false, type: null, id: null })
  const [addTelefono, setAddTelefono] = useState("")
  const [addCorreo, setAddCorreo] = useState("")

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      nombres: user?.nombres || "",
      apellidos: user?.apellidos || "",
      correo: user?.correo || "",
    },
  })

  const passwordForm = useForm<PasswordFormData>()
  const newPassword = passwordForm.watch("newPassword")

  useEffect(() => {
    if (user) {
      profileForm.setValue("nombres", user.nombres)
      profileForm.setValue("apellidos", user.apellidos)
      profileForm.setValue("correo", user.correo || "")
      loadContactData()
    }
  }, [user])

  const loadContactData = async () => {
    if (!user) return
    try {
      const [allTelefonos, allCorreos] = await Promise.all([api.getTelefonos(), api.getCorreos()])
      setTelefonos(allTelefonos.filter((t) => t.usuario?.idUsuario === user.idUsuario || t.idUsuario === user.idUsuario))
      setCorreos(allCorreos.filter((c) => c.usuario?.idUsuario === user.idUsuario || c.idUsuario === user.idUsuario))
    } catch (error: unknown) {
      const err = error as { message?: string; mensaje?: string; status?: number }
      console.error("Error loading contact data:", {
        message: err.message || err.mensaje || "Error desconocido",
        status: err.status,
        fullError: error,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      await api.actualizarUsuario(user.idUsuario, {
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: data.correo,
      })
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar tu información",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      await api.cambiarContrasenia(user.idUsuario, data.newPassword)
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente",
      })
      passwordForm.reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cambiar la contraseña",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTelefono = async () => {
    if (!user || !addTelefono.trim()) return
    try {
      await api.crearTelefono({ 
        numero: addTelefono, 
        usuario: { idUsuario: user.idUsuario }
      })
      toast({ title: "Teléfono agregado" })
      setAddTelefono("")
      loadContactData()
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo agregar el teléfono" })
    }
  }

  const handleAddCorreo = async () => {
    if (!user || !addCorreo.trim()) return
    try {
      await api.crearCorreo({ 
        correo: addCorreo, 
        usuario: { idUsuario: user.idUsuario }
      })
      toast({ title: "Correo agregado" })
      setAddCorreo("")
      loadContactData()
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo agregar el correo" })
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.type || !deleteDialog.id) return
    try {
      if (deleteDialog.type === "telefono") {
        await api.eliminarTelefono(deleteDialog.id)
      } else {
        await api.eliminarCorreo(deleteDialog.id)
      }
      toast({ title: "Eliminado correctamente" })
      loadContactData()
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar" })
    } finally {
      setDeleteDialog({ open: false, type: null, id: null })
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Configuración">
        <LoadingPage />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Configuración de Cuenta">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Configuración de Cuenta</h2>
          <p className="text-muted-foreground">Gestiona tu información personal, contactos y seguridad</p>
        </div>

        <Tabs defaultValue="perfil">
          <TabsList>
            <TabsTrigger value="perfil" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="contacto" className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="flex items-center gap-1">
              <Lock className="h-4 w-4" />
              Seguridad
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="perfil" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tu información básica</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombres">Nombres</Label>
                      <Input id="nombres" {...profileForm.register("nombres")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellidos">Apellidos</Label>
                      <Input id="apellidos" {...profileForm.register("apellidos")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo electrónico</Label>
                    <Input id="correo" type="email" {...profileForm.register("correo")} />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                      Guardar cambios
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contacto" className="mt-6 space-y-6">
            {/* Telefonos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Teléfonos
                </CardTitle>
                <CardDescription>Gestiona tus números de teléfono</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nuevo teléfono"
                    value={addTelefono}
                    onChange={(e) => setAddTelefono(e.target.value)}
                  />
                  <Button onClick={handleAddTelefono}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                {telefonos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay teléfonos registrados</p>
                ) : (
                  <div className="space-y-2">
                    {telefonos.map((tel, idx) => (
                      <div key={tel.idTelefono || idx} className="flex items-center justify-between p-3 rounded-lg border">
                        <span>{tel.numero}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDialog({ open: true, type: "telefono", id: tel.idTelefono || 0 })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Correos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Correos adicionales
                </CardTitle>
                <CardDescription>Gestiona tus correos alternativos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Nuevo correo"
                    value={addCorreo}
                    onChange={(e) => setAddCorreo(e.target.value)}
                  />
                  <Button onClick={handleAddCorreo}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                {correos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay correos adicionales registrados
                  </p>
                ) : (
                  <div className="space-y-2">
                    {correos.map((corr, idx) => (
                      <div key={corr.idCorreo || idx} className="flex items-center justify-between p-3 rounded-lg border">
                        <span>{corr.correo}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDialog({ open: true, type: "correo", id: corr.idCorreo || 0 })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="seguridad" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        {...passwordForm.register("newPassword", {
                          required: "Requerido",
                          minLength: { value: 6, message: "Mínimo 6 caracteres" },
                        })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      {...passwordForm.register("confirmPassword", {
                        required: "Requerido",
                        validate: (value) => value === newPassword || "Las contraseñas no coinciden",
                      })}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <Lock className="mr-2 h-4 w-4" />}
                      Cambiar contraseña
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Confirmar eliminación"
        description="¿Estás seguro de que deseas eliminar este registro?"
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  )
}
