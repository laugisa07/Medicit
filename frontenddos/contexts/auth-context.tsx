"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { UserData, LoginPayload } from "@/lib/types"
import { api } from "@/lib/api"

interface AuthContextType {
  user: UserData | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
  canView: (modulo: string) => boolean
  canCreate: (modulo: string) => boolean
  canEdit: (modulo: string) => boolean
  canDelete: (modulo: string) => boolean
  canDownload: (modulo: string) => boolean
  isPaciente: () => boolean
  isMedico: () => boolean
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "medicit_user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const userData = JSON.parse(stored)
        console.log("User recuperado del localStorage:", userData)
        setUser(userData)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await api.login(payload)
    console.log("Login response:", response)
    setUser(response)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const getPermiso = useCallback(
    (modulo: string) => {
      if (!user?.permisos) return null
      // Convertir de snake_case a camelCase si es necesario
      const moduloKey = modulo
        .toLowerCase()
        .replace(/_([a-z])/g, (_, char) => char.toUpperCase())
      return user.permisos[moduloKey] || null
    },
    [user],
  )

  const canView = useCallback((modulo: string) => getPermiso(modulo)?.ver ?? false, [getPermiso])
  const canCreate = useCallback((modulo: string) => getPermiso(modulo)?.crear ?? false, [getPermiso])
  const canEdit = useCallback((modulo: string) => getPermiso(modulo)?.editar ?? false, [getPermiso])
  const canDelete = useCallback((modulo: string) => getPermiso(modulo)?.eliminar ?? false, [getPermiso])
  const canDownload = useCallback((modulo: string) => getPermiso(modulo)?.descargar ?? false, [getPermiso])

  const isPaciente = useCallback(() => user?.nombreRol?.toLowerCase() === "paciente", [user])
  const isMedico = useCallback(
    () => user?.nombreRol?.toLowerCase() === "medico" || user?.nombreRol?.toLowerCase() === "médico",
    [user],
  )
  const isAdmin = useCallback(
    () => user?.nombreRol?.toLowerCase() === "administrador" || user?.nombreRol?.toLowerCase() === "admin",
    [user],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        canView,
        canCreate,
        canEdit,
        canDelete,
        canDownload,
        isPaciente,
        isMedico,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}
