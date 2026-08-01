"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Boxes,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  FilterX,
  PackageCheck,
  Search,
  Settings2,
  TrendingUp,
  Warehouse,
} from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { INVENTORY, KARDEX, ORDERS, formatCOP } from "@/lib/data"

type MoveType = "Entrada" | "Salida" | "Ajuste" | "Transferencia"
type ExtendedMove = (typeof KARDEX)[number] & {
  id: string
  comprobante: string
  detalle: string
  tercero: string
  costoUnitario: number
}

const detailByType: Record<MoveType, string> = {
  Entrada: "Compra recibida",
  Salida: "Venta facturada",
  Ajuste: "Ajuste de inventario",
  Transferencia: "Traslado entre bodegas",
}

const typeStyle: Record<MoveType, { className: string; icon: typeof ArrowDownToLine }> = {
  Entrada: { className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", icon: ArrowDownToLine },
  Salida: { className: "bg-rose-50 text-rose-700 ring-rose-600/20", icon: ArrowUpFromLine },
  Ajuste: { className: "bg-amber-50 text-amber-700 ring-amber-600/20", icon: Settings2 },
  Transferencia: { className: "bg-sky-50 text-sky-700 ring-sky-600/20", icon: ArrowLeftRight },
}

const movements: ExtendedMove[] = KARDEX.map((move, index) => ({
  ...move,
  id: `MOV-${String(2841 - index).padStart(5, "0")}`,
  comprobante: `${move.tipo === "Entrada" ? "CO" : move.tipo === "Salida" ? "FV" : move.tipo === "Ajuste" ? "AJ" : "TR"}-${1048 - index}`,
  detalle: detailByType[move.tipo],
  tercero: move.tipo === "Entrada" ? "Proveedor autorizado" : move.tipo === "Salida" ? "Cliente mostrador" : "Operación interna",
  costoUnitario: INVENTORY[index % INVENTORY.length]?.costo ?? 0,
}))

const periods = [
  { period: "2026-06", label: "Junio 2026", docs: 63, entries: 3420, exits: 3499, avg: 3024, total: -3553285 },
  { period: "2026-05", label: "Mayo 2026", docs: 36, entries: 1250, exits: 1182, avg: 2999, total: 3510147 },
  { period: "2026-04", label: "Abril 2026", docs: 42, entries: 2000, exits: 2021, avg: 3914, total: 644944 },
  { period: "2026-03", label: "Marzo 2026", docs: 59, entries: 1180, exits: 1237, avg: 3244, total: -3553285 },
  { period: "2026-02", label: "Febrero 2026", docs: 102, entries: 3421, exits: 3499, avg: 25568, total: -1521040 },
  { period: "2026-01", label: "Enero 2026", docs: 27, entries: 1040, exits: 2210, avg: 3151, total: -6998094 },
]

const warehouses = ["Bodega Norte", "Bodega Sur", "Bodega Principal", "Mostrador"]

export function KardexView() {
  const [query, setQuery] = useState("")
  const [type, setType] = useState("todos")
  const [warehouse, setWarehouse] = useState("todas")
  const [dateFrom, setDateFrom] = useState("2026-06-01")
  const [dateTo, setDateTo] = useState("2026-06-30")

  const filtered = useMemo(() => movements.filter((move) => {
    const q = query.toLowerCase()
    const matchesQuery = !q || [move.producto, move.comprobante, move.tercero, move.usuario].some((value) => value.toLowerCase().includes(q))
    const matchesType = type === "todos" || move.tipo === type
    const matchesWarehouse = warehouse === "todas" || move.bodega.includes(warehouse)
    const matchesDate = (!dateFrom || move.fecha >= dateFrom) && (!dateTo || move.fecha <= dateTo)
    return matchesQuery && matchesType && matchesWarehouse && matchesDate
  }), [query, type, warehouse, dateFrom, dateTo])

  const entries = filtered.reduce((sum, move) => sum + move.entradas, 0)
  const exits = filtered.reduce((sum, move) => sum + move.salidas, 0)
  const inventoryValue = INVENTORY.reduce((sum, item) => sum + item.costo * item.stockActual, 0)
  const pendingOrders = ORDERS.filter((order) => ["Pendiente", "Pagado", "En preparación"].includes(order.estado))

  function resetFilters() {
    setQuery("")
    setType("todos")
    setWarehouse("todas")
    setDateFrom("2026-06-01")
    setDateTo("2026-06-30")
  }

  function exportCsv() {
    const rows = [
      ["Fecha", "Comprobante", "Producto", "Tipo", "Bodega", "Entrada", "Salida", "Saldo", "Costo unitario", "Usuario"],
      ...filtered.map((move) => [move.fecha, move.comprobante, move.producto, move.tipo, move.bodega, move.entradas, move.salidas, move.final, move.costoUnitario, move.usuario]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n")
    const link = document.createElement("a")
    link.href = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }))
    link.download = `kardex-${dateFrom}-${dateTo}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kardex e inventario"
        description="Control empresarial de existencias, costos y trazabilidad por bodega"
        action={<Button onClick={exportCsv} size="sm"><FileSpreadsheet className="mr-2 h-4 w-4" />Exportar Excel / CSV</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Movimientos" value={String(filtered.length)} detail="En el período consultado" icon={ArrowLeftRight} tone="navy" />
        <MetricCard label="Entradas" value={`+${entries.toLocaleString("es-CO")}`} detail="Unidades recibidas" icon={ArrowDownToLine} tone="green" />
        <MetricCard label="Salidas" value={`-${exits.toLocaleString("es-CO")}`} detail="Unidades despachadas" icon={ArrowUpFromLine} tone="red" />
        <MetricCard label="Valor del inventario" value={formatCOP(inventoryValue)} detail={`${INVENTORY.reduce((sum, item) => sum + item.stockActual, 0).toLocaleString("es-CO")} unidades`} icon={CircleDollarSign} tone="cyan" />
      </div>

      <Tabs defaultValue="movimientos" className="space-y-4">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-muted/70 p-1">
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="resumen">Resumen por período</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos abiertos <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-800">{pendingOrders.length}</span></TabsTrigger>
          <TabsTrigger value="bodegas">Kardex por bodegas</TabsTrigger>
        </TabsList>

        <TabsContent value="movimientos" className="space-y-4">
          <Filters query={query} setQuery={setQuery} type={type} setType={setType} warehouse={warehouse} setWarehouse={setWarehouse} dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo} reset={resetFilters} />
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div><p className="font-semibold">Detalle de movimientos</p><p className="text-xs text-muted-foreground">{filtered.length} registros encontrados</p></div>
              <Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Descargar</Button>
            </div>
            <div className="overflow-x-auto"><MovementsTable rows={filtered} /></div>
          </Card>
        </TabsContent>

        <TabsContent value="resumen"><PeriodSummary /></TabsContent>
        <TabsContent value="pedidos"><OpenOrders orders={pendingOrders} /></TabsContent>
        <TabsContent value="bodegas"><WarehouseSummary /></TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string; detail: string; icon: typeof Boxes; tone: "navy" | "green" | "red" | "cyan" }) {
  const tones = { navy: "bg-primary/10 text-primary", green: "bg-emerald-50 text-emerald-700", red: "bg-rose-50 text-rose-700", cyan: "bg-cyan-50 text-cyan-700" }
  return <Card><CardContent className="flex items-start justify-between p-4"><div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 truncate text-xl font-bold tracking-tight">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></div><div className={`rounded-xl p-2.5 ${tones[tone]}`}><Icon className="h-5 w-5" /></div></CardContent></Card>
}

function Filters(props: { query: string; setQuery: (v: string) => void; type: string; setType: (v: string) => void; warehouse: string; setWarehouse: (v: string) => void; dateFrom: string; setDateFrom: (v: string) => void; dateTo: string; setDateTo: (v: string) => void; reset: () => void }) {
  return <Card><CardContent className="p-4"><div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Settings2 className="h-4 w-4" />Filtros de consulta</div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_160px_170px_145px_145px_auto]">
    <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Producto, comprobante, tercero o usuario..." value={props.query} onChange={(e) => props.setQuery(e.target.value)} /></div>
    <Select value={props.type} onValueChange={(v) => v && props.setType(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos los tipos</SelectItem><SelectItem value="Entrada">Entradas</SelectItem><SelectItem value="Salida">Salidas</SelectItem><SelectItem value="Ajuste">Ajustes</SelectItem><SelectItem value="Transferencia">Transferencias</SelectItem></SelectContent></Select>
    <Select value={props.warehouse} onValueChange={(v) => v && props.setWarehouse(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todas">Todas las bodegas</SelectItem>{warehouses.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select>
    <Input aria-label="Fecha inicial" type="date" value={props.dateFrom} onChange={(e) => props.setDateFrom(e.target.value)} />
    <Input aria-label="Fecha final" type="date" value={props.dateTo} onChange={(e) => props.setDateTo(e.target.value)} />
    <Button variant="outline" onClick={props.reset} title="Limpiar filtros"><FilterX className="h-4 w-4" /></Button>
  </div></CardContent></Card>
}

function MovementsTable({ rows }: { rows: ExtendedMove[] }) {
  return <Table><TableHeader><TableRow className="bg-muted/40"><TableHead>Fecha / ID</TableHead><TableHead>Comprobante</TableHead><TableHead>Producto y detalle</TableHead><TableHead>Tipo</TableHead><TableHead>Bodega</TableHead><TableHead className="text-right">Entrada</TableHead><TableHead className="text-right">Salida</TableHead><TableHead className="text-right">Saldo</TableHead><TableHead className="text-right">Costo prom.</TableHead><TableHead>Elaboró</TableHead></TableRow></TableHeader><TableBody>
    {rows.length ? rows.map((move) => { const style = typeStyle[move.tipo]; const Icon = style.icon; return <TableRow key={move.id}>
      <TableCell className="whitespace-nowrap"><p className="text-sm font-medium">{move.fecha}</p><p className="font-mono text-[10px] text-muted-foreground">{move.id}</p></TableCell>
      <TableCell className="font-mono text-xs">{move.comprobante}</TableCell><TableCell className="min-w-56"><p className="font-medium">{move.producto}</p><p className="text-xs text-muted-foreground">{move.detalle} · {move.tercero}</p></TableCell>
      <TableCell><Badge variant="secondary" className={`gap-1 border-0 ring-1 ring-inset ${style.className}`}><Icon className="h-3 w-3" />{move.tipo}</Badge></TableCell><TableCell className="whitespace-nowrap text-sm">{move.bodega}</TableCell>
      <TableCell className="text-right font-semibold text-emerald-700">{move.entradas ? `+${move.entradas}` : "—"}</TableCell><TableCell className="text-right font-semibold text-rose-700">{move.salidas ? `-${move.salidas}` : "—"}</TableCell><TableCell className="text-right font-bold">{move.final}</TableCell><TableCell className="text-right text-sm">{formatCOP(move.costoUnitario)}</TableCell><TableCell className="font-mono text-xs">{move.usuario}</TableCell>
    </TableRow> }) : <TableRow><TableCell colSpan={10} className="h-40 text-center"><Search className="mx-auto mb-2 h-6 w-6 text-muted-foreground" /><p className="font-medium">No hay movimientos para estos filtros</p><p className="text-xs text-muted-foreground">Ajusta el período o los criterios de búsqueda.</p></TableCell></TableRow>}
  </TableBody></Table>
}

function PeriodSummary() {
  const max = Math.max(...periods.map((p) => Math.max(p.entries, p.exits)))
  return <div className="grid gap-4 xl:grid-cols-[1fr_320px]"><Card className="overflow-hidden"><CardHeader className="border-b"><CardTitle className="text-base">Consolidado mensual de movimientos</CardTitle></CardHeader><div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-muted/40"><TableHead>Período</TableHead><TableHead className="text-right">Comprobantes</TableHead><TableHead className="text-right">Entradas</TableHead><TableHead className="text-right">Salidas</TableHead><TableHead className="text-right">Costo promedio</TableHead><TableHead className="text-right">Variación valorizada</TableHead></TableRow></TableHeader><TableBody>{periods.map((p) => <TableRow key={p.period}><TableCell><p className="font-medium">{p.label}</p><p className="text-xs text-muted-foreground">{p.period}</p></TableCell><TableCell className="text-right">{p.docs}</TableCell><TableCell className="text-right text-emerald-700">+{p.entries.toLocaleString("es-CO")}</TableCell><TableCell className="text-right text-rose-700">-{p.exits.toLocaleString("es-CO")}</TableCell><TableCell className="text-right">{formatCOP(p.avg)}</TableCell><TableCell className={`text-right font-semibold ${p.total >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{formatCOP(p.total)}</TableCell></TableRow>)}</TableBody></Table></div></Card>
    <Card><CardHeader><CardTitle className="text-base">Flujo por período</CardTitle></CardHeader><CardContent className="space-y-5">{periods.slice(0, 5).map((p) => <div key={p.period}><div className="mb-2 flex justify-between text-xs"><span className="font-medium">{p.label}</span><span className="text-muted-foreground">{(p.entries + p.exits).toLocaleString("es-CO")} und.</span></div><div className="space-y-1"><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.entries / max * 100}%` }} /></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-rose-400" style={{ width: `${p.exits / max * 100}%` }} /></div></div></div>)}<div className="flex gap-4 border-t pt-4 text-xs"><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-500" /> Entradas</span><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-rose-400" /> Salidas</span></div></CardContent></Card></div>
}

function OpenOrders({ orders }: { orders: typeof ORDERS }) {
  const units = orders.reduce((sum, order) => sum + order.items, 0)
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3"><MetricCard label="Pedidos por despachar" value={String(orders.length)} detail="Comprometen inventario" icon={PackageCheck} tone="navy" /><MetricCard label="Unidades comprometidas" value={units.toLocaleString("es-CO")} detail="Pendientes de entrega" icon={Boxes} tone="red" /><MetricCard label="Valor comprometido" value={formatCOP(orders.reduce((s, o) => s + o.total, 0))} detail="Pedidos activos" icon={TrendingUp} tone="green" /></div><Card className="overflow-hidden"><div className="border-b px-4 py-3"><p className="font-semibold">Pedidos abiertos — pendientes por entregar</p><p className="text-xs text-muted-foreground">Reserva y disponibilidad asociada al inventario</p></div><div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-muted/40"><TableHead>Pedido</TableHead><TableHead>Fecha</TableHead><TableHead>Cliente</TableHead><TableHead className="text-right">Ítems</TableHead><TableHead>Bodega de despacho</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader><TableBody>{orders.map((o, i) => <TableRow key={o.id}><TableCell className="font-mono text-xs font-semibold">{o.id}</TableCell><TableCell>{o.fecha}</TableCell><TableCell className="font-medium">{o.cliente}</TableCell><TableCell className="text-right">{o.items}</TableCell><TableCell>{i % 2 ? "Bodega Sur" : "Bodega Norte"}</TableCell><TableCell><Badge variant="secondary" className="bg-amber-50 text-amber-800">{o.estado}</Badge></TableCell><TableCell className="text-right font-semibold">{formatCOP(o.total)}</TableCell></TableRow>)}</TableBody></Table></div></Card></div>
}

function WarehouseSummary() {
  const grouped = warehouses.map((name, index) => { const items = INVENTORY.filter((_, i) => i % warehouses.length === index); return { name, refs: items.length, units: items.reduce((s, i) => s + i.stockActual, 0), low: items.filter((i) => i.stockActual <= i.stockMin).length, value: items.reduce((s, i) => s + i.stockActual * i.costo, 0) } })
  return <div className="grid gap-4 md:grid-cols-2">{grouped.map((w) => <Card key={w.name}><CardContent className="p-5"><div className="flex items-start justify-between"><div className="flex gap-3"><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Warehouse className="h-5 w-5" /></span><div><p className="font-semibold">{w.name}</p><p className="text-xs text-muted-foreground">Inventario disponible</p></div></div><Button size="icon" variant="ghost"><ChevronDown className="h-4 w-4" /></Button></div><div className="mt-5 grid grid-cols-3 gap-3 border-y py-4 text-center"><div><p className="text-lg font-bold">{w.refs}</p><p className="text-[10px] text-muted-foreground">REFERENCIAS</p></div><div><p className="text-lg font-bold">{w.units}</p><p className="text-[10px] text-muted-foreground">UNIDADES</p></div><div><p className={`text-lg font-bold ${w.low ? "text-amber-600" : "text-emerald-600"}`}>{w.low}</p><p className="text-[10px] text-muted-foreground">BAJO MÍNIMO</p></div></div><div className="mt-4 flex items-center justify-between"><span className="text-xs text-muted-foreground">Valor a costo</span><span className="font-bold">{formatCOP(w.value)}</span></div>{w.low > 0 && <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800"><AlertTriangle className="h-4 w-4" />Requiere revisión de reposición</div>}</CardContent></Card>)} </div>
}
