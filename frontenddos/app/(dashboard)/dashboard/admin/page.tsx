"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Lock, Tag } from "lucide-react"
import Link from "next/link"

const adminModules = [
  {
    title: "Roles",
    description: "Gestiona los roles del sistema",
    icon: Users,
    href: "/dashboard/admin/roles",
  },
  {
    title: "Permisos",
    description: "Configura los permisos por rol",
    icon: Lock,
    href: "/dashboard/admin/permisos",
  },
  {
    title: "Estados",
    description: "Administra los estados de usuarios y citas",
    icon: Tag,
    href: "/dashboard/admin/estados",
  },
]

export default function AdminPage() {
  return (
    <DashboardLayout title="Gestión Administrativa">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Panel de Administración
          </h2>
          <p className="text-muted-foreground">Gestiona roles, permisos y configuraciones del sistema</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adminModules.map((module) => (
            <Link key={module.href} href={module.href}>
              <Card className="hover:bg-accent/50 transition-colors h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <module.icon className="h-5 w-5 text-primary" />
                    {module.title}
                  </CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
