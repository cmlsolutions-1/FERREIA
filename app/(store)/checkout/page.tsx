"use client"

import { useState } from "react"
import Link from "next/link"
import { CreditCard, Building2, Truck, Package, CheckCircle2, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCart } from "@/components/cart-provider"
import { DEPARTAMENTOS, formatCOP } from "@/lib/data"
import { calculateTieredPrice } from "@/lib/pricing"
import { cn } from "@/lib/utils"

export default function CheckoutPage() {
  const { lines, subtotal, count, clear } = useCart()
  const [envio, setEnvio] = useState<"estandar" | "express">("estandar")
  const [pago, setPago] = useState<"tarjeta" | "pse" | "contraentrega">("tarjeta")
  const [done, setDone] = useState(false)

  const costoEnvio = envio === "express" ? 18000 : subtotal > 150000 ? 0 : 9000
  const iva = Math.round(subtotal * 0.19)
  const total = subtotal + iva + costoEnvio

  if (done) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <CheckCircle2 className="h-16 w-16 text-accent" />
        <h1 className="mt-4 text-2xl font-bold text-primary">¡Pedido confirmado!</h1>
        <p className="mt-2 text-muted-foreground">
          Tu pedido <span className="font-semibold text-foreground">#FE-10232</span> ha sido
          registrado. Recibirás un correo con el detalle y la guía de envío.
        </p>
        <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/catalogo">Seguir comprando</Link>
        </Button>
      </div>
    )
  }

  if (count === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-primary">No hay productos en el carrito</h1>
        <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/catalogo">Ir al catálogo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-primary">Finalizar compra</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          clear()
          setDone(true)
        }}
        className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          {/* Datos cliente */}
          <Section title="Datos del cliente" icon={Building2}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre completo" required>
                <Input required placeholder="Juan Pérez" />
              </Field>
              <Field label="Documento (CC / NIT)" required>
                <Input required placeholder="1234567890" />
              </Field>
              <Field label="Correo electrónico" required>
                <Input required type="email" placeholder="correo@ejemplo.com" />
              </Field>
              <Field label="Teléfono" required>
                <Input required placeholder="+57 300 000 0000" />
              </Field>
            </div>
          </Section>

          {/* Direccion */}
          <Section title="Dirección de envío" icon={Truck}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Dirección" required>
                  <Input required placeholder="Cra. 10 #20-30, Apto 401" />
                </Field>
              </div>
              <Field label="Ciudad" required>
                <Input required placeholder="Bogotá" />
              </Field>
              <Field label="Departamento" required>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTAMENTOS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          {/* Metodo envio */}
          <Section title="Método de envío" icon={Package}>
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionCard
                active={envio === "estandar"}
                onClick={() => setEnvio("estandar")}
                title="Estándar (3-5 días)"
                desc={subtotal > 150000 ? "Gratis" : formatCOP(9000)}
              />
              <OptionCard
                active={envio === "express"}
                onClick={() => setEnvio("express")}
                title="Express (24-48h)"
                desc={formatCOP(18000)}
              />
            </div>
          </Section>

          {/* Metodo pago */}
          <Section title="Método de pago" icon={CreditCard}>
            <div className="grid gap-3 sm:grid-cols-3">
              <OptionCard active={pago === "tarjeta"} onClick={() => setPago("tarjeta")} title="Tarjeta" desc="Crédito / débito" icon={CreditCard} />
              <OptionCard active={pago === "pse"} onClick={() => setPago("pse")} title="PSE" desc="Débito bancario" icon={Building2} />
              <OptionCard active={pago === "contraentrega"} onClick={() => setPago("contraentrega")} title="Contra entrega" desc="Paga al recibir" icon={Banknote} />
            </div>
            {pago === "tarjeta" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Número de tarjeta">
                    <Input placeholder="0000 0000 0000 0000" />
                  </Field>
                </div>
                <Field label="Vencimiento">
                  <Input placeholder="MM/AA" />
                </Field>
                <Field label="CVV">
                  <Input placeholder="123" />
                </Field>
              </div>
            )}
          </Section>
        </div>

        {/* Resumen final */}
        <aside className="h-fit rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-primary">Resumen final</h2>
          <div className="mt-3 max-h-64 space-y-3 overflow-auto">
            {lines.map(({ product, qty }) => {
              const pricing = calculateTieredPrice(product, qty)

              return (
                <div key={product.id} className="flex items-center gap-3 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image || "/placeholder.svg"} alt={product.name} className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="line-clamp-1 font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">x{qty} · prom. {formatCOP(pricing.averageUnitPrice)} / und</p>
                  </div>
                  <span className="font-medium">{formatCOP(pricing.total)}</span>
                </div>
              )
            })}
          </div>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatCOP(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">IVA (19%)</dt>
              <dd>{formatCOP(iva)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Envío</dt>
              <dd>{costoEnvio === 0 ? "Gratis" : formatCOP(costoEnvio)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-3 text-base">
              <dt className="font-semibold text-primary">Total</dt>
              <dd className="font-bold text-primary">{formatCOP(total)}</dd>
            </div>
          </dl>
          <Button type="submit" className="mt-4 w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Confirmar pedido
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Pago 100% seguro y protegido
          </p>
        </aside>
      </form>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-primary">
        <Icon className="h-5 w-5 text-accent" /> {title}
      </h2>
      {children}
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  )
}

function OptionCard({
  active,
  onClick,
  title,
  desc,
  icon: Icon,
}: {
  active: boolean
  onClick: () => void
  title: string
  desc: string
  icon?: React.ElementType
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors",
        active ? "border-accent bg-accent/5" : "border-border hover:border-accent/50",
      )}
    >
      {Icon && <Icon className={cn("h-5 w-5", active ? "text-accent" : "text-muted-foreground")} />}
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  )
}
