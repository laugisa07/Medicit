"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, Stethoscope } from "lucide-react"
import Link from "next/link"

const catalogos = [
  {
    title: "Especialidades",
    description: "Gestiona las especialidades médicas",
    icon: Stethoscope,
    href: "/dashboard/catalogos/especialidades",
  },
]

export default function CatalogosPage() {
  return (
    <DashboardLayout title="Catálogos">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="h-6 w-6" />
            Catálogos del Sistema
          </h2>
          <p className="text-muted-foreground">Gestiona los catálogos y datos maestros del sistema</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {catalogos.map((catalogo) => (
            <Link key={catalogo.href} href={catalogo.href}>
              <Card className="hover:bg-accent/50 transition-colors h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <catalogo.icon className="h-5 w-5 text-primary" />
                    {catalogo.title}
                  </CardTitle>
                  <CardDescription>{catalogo.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
