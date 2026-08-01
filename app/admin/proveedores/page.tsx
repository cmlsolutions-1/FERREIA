import { PageHeader } from "@/components/admin/page-header"
import { NewSupplierAction } from "@/components/admin/admin-actions"
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
import { PURCHASES, SUPPLIERS, formatCOP } from "@/lib/data"
import { Search, Truck, WalletCards } from "lucide-react"

export default function ProveedoresPage() {
  const cartera = SUPPLIERS.reduce((acc, supplier) => acc + supplier.cartera, 0)
  const productos = SUPPLIERS.reduce((acc, supplier) => acc + supplier.productos, 0)
  const activos = SUPPLIERS.filter((supplier) => supplier.productos > 0).length

  return (
    <div>
      <PageHeader
        title="Proveedores"
        description="Directorio comercial, cartera y cobertura de referencias por proveedor"
        action={<NewSupplierAction />}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Proveedores activos</p>
            <p className="mt-1 text-xl font-bold">{activos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Referencias asociadas</p>
            <p className="mt-1 text-xl font-bold">{productos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Cartera proveedor</p>
            <p className="mt-1 text-xl font-bold">{formatCOP(cartera)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Órdenes de compra</p>
            <p className="mt-1 text-xl font-bold">{PURCHASES.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar proveedor, NIT o ciudad..." className="pl-9" />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>NIT</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead className="text-right">Productos</TableHead>
                    <TableHead className="text-right">Cartera</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SUPPLIERS.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{supplier.nombre}</p>
                        <p className="text-xs text-muted-foreground">{supplier.id}</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{supplier.nit}</TableCell>
                      <TableCell className="text-sm">{supplier.ciudad}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{supplier.contacto}</TableCell>
                      <TableCell className="text-right">{supplier.productos}</TableCell>
                      <TableCell className="text-right font-medium">{formatCOP(supplier.cartera)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`border-0 ${
                            supplier.cartera > 0
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {supplier.cartera > 0 ? "Con saldo" : "Al día"}
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
              <Truck className="h-5 w-5 text-accent" />
              <h2 className="font-semibold text-foreground">Compras recientes</h2>
            </div>
            <div className="space-y-3">
              {PURCHASES.map((purchase) => (
                <div key={purchase.id} className="rounded-lg border border-border p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{purchase.id}</p>
                    <Badge variant="secondary" className="border-0 bg-secondary text-secondary-foreground">
                      {purchase.estado}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-muted-foreground">{purchase.proveedor}</p>
                  <p className="mt-2 flex items-center gap-1 font-medium">
                    <WalletCards className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatCOP(purchase.total)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
