import { PageHeader } from "@/components/admin/page-header"
import { NewShipmentAction } from "@/components/admin/admin-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SHIPMENTS } from "@/lib/data"
import { MapPin, PackageCheck, Search } from "lucide-react"

const estadoColor: Record<string, string> = {
  "En bodega": "bg-slate-100 text-slate-700",
  "En tránsito": "bg-sky-100 text-sky-800",
  "En reparto": "bg-amber-100 text-amber-800",
  Entregado: "bg-emerald-100 text-emerald-800",
}

export default function LogisticaPage() {
  const pendientes = SHIPMENTS.filter((shipment) => shipment.estado !== "Entregado").length
  const entregados = SHIPMENTS.filter((shipment) => shipment.estado === "Entregado").length

  return (
    <div>
      <PageHeader
        title="Logística"
        description="Seguimiento de despachos, transportadoras y estados de entrega"
        action={<NewShipmentAction />}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Guías activas</p>
            <p className="mt-1 text-xl font-bold">{SHIPMENTS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pendientes</p>
            <p className="mt-1 text-xl font-bold text-amber-600">{pendientes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Entregados</p>
            <p className="mt-1 text-xl font-bold text-emerald-600">{entregados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Transportadoras</p>
            <p className="mt-1 text-xl font-bold">
              {new Set(SHIPMENTS.map((shipment) => shipment.transportadora)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar guía, pedido o destino..." className="pl-9" />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guía</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Transportadora</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SHIPMENTS.map((shipment) => (
                    <TableRow key={shipment.guia}>
                      <TableCell className="font-mono text-xs font-medium">{shipment.guia}</TableCell>
                      <TableCell className="font-medium">{shipment.pedido}</TableCell>
                      <TableCell className="text-sm">{shipment.transportadora}</TableCell>
                      <TableCell className="text-sm">{shipment.destino}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`border-0 ${estadoColor[shipment.estado]}`}>
                          {shipment.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              <h2 className="font-semibold text-foreground">Flujo operativo</h2>
            </div>
            {[
              { label: "Alistar pedido", value: "Validar pago, separar referencias y marcar caja." },
              { label: "Despachar", value: "Asignar transportadora y generar guía." },
              { label: "Seguimiento", value: "Actualizar estado hasta entrega final." },
            ].map((step, index) => (
              <div key={step.label} className="flex gap-3 rounded-lg border border-border p-3 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 font-semibold text-accent">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-foreground">{step.label}</p>
                  <p className="mt-1 text-muted-foreground">{step.value}</p>
                </div>
              </div>
            ))}
            <div className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
              <div className="flex items-center gap-2 font-medium">
                <PackageCheck className="h-4 w-4" />
                Próximo paso
              </div>
              <p className="mt-1 text-muted-foreground">
                Conectar generación automática de guías cuando se integre la transportadora.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
