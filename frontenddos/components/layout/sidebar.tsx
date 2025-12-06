"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Heart,
  Home,
  Users,
  Calendar,
  Stethoscope,
  Settings,
  Bell,
  Shield,
  BookOpen,
  Tag,
  ChevronLeft,
  Menu,
  LogOut,
  User,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  module?: string
}

const navItems: NavItem[] = [
  { title: "Inicio", href: "/dashboard", icon: Home },
  { title: "Gestión de Usuarios", href: "/dashboard/usuarios", icon: Users, module: "modulo_usuarios" },
  { title: "Gestión de Citas", href: "/dashboard/citas", icon: Calendar, module: "modulo_citas" },
  { title: "Gestión Médica", href: "/dashboard/medico", icon: Stethoscope, module: "modulo_medico" },
  { title: "Gestión Administrativa", href: "/dashboard/admin", icon: Shield, module: "modulo_administrativo" },
  { title: "Preguntas y Respuestas", href: "/dashboard/preguntas", icon: BookOpen, module: "modulo_administrativo" },
  { title: "Catálogos", href: "/dashboard/catalogos", icon: Tag, module: "modulo_catalogos" },
  { title: "Configuración", href: "/dashboard/configuracion", icon: Settings, module: "modulo_configuracion" },
  { title: "Notificaciones", href: "/dashboard/notificaciones", icon: Bell },
]

interface SidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

function SidebarContent({ collapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout, canView, isPaciente, isMedico } = useAuth()

  const filteredNavItems = navItems.filter((item) => {
    // Always show Home and Notifications
    if (!item.module) return true

    // For patients, show specific items
    if (isPaciente()) {
      return ["modulo_citas", "modulo_configuracion"].includes(item.module)
    }

    // For doctors, show specific items
    if (isMedico()) {
      return ["modulo_citas", "modulo_medico", "modulo_configuracion"].includes(item.module)
    }

    // For others, check permissions
    return canView(item.module)
  })

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="p-1.5 bg-primary rounded-lg">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold text-lg">Medicit</span>}
        </Link>
        {onCollapsedChange && (
          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => onCollapsedChange(!collapsed)}>
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.nombres} {user?.apellidos}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.nombreRol}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-transparent"
              onClick={() => {
                logout()
                window.location.href = "/login"
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="w-full"
            onClick={() => {
              logout()
              window.location.href = "/login"
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <SidebarContent collapsed={collapsed} onCollapsedChange={setCollapsed} />
    </aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  )
}
