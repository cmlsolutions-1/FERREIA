"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Boxes, CheckCircle2, Clock3, FileText, FilterX, History, MapPinned, MoreHorizontal, PackageCheck, Plus, Search, ShoppingCart, Trash2, UserRound, Warehouse } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCOP, PRODUCTS } from "@/lib/data"
import { initialProductMaster, PRODUCT_STORAGE_KEY, type ProductMaster } from "@/lib/product-master"

type OrderSource = "Tienda web" | "Móvil" | "POS" | "Administrador"
type OrderStatus = "Pendiente" | "En alistamiento" | "Con diferencia" | "Listo para facturar" | "Facturado" | "Cancelado"
type Presentation = "Unidad" | "Inner" | "Master"

type OrderLine = {
  id: string
  productId: string
  reference: string
  barcode: string
  description: string
  presentation: Presentation
  requested: number
  picked: number
  unitPrice: number
  taxRate: number
  image: string
  stock: number
  warehouse: string
  location: string
  adjustmentReason?: string
}

type OrderHistory = { id: string; at: string; user: string; action: string; detail: string }
type CustomerOrder = {
  id: string
  number: string
  date: string
  customer: string
  source: OrderSource
  status: OrderStatus
  lines: OrderLine[]
  total: number
  readyAt?: string
  readyBy?: string
  invoiceLink?: string
  history: OrderHistory[]
}

type CartLine = { productId: string; presentation: Presentation; quantity: number }

const ORDER_STORAGE_KEY = "ferreia-customer-orders-v1"
const KARDEX_EVENTS_KEY = "ferreia-kardex-events-v1"
const BILLING_DRAFT_KEY = "ferreia-electronic-billing-source-order"
const USER = "admin.ferreia"
const sources: OrderSource[] = ["Tienda web", "Móvil", "POS", "Administrador"]
const statuses: OrderStatus[] = ["Pendiente", "En alistamiento", "Con diferencia", "Listo para facturar", "Facturado", "Cancelado"]

export function CustomerOrderView() {
  const [products, setProducts] = useState<ProductMaster[]>(initialProductMaster)
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [sourceFilter, setSourceFilter] = useState("Todos")
  const [builderOpen, setBuilderOpen] = useState(false)
  const [customer, setCustomer] = useState("Cliente mostrador")
  const [source, setSource] = useState<OrderSource>("Administrador")
  const [productQuery, setProductQuery] = useState("")
  const [cart, setCart] = useState<CartLine[]>([])

  useEffect(() => {
    const storedProducts = localStorage.getItem(PRODUCT_STORAGE_KEY)
    const productList = storedProducts ? JSON.parse(storedProducts) as ProductMaster[] : initialProductMaster
    const storedOrders = localStorage.getItem(ORDER_STORAGE_KEY)
    const initialOrders = storedOrders ? JSON.parse(storedOrders) as CustomerOrder[] : seedOrders(productList)
    setProducts(productList)
    setOrders(initialOrders)
    setSelectedId(initialOrders[0]?.id ?? "")
    if (!storedOrders) localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(initialOrders))
  }, [])

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const text = `${order.number} ${order.customer} ${order.source} ${order.status}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (statusFilter === "Todos" || order.status === statusFilter) && (sourceFilter === "Todos" || order.source === sourceFilter)
  }), [orders, query, sourceFilter, statusFilter])

  const selected = orders.find((order) => order.id === selectedId) ?? filteredOrders[0] ?? orders[0]
  const activeProducts = products.filter((product) => product.active)
  const filteredProducts = activeProducts.filter((product) => `${product.reference} ${product.name} ${product.sku} ${product.barcodes.map((item) => item.code).join(" ")}`.toLowerCase().includes(productQuery.toLowerCase())).slice(0, 12)
  const cartLines = cart.map((line) => ({ ...line, product: products.find((product) => product.id === line.productId) })).filter((line): line is CartLine & { product: ProductMaster } => Boolean(line.product))
  const orderTotals = orders.reduce((data, order) => ({ count: data.count + 1, ready: data.ready + (order.status === "Listo para facturar" ? 1 : 0), units: data.units + order.lines.reduce((sum, line) => sum + line.requested, 0), value: data.value + order.total }), { count: 0, ready: 0, units: 0, value: 0 })

  function persist(next: CustomerOrder[]) {
    setOrders(next)
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(next))
  }

  function updateOrder(orderId: string, updater: (order: CustomerOrder) => CustomerOrder) {
    persist(orders.map((order) => order.id === orderId ? updater(order) : order))
  }

  function startPicking(order: CustomerOrder) {
    const sortedLines = [...order.lines].sort((a, b) => a.location.localeCompare(b.location))
    updateOrder(order.id, (current) => withHistory({ ...current, status: "En alistamiento", lines: sortedLines }, "Alistar pedido", "Productos ordenados por ubicación de bodega para optimizar el recorrido."))
  }

  function updateLine(orderId: string, lineId: string, patch: Partial<OrderLine>) {
    updateOrder(orderId, (order) => {
      const lines = order.lines.map((line) => line.id === lineId ? { ...line, ...patch } : line)
      const hasDiff = lines.some((line) => line.picked !== line.requested)
      return { ...order, status: hasDiff && order.status !== "Listo para facturar" ? "Con diferencia" : order.status, lines, total: totalLines(lines) }
    })
  }

  function saveAdjustments(order: CustomerOrder) {
    const missingReason = order.lines.some((line) => line.picked !== line.requested && !line.adjustmentReason?.trim())
    if (missingReason) return
    const detail = order.lines.filter((line) => line.picked !== line.requested).map((line) => `${line.reference}: solicitado ${line.requested}, alistado ${line.picked}. ${line.adjustmentReason}`).join(" | ") || "Sin diferencias contra la solicitud."
    updateOrder(order.id, (current) => withHistory(current, "Ajuste de cantidades", detail))
  }

  function finishOrder(order: CustomerOrder) {
    if (order.status === "Listo para facturar") return
    const missingReason = order.lines.some((line) => line.picked !== line.requested && !line.adjustmentReason?.trim())
    if (missingReason) return
    const readyAt = new Date().toISOString()
    const invoiceLink = `/admin/movimientos/factura-venta?pedido=${order.number}`
    const finalized = withHistory({ ...order, status: "Listo para facturar", readyAt, readyBy: USER, invoiceLink, total: totalLines(order.lines) }, "Pedido listo para facturar", `Alistamiento finalizado por ${USER}. Documento enlazado a facturación electrónica.`)
    persist(orders.map((item) => item.id === order.id ? finalized : item))
    applyInventoryExit(finalized, products, setProducts)
    localStorage.setItem(BILLING_DRAFT_KEY, JSON.stringify({
      orderNumber: finalized.number,
      customer: finalized.customer,
      lines: finalized.lines.map((line) => ({ code: line.reference, description: line.description, quantity: line.picked, unitPrice: line.unitPrice, taxRate: line.taxRate, discount: 0 })),
      createdAt: readyAt,
    }))
  }

  function addToCart(productId: string) {
    setCart((current) => current.some((line) => line.productId === productId && line.presentation === "Unidad") ? current.map((line) => line.productId === productId && line.presentation === "Unidad" ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { productId, presentation: "Unidad", quantity: 1 }])
  }

  function createManualOrder() {
    if (!cartLines.length || !customer.trim()) return
    const lines = cartLines.map((line, index) => makeLine(line.product, line.quantity, line.presentation, index + orders.length))
    const order: CustomerOrder = withHistory({
      id: crypto.randomUUID(),
      number: nextOrderNumber(orders),
      date: new Date().toISOString(),
      customer: customer.trim(),
      source,
      status: "Pendiente",
      lines,
      total: totalLines(lines),
      history: [],
    }, "Pedido creado", `Pedido manual creado desde tarjetas de producto con ${lines.length} referencia(s).`)
    persist([order, ...orders])
    setSelectedId(order.id)
    setCart([])
    setBuilderOpen(false)
  }

  return <div className="space-y-5">
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-3"><Link href="/admin/movimientos"><ArrowLeft className="mr-2 h-4 w-4" />Volver a movimientos</Link></Button>
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold">Pedido de cliente</h1><Badge className="bg-emerald-50 text-emerald-700" variant="secondary">Venta a facturación</Badge></div>
          <p className="mt-1 text-sm text-muted-foreground">Centro operativo para recibir, alistar, ajustar y dejar pedidos listos para factura electrónica.</p>
        </div>
        <Button onClick={() => setBuilderOpen(!builderOpen)}><Plus className="mr-2 h-4 w-4" />Nuevo pedido</Button>
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={ShoppingCart} label="Pedidos centralizados" value={String(orderTotals.count)} detail="Web, móvil, POS y admin" />
      <Metric icon={Boxes} label="Unidades comprometidas" value={orderTotals.units.toLocaleString("es-CO")} detail="Reservadas para entrega" />
      <Metric icon={PackageCheck} label="Listos para facturar" value={String(orderTotals.ready)} detail="Con usuario y hora" />
      <Metric icon={FileText} label="Valor operativo" value={formatCOP(orderTotals.value)} detail="Total de pedidos" />
    </div>

    {builderOpen && <Card><CardHeader><CardTitle>Nuevo pedido manual</CardTitle></CardHeader><CardContent className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <Field label="Cliente"><Input value={customer} onChange={(event) => setCustomer(event.target.value)} /></Field>
        <Field label="Origen"><Select value={source} onValueChange={(value) => setSource(value as OrderSource)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{sources.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field>
        <div className="flex items-end"><Button onClick={createManualOrder} disabled={!cartLines.length || !customer.trim()}><CheckCircle2 className="mr-2 h-4 w-4" />Guardar pedido</Button></div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_390px]">
        <div className="space-y-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar por producto, referencia, SKU o código de barras..." value={productQuery} onChange={(event) => setProductQuery(event.target.value)} /></div>
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={() => addToCart(product.id)} />)}</div>
        </div>
        <Card className="rounded-lg"><CardContent className="space-y-3 p-4"><div className="flex items-center justify-between"><p className="font-semibold">Carrito del pedido</p><Badge variant="secondary">{cartLines.length} ref.</Badge></div>
          {cartLines.map((line) => <div key={`${line.productId}-${line.presentation}`} className="grid gap-2 rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2"><div><p className="font-medium">{line.product.name}</p><p className="text-xs text-muted-foreground">{line.product.reference} · Stock {line.product.stock}</p></div><Button variant="ghost" size="icon" onClick={() => setCart(cart.filter((item) => !sameCartLine(item, line)))}><Trash2 className="h-4 w-4" /></Button></div>
            <div className="grid grid-cols-2 gap-2"><Select value={line.presentation} onValueChange={(value) => value && setCart(cart.map((item) => sameCartLine(item, line) ? { ...item, presentation: value as Presentation } : item))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Unidad">Unidad</SelectItem><SelectItem value="Inner">Caja inner</SelectItem><SelectItem value="Master">Caja master</SelectItem></SelectContent></Select><Input type="number" min="1" value={line.quantity} onChange={(event) => setCart(cart.map((item) => sameCartLine(item, line) ? { ...item, quantity: Math.max(1, Number(event.target.value) || 1) } : item))} /></div>
          </div>)}
          {!cartLines.length && <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Agrega productos desde las tarjetas para crear el pedido.</div>}
        </CardContent></Card>
      </div>
    </CardContent></Card>}

    <div className="grid gap-4 2xl:grid-cols-[minmax(620px,1fr)_520px]">
      <Card className="overflow-hidden">
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_190px_170px_auto]">
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pedido, cliente, origen o estado..." /></div>
            <Select value={statusFilter} onValueChange={(value) => value && setStatusFilter(value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Todos">Todos los estados</SelectItem>{statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
            <Select value={sourceFilter} onValueChange={(value) => value && setSourceFilter(value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Todos">Todos los orígenes</SelectItem>{sources.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
            <Button variant="outline" title="Limpiar filtros" onClick={() => { setQuery(""); setStatusFilter("Todos"); setSourceFilter("Todos") }}><FilterX className="h-4 w-4" /></Button>
          </div>
        </CardContent>
        <div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-muted/40"><TableHead>Pedido</TableHead><TableHead>Fecha</TableHead><TableHead>Cliente</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Productos</TableHead><TableHead /></TableRow></TableHeader><TableBody>{filteredOrders.map((order) => <TableRow key={order.id} className={selected?.id === order.id ? "bg-primary/5" : ""}><TableCell><button className="text-left font-mono text-xs font-bold text-primary" onClick={() => setSelectedId(order.id)}>{order.number}</button><p className="text-xs text-muted-foreground">{order.source}</p></TableCell><TableCell>{formatDate(order.date)}</TableCell><TableCell className="font-medium">{order.customer}</TableCell><TableCell><StatusBadge status={order.status} /></TableCell><TableCell className="text-right font-semibold">{formatCOP(order.total)}</TableCell><TableCell className="text-right">{order.lines.reduce((sum, line) => sum + line.requested, 0)}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setSelectedId(order.id)}><Search className="h-4 w-4" />Abrir pedido</DropdownMenuItem><DropdownMenuItem onClick={() => startPicking(order)}><MapPinned className="h-4 w-4" />Alistar pedido</DropdownMenuItem><DropdownMenuItem onClick={() => finishOrder(order)}><FileText className="h-4 w-4" />Listo para facturar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}{!filteredOrders.length && <TableRow><TableCell colSpan={7} className="h-36 text-center text-muted-foreground">No hay pedidos con los filtros aplicados.</TableCell></TableRow>}</TableBody></Table></div>
      </Card>

      {selected && <OrderDetail order={selected} onStart={() => startPicking(selected)} onSave={() => saveAdjustments(selected)} onFinish={() => finishOrder(selected)} onLineChange={(lineId, patch) => updateLine(selected.id, lineId, patch)} />}
    </div>
  </div>
}

function OrderDetail({ order, onStart, onSave, onFinish, onLineChange }: { order: CustomerOrder; onStart: () => void; onSave: () => void; onFinish: () => void; onLineChange: (lineId: string, patch: Partial<OrderLine>) => void }) {
  const hasDiff = order.lines.some((line) => line.picked !== line.requested)
  const missingReason = order.lines.some((line) => line.picked !== line.requested && !line.adjustmentReason?.trim())
  return <Card className="overflow-hidden"><CardHeader className="border-b"><div className="flex items-start justify-between gap-3"><div><CardTitle>{order.number}</CardTitle><p className="text-sm text-muted-foreground">{order.customer} · {order.source}</p></div><StatusBadge status={order.status} /></div></CardHeader><CardContent className="space-y-4 p-4">
    <div className="grid gap-2 sm:grid-cols-3"><SmallInfo icon={Clock3} label="Fecha" value={formatDateTime(order.date)} /><SmallInfo icon={UserRound} label="Responsable" value={order.readyBy ?? USER} /><SmallInfo icon={FileText} label="Factura" value={order.invoiceLink ? "Enlazada" : "Pendiente"} /></div>
    <div className="flex flex-wrap gap-2"><Button onClick={onStart} disabled={order.status === "Listo para facturar"}><MapPinned className="mr-2 h-4 w-4" />Alistar pedido</Button><Button variant="outline" onClick={onSave} disabled={missingReason}><PackageCheck className="mr-2 h-4 w-4" />Guardar ajustes</Button><Button onClick={onFinish} disabled={missingReason || order.status === "Listo para facturar"}><FileText className="mr-2 h-4 w-4" />Listo para facturar</Button>{order.invoiceLink && <Button asChild variant="secondary"><Link href={order.invoiceLink}>Abrir facturación</Link></Button>}</div>
    {missingReason && <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Hay diferencias de cantidad. Registra el motivo antes de finalizar o guardar ajustes.</div>}
    <Tabs defaultValue="productos"><TabsList><TabsTrigger value="productos">Productos</TabsTrigger><TabsTrigger value="historial">Historial</TabsTrigger></TabsList>
      <TabsContent value="productos" className="space-y-3">{order.lines.map((line) => <div key={line.id} className="grid gap-3 rounded-lg border p-3">
        <div className="grid gap-3 sm:grid-cols-[72px_1fr]"><img src={line.image} alt={line.description} className="h-18 w-18 rounded-lg border object-cover" /><div className="min-w-0"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold">{line.description}</p><p className="text-xs text-muted-foreground">Ref. {line.reference} · Código {line.barcode}</p></div><Badge variant="secondary">{line.presentation}</Badge></div><div className="mt-2 grid gap-2 text-xs sm:grid-cols-2"><span className="flex items-center gap-1"><Warehouse className="h-3.5 w-3.5" />{line.warehouse}</span><span className="flex items-center gap-1"><MapPinned className="h-3.5 w-3.5" />{line.location}</span></div></div></div>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_2fr]"><Field label="Solicitado"><Input value={line.requested} disabled /></Field><Field label="Alistado"><Input type="number" min="0" value={line.picked} onChange={(event) => onLineChange(line.id, { picked: Math.max(0, Number(event.target.value) || 0) })} /></Field><Field label="Motivo diferencia"><Input value={line.adjustmentReason ?? ""} onChange={(event) => onLineChange(line.id, { adjustmentReason: event.target.value })} placeholder={line.picked === line.requested ? "Sin diferencia" : "Obligatorio"} /></Field></div>
      </div>)}</TabsContent>
      <TabsContent value="historial" className="space-y-3">{[...order.history].reverse().map((item) => <div key={item.id} className="flex gap-3 rounded-lg border p-3 text-sm"><span className="rounded-lg bg-primary/10 p-2 text-primary"><History className="h-4 w-4" /></span><div><p className="font-semibold">{item.action}</p><p className="text-xs text-muted-foreground">{formatDateTime(item.at)} · {item.user}</p><p className="mt-1 text-xs leading-5">{item.detail}</p></div></div>)}</TabsContent>
    </Tabs>
    {hasDiff && <Separator />}
    {hasDiff && <p className="text-xs text-muted-foreground">El total se recalcula con cantidades alistadas cuando existen diferencias.</p>}
  </CardContent></Card>
}

function ProductCard({ product, onAdd }: { product: ProductMaster; onAdd: () => void }) {
  return <div className="grid gap-3 rounded-lg border p-3"><div className="flex gap-3"><img src={imageFor(product)} alt={product.name} className="h-16 w-16 rounded-lg border object-cover" /><div className="min-w-0"><p className="truncate font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{product.reference} · {product.sku}</p><p className="mt-1 text-sm font-bold text-primary">{formatCOP(product.price)}</p></div></div><div className="flex items-center justify-between text-xs text-muted-foreground"><span>Stock {product.stock}</span><span>{product.warehouse}</span></div><Button variant="outline" onClick={onAdd}><Plus className="mr-2 h-4 w-4" />Agregar</Button></div>
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="grid gap-1.5"><Label className="text-xs">{label}</Label>{children}</div> }
function Metric({ icon: Icon, label, value, detail }: { icon: typeof ShoppingCart; label: string; value: string; detail: string }) { return <Card><CardContent className="flex items-center gap-3 p-4"><span className="rounded-xl bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-bold">{value}</p><p className="text-xs text-muted-foreground">{detail}</p></div></CardContent></Card> }
function SmallInfo({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) { return <div className="rounded-lg border p-3"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div><p className="mt-1 truncate text-sm font-semibold">{value}</p></div> }
function StatusBadge({ status }: { status: OrderStatus }) {
  const color = status === "Listo para facturar" ? "bg-emerald-50 text-emerald-700" : status === "Con diferencia" ? "bg-amber-50 text-amber-700" : status === "Cancelado" ? "bg-rose-50 text-rose-700" : status === "En alistamiento" ? "bg-cyan-50 text-cyan-700" : "bg-slate-100 text-slate-700"
  return <Badge variant="secondary" className={color}>{status}</Badge>
}

function seedOrders(products: ProductMaster[]): CustomerOrder[] {
  const today = new Date()
  const samples = [
    { number: "PED-045083", customer: "Constructora Horizonte S.A.S.", source: "Tienda web" as OrderSource, indexes: [0, 1, 2], quantities: [12, 4, 2] },
    { number: "PED-045084", customer: "Juan Camilo Restrepo", source: "POS" as OrderSource, indexes: [3, 4], quantities: [6, 1] },
    { number: "PED-045085", customer: "Maderas del Norte", source: "Móvil" as OrderSource, indexes: [5, 6, 7], quantities: [30, 10, 8] },
  ]
  return samples.map((sample, orderIndex) => {
    const lines = sample.indexes.map((index, lineIndex) => makeLine(products[index % products.length], sample.quantities[lineIndex], lineIndex === 0 ? "Master" : lineIndex === 1 ? "Inner" : "Unidad", index))
    return withHistory({ id: crypto.randomUUID(), number: sample.number, date: new Date(today.getTime() - orderIndex * 86400000).toISOString(), customer: sample.customer, source: sample.source, status: "Pendiente", lines, total: totalLines(lines), history: [] }, "Pedido recibido", `Entrada centralizada desde ${sample.source}.`)
  })
}

function makeLine(product: ProductMaster, quantity: number, presentation: Presentation, index: number): OrderLine {
  return { id: crypto.randomUUID(), productId: product.id, reference: product.reference, barcode: product.barcodes.find((item) => item.presentation === presentation)?.code ?? product.barcodes[0]?.code ?? product.sku, description: product.name, presentation, requested: quantity, picked: quantity, unitPrice: product.price, taxRate: product.taxRate, image: imageFor(product), stock: product.stock, warehouse: product.warehouse, location: locationFor(product, index) }
}

function withHistory(order: CustomerOrder, action: string, detail: string): CustomerOrder {
  return { ...order, history: [...order.history, { id: crypto.randomUUID(), at: new Date().toISOString(), user: USER, action, detail }] }
}

function totalLines(lines: OrderLine[]) { return lines.reduce((sum, line) => sum + (line.picked || line.requested) * line.unitPrice * (1 + line.taxRate / 100), 0) }
function imageFor(product: ProductMaster) { return product.images[0] || PRODUCTS.find((item) => item.sku === product.sku)?.image || "/placeholder.svg" }
function sameCartLine(a: CartLine, b: CartLine) { return a.productId === b.productId && a.presentation === b.presentation }
function locationFor(product: ProductMaster, index: number) { return `${product.warehouse.slice(0, 3).toUpperCase()}-${String(index % 8 + 1).padStart(2, "0")}-R${String(index % 5 + 1).padStart(2, "0")}-N${String(index % 4 + 1).padStart(2, "0")}` }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(value)) }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) }
function nextOrderNumber(orders: CustomerOrder[]) { return `PED-${String(Math.max(45085, ...orders.map((order) => Number(order.number.replace(/\D/g, "")) || 0)) + 1).padStart(6, "0")}` }

function applyInventoryExit(order: CustomerOrder, products: ProductMaster[], setProducts: (products: ProductMaster[]) => void) {
  const nextProducts = products.map((product) => {
    const requested = order.lines.filter((line) => line.productId === product.id).reduce((sum, line) => sum + line.picked, 0)
    return requested ? { ...product, stock: Math.max(0, product.stock - requested) } : product
  })
  setProducts(nextProducts)
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(nextProducts))
  const previous = JSON.parse(localStorage.getItem(KARDEX_EVENTS_KEY) || "[]")
  const events = order.lines.map((line) => ({ id: crypto.randomUUID(), type: "Salida", source: "Pedido de cliente", document: order.number, productId: line.productId, reference: line.reference, quantity: line.picked, unitCost: line.unitPrice, warehouse: line.warehouse, user: USER, createdAt: new Date().toISOString() }))
  localStorage.setItem(KARDEX_EVENTS_KEY, JSON.stringify([...previous, ...events]))
}
