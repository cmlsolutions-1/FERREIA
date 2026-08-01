import { PageHeader } from "@/components/admin/page-header"
import { NewPurchaseOrderAction } from "@/components/admin/admin-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PURCHASES, formatCOP } from "@/lib/data"

const estadoColor: Record<string, string> = {
  Borrador: "bg-slate-100 text-slate-700",
  Enviada: "bg-sky-100 text-sky-800",
  Recibida: "bg-emerald-100 text-emerald-800",
  Facturada: "bg-teal-100 text-teal-800",
}

export default function ComprasPage() {
  const total = PURCHASES.reduce((a, p) => a + p.total, 0)

  return (
    <div>
      <PageHeader
        title="Compras"
        description="Órdenes de compra a proveedores y recepción de mercancía"
        action={<NewPurchaseOrderAction />}
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Órdenes</p>
            <p className="mt-1 text-xl font-bold">{PURCHASES.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total comprado</p>
            <p className="mt-1 text-xl font-bold">{formatCOP(total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pendientes recibir</p>
            <p className="mt-1 text-xl font-bold text-amber-600">
              {PURCHASES.filter((p) => p.estado === "Enviada" || p.estado === "Borrador").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PURCHASES.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.id}</TableCell>
                    <TableCell>{p.proveedor}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{p.fecha}</TableCell>
                    <TableCell className="text-right font-medium">{formatCOP(p.total)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`border-0 ${estadoColor[p.estado]}`}>
                        {p.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
