"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Eye, EyeOff, LogIn } from "lucide-react"

interface LoginFormData {
  nombreUsuario: string
  contrasenia: string
}

interface LoginFormProps {
  prefilledUsername?: string
}

export function LoginForm({ prefilledUsername = "" }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      nombreUsuario: prefilledUsername,
      contrasenia: "",
    },
  })

  useEffect(() => {
    if (prefilledUsername) {
      setValue("nombreUsuario", prefilledUsername)
    }
  }, [prefilledUsername, setValue])

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      await login(data)
      toast({
        title: "Bienvenido",
        description: "Has iniciado sesión correctamente",
      })
      router.push("/dashboard")
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number }
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: err.message || "Usuario o contraseña incorrectos",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombreUsuario">Usuario</Label>
        <Input
          id="nombreUsuario"
          placeholder="Ingresa tu usuario"
          {...register("nombreUsuario", { required: "El usuario es requerido" })}
        />
        {errors.nombreUsuario && <p className="text-sm text-destructive">{errors.nombreUsuario.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contrasenia">Contraseña</Label>
        <div className="relative">
          <Input
            id="contrasenia"
            type={showPassword ? "text" : "password"}
            placeholder="Ingresa tu contraseña"
            {...register("contrasenia", { required: "La contraseña es requerida" })}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
          </Button>
        </div>
        {errors.contrasenia && <p className="text-sm text-destructive">{errors.contrasenia.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <LogIn className="mr-2 h-4 w-4" />}
        Iniciar sesión
      </Button>
    </form>
  )
}
