"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  ArrowRightLeft,
  ChevronDown,
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
import { MOVEMENT_CATEGORIES, MOVEMENT_MODULES } from "@/lib/movement-modules"

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/movimientos", label: "Movimientos", icon: ArrowRightLeft },
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

const INVENTORY_ROUTES: Record<string, string> = {
  "nota-inventarios": "/admin/inventario/nota-inventarios",
  "traslado-bodegas": "/admin/inventario/traslado-bodegas",
  "orden-traslado-bodegas": "/admin/inventario/orden-traslado-bodegas",
  "traslado-tallas": "/admin/inventario/traslado-variantes",
  "orden-produccion": "/admin/inventario/orden-produccion",
  "salida-inventarios": "/admin/inventario/salidas",
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const currentMovement = MOVEMENT_MODULES.find((module) => pathname === `/admin/movimientos/${module.slug}`)
  const groupedCategories = ["Inventarios", "Contabilidad", "Ventas", "Punto de venta"]
  const [movementsOpen, setMovementsOpen] = useState(pathname.startsWith("/admin/movimientos") && !groupedCategories.includes(currentMovement?.category ?? ""))
  const [inventoryOpen, setInventoryOpen] = useState(pathname.startsWith("/admin/inventario") || currentMovement?.category === "Inventarios")
  const [accountingOpen, setAccountingOpen] = useState(pathname.startsWith("/admin/contabilidad") || currentMovement?.category === "Contabilidad")
  const [salesOpen, setSalesOpen] = useState(pathname === "/admin/ventas" || ["Ventas", "Punto de venta"].includes(currentMovement?.category ?? ""))

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
            const active = pathname === item.href || (item.href === "/admin/movimientos" && pathname.startsWith("/admin/movimientos/") && !groupedCategories.includes(currentMovement?.category ?? "")) || (item.href === "/admin/inventario" && (pathname.startsWith("/admin/inventario/") || currentMovement?.category === "Inventarios")) || (item.href === "/admin/contabilidad/puc" && currentMovement?.category === "Contabilidad") || (item.href === "/admin/ventas" && ["Ventas", "Punto de venta"].includes(currentMovement?.category ?? ""))
            const Icon = item.icon
            if (item.href === "/admin/movimientos") return (
              <div key={item.href}>
                <button
                  type="button"
                  onClick={() => setMovementsOpen((value) => !value)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", movementsOpen && "rotate-180")} />
                </button>
                {movementsOpen && <div className="ml-3 mt-1 border-l border-sidebar-border pl-2">
                  {MOVEMENT_CATEGORIES.filter((category) => !groupedCategories.includes(category)).map((category) => <div key={category} className="pb-2">
                    <p className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">{category}</p>
                    {MOVEMENT_MODULES.filter((module) => module.category === category).map((module) => {
                      const moduleActive = pathname === `/admin/movimientos/${module.slug}`
                      return <Link key={module.slug} href={`/admin/movimientos/${module.slug}`} onClick={() => setOpen(false)} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] leading-4 transition-colors", moduleActive ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}><span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", moduleActive ? "bg-sidebar-primary" : "bg-sidebar-foreground/25")} />{module.name}</Link>
                    })}
                  </div>)}
                </div>}
              </div>
            )
            if (item.href === "/admin/inventario") return (
              <div key={item.href}>
                <button type="button" onClick={() => setInventoryOpen((value) => !value)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
                  <Icon className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">{item.label}</span><ChevronDown className={cn("h-4 w-4 transition-transform", inventoryOpen && "rotate-180")} />
                </button>
                {inventoryOpen && <div className="ml-3 mt-1 space-y-0.5 border-l border-sidebar-border py-1 pl-2">
                  <Link href="/admin/inventario" onClick={() => setOpen(false)} className={cn("flex items-center gap-2 rounded-md px-2 py-2 text-xs transition-colors", pathname === "/admin/inventario" ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}><span className={cn("h-1.5 w-1.5 rounded-full", pathname === "/admin/inventario" ? "bg-sidebar-primary" : "bg-sidebar-foreground/25")} />Existencias</Link>
                  <p className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">Movimientos de inventario</p>
                  {MOVEMENT_MODULES.filter((module) => module.category === "Inventarios").map((module) => { const moduleHref = INVENTORY_ROUTES[module.slug] ?? `/admin/movimientos/${module.slug}`; const moduleActive = pathname === moduleHref; return <Link key={module.slug} href={moduleHref} onClick={() => setOpen(false)} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] leading-4 transition-colors", moduleActive ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}><span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", moduleActive ? "bg-sidebar-primary" : "bg-sidebar-foreground/25")} />{module.name}</Link> })}
                </div>}
              </div>
            )
            if (item.href === "/admin/contabilidad/puc") return (
              <div key={item.href}>
                <button type="button" onClick={() => setAccountingOpen((value) => !value)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
                  <Icon className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">{item.label}</span><ChevronDown className={cn("h-4 w-4 transition-transform", accountingOpen && "rotate-180")} />
                </button>
                {accountingOpen && <div className="ml-3 mt-1 space-y-0.5 border-l border-sidebar-border py-1 pl-2">
                  <Link href="/admin/contabilidad/puc" onClick={() => setOpen(false)} className={cn("flex items-center gap-2 rounded-md px-2 py-2 text-xs transition-colors", pathname === "/admin/contabilidad/puc" ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}><span className={cn("h-1.5 w-1.5 rounded-full", pathname === "/admin/contabilidad/puc" ? "bg-sidebar-primary" : "bg-sidebar-foreground/25")} />Plan Único de Cuentas</Link>
                  <p className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">Movimientos contables</p>
                  {MOVEMENT_MODULES.filter((module) => module.category === "Contabilidad").map((module) => { const moduleActive = pathname === `/admin/movimientos/${module.slug}`; return <Link key={module.slug} href={`/admin/movimientos/${module.slug}`} onClick={() => setOpen(false)} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] leading-4 transition-colors", moduleActive ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}><span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", moduleActive ? "bg-sidebar-primary" : "bg-sidebar-foreground/25")} />{module.name}</Link> })}
                </div>}
              </div>
            )
            if (item.href === "/admin/ventas") return (
              <div key={item.href}>
                <button type="button" onClick={() => setSalesOpen((value) => !value)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
                  <Icon className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">{item.label}</span><ChevronDown className={cn("h-4 w-4 transition-transform", salesOpen && "rotate-180")} />
                </button>
                {salesOpen && <div className="ml-3 mt-1 space-y-0.5 border-l border-sidebar-border py-1 pl-2">
                  <Link href="/admin/ventas" onClick={() => setOpen(false)} className={cn("flex items-center gap-2 rounded-md px-2 py-2 text-xs transition-colors", pathname === "/admin/ventas" ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}><span className={cn("h-1.5 w-1.5 rounded-full", pathname === "/admin/ventas" ? "bg-sidebar-primary" : "bg-sidebar-foreground/25")} />Gestión de ventas</Link>
                  {["Ventas", "Punto de venta"].map((category) => <div key={category}><p className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">{category === "Ventas" ? "Documentos de venta" : "Punto de venta POS"}</p>{MOVEMENT_MODULES.filter((module) => module.category === category).map((module) => { const moduleActive = pathname === `/admin/movimientos/${module.slug}`; return <Link key={module.slug} href={`/admin/movimientos/${module.slug}`} onClick={() => setOpen(false)} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] leading-4 transition-colors", moduleActive ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}><span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", moduleActive ? "bg-sidebar-primary" : "bg-sidebar-foreground/25")} />{module.name}</Link> })}</div>)}
                </div>}
              </div>
            )
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
