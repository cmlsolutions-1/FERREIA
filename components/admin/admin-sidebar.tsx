"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Boxes,
  PackagePlus,
  ScrollText,
  ShoppingCart,
  Receipt,
  Users,
  Truck,
  PackageSearch,
  BarChart3,
  Landmark,
  Settings,
  Store,
  Menu,
  X,
} from "lucide-react"

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articulos", label: "Catálogo de artículos", icon: PackagePlus },
  { href: "/admin/inventario", label: "Inventario", icon: Boxes },
  { href: "/admin/kardex", label: "Kardex", icon: ScrollText },
  { href: "/admin/contabilidad/puc", label: "Contabilidad", icon: Landmark },
  { href: "/admin/compras", label: "Compras", icon: ShoppingCart },
  { href: "/admin/ventas", label: "Ventas", icon: Receipt },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/proveedores", label: "Proveedores", icon: PackageSearch },
  { href: "/admin/logistica", label: "Logística", icon: Truck },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-sidebar-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            F
          </span>
          FERREIA ERP
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((v) => !v)}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Menú</span>
        </Button>
      </div>

      <aside
        className={cn(
          "flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:sticky lg:top-0 lg:h-screen",
          open ? "block" : "hidden lg:flex",
        )}
      >
        <div className="hidden items-center gap-2 border-b border-sidebar-border px-5 py-4 lg:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-base font-bold text-sidebar-primary-foreground">
            F
          </span>
          <div className="leading-tight">
            <p className="font-bold text-sidebar-foreground">FERREIA</p>
            <p className="text-xs text-sidebar-foreground/60">Panel administrativo</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Store className="h-4 w-4 shrink-0" />
            Ir a la tienda
          </Link>
        </div>
      </aside>
    </>
  )
}
