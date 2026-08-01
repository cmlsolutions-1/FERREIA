import { PageHeader } from "@/components/admin/page-header"
import { NewCustomerAction } from "@/components/admin/admin-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CUSTOMERS, formatCOP } from "@/lib/data"
import { Search, Building2, User } from "lucide-react"

const segColor: Record<string, string> = {
  VIP: "bg-amber-100 text-amber-800",
  Frecuente: "bg-sky-100 text-sky-800",
  Nuevo: "bg-emerald-100 text-emerald-800",
}

export default function ClientesPage() {
  const totalCartera = CUSTOMERS.reduce((a, c) => a + c.total, 0)

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Base de clientes (CRM): personas naturales y empresas"
        action={<NewCustomerAction />}
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Clientes</p>
            <p className="mt-1 text-xl font-bold">{CUSTOMERS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Clientes VIP</p>
            <p className="mt-1 text-xl font-bold">{CUSTOMERS.filter((c) => c.segmento === "VIP").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Valor histórico</p>
            <p className="mt-1 text-xl font-bold">{formatCOP(totalCartera)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar cliente..." className="pl-9" />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead className="text-right">Compras</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Última compra</TableHead>
                  <TableHead>Segmento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CUSTOMERS.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            {c.tipo === "Empresa" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{c.nombre}</p>
                          <p className="text-xs text-muted-foreground">{c.tipo}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{c.ciudad}</TableCell>
                    <TableCell className="text-right">{c.compras}</TableCell>
                    <TableCell className="text-right font-medium">{formatCOP(c.total)}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{c.ultimaCompra}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`border-0 ${segColor[c.segmento]}`}>
                        {c.segmento}
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
