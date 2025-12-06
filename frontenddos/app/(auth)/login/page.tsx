"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Heart } from "lucide-react"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [prefilledUsername, setPrefilledUsername] = useState("")
  const router = useRouter()

  const handleRegisterSuccess = (username: string) => {
    setPrefilledUsername(username)
    setActiveTab("login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 bg-primary rounded-lg">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Medicit</h1>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Bienvenido</CardTitle>
            <CardDescription>Sistema de gestión de citas médicas - Laura Alvarenga AI100123</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarme</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <LoginForm prefilledUsername={prefilledUsername} />
              </TabsContent>

              <TabsContent value="register" className="mt-4">
                <RegisterForm onSuccess={handleRegisterSuccess} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Solo los pacientes pueden registrarse aquí.
          <br />
          Médicos y administradores son creados por el administrador.
        </p>
      </div>
    </div>
  )
}
