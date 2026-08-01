import { PageHeader } from "@/components/admin/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { KARDEX } from "@/lib/data"
import { Download, ArrowDownToLine, ArrowUpFromLine, Settings2, ArrowLeftRight } from "lucide-react"

const tipoStyle: Record<string, { color: string; icon: typeof ArrowDownToLine }> = {
  Entrada: { color: "bg-emerald-100 text-emerald-800", icon: ArrowDownToLine },
  Salida: { color: "bg-rose-100 text-rose-800", icon: ArrowUpFromLine },
  Ajuste: { color: "bg-amber-100 text-amber-800", icon: Settings2 },
  Transferencia: { color: "bg-sky-100 text-sky-800", icon: ArrowLeftRight },
}

export default function KardexPage() {
  const entradas = KARDEX.reduce((a, m) => a + m.entradas, 0)
  const salidas = KARDEX.reduce((a, m) => a + m.salidas, 0)

  return (
    <div>
      <PageHeader
        title="Kardex"
        description="Trazabilidad de movimientos: entradas, salidas, ajustes y transferencias"
        action={
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar kardex
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Movimientos</p>
            <p className="mt-1 text-xl font-bold">{KARDEX.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total entradas</p>
            <p className="mt-1 text-xl font-bold text-emerald-600">+{entradas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total salidas</p>
            <p className="mt-1 text-xl font-bold text-rose-600">-{salidas}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Bodega</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-right">Inicial</TableHead>
                  <TableHead className="text-right">Entrada</TableHead>
                  <TableHead className="text-right">Salida</TableHead>
                  <TableHead className="text-right">Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {KARDEX.map((m, idx) => {
                  const style = tipoStyle[m.tipo]
                  const Icon = style.icon
                  return (
                    <TableRow key={idx}>
                      <TableCell className="whitespace-nowrap text-sm">{m.fecha}</TableCell>
                      <TableCell className="max-w-[180px] truncate font-medium">{m.producto}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`gap-1 border-0 ${style.color}`}>
                          <Icon className="h-3 w-3" />
                          {m.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{m.bodega}</TableCell>
                      <TableCell className="font-mono text-xs">{m.usuario}</TableCell>
                      <TableCell className="text-right text-sm">{m.inicial}</TableCell>
                      <TableCell className="text-right text-sm text-emerald-600">
                        {m.entradas > 0 ? `+${m.entradas}` : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm text-rose-600">
                        {m.salidas > 0 ? `-${m.salidas}` : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold">{m.final}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
