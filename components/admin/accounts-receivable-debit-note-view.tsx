"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Landmark,
  Plus,
  Printer,
  Save,
  Search,
  Send,
  X,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CUSTOMERS, formatCOP } from "@/lib/data"

type DebitNoteStatus = "Borrador" | "Aprobada" | "Anulada"

type DebitNote = {
  id: string
  number: string
  date: string
  dueDate: string
  customerId: string
  customerName: string
  referenceDocument: string
  concept: string
  accountCode: string
  detail: string
  base: number
  taxRate: number
  status: DebitNoteStatus
  createdAt: string
}

type AccountingLine = {
  code: string
  name: string
  detail: string
  debit: number
  credit: number
  thirdParty?: string
}

const STORAGE_KEY = "ferreia-ar-debit-notes-v1"
const today = () => new Date().toISOString().slice(0, 10)
const plusDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const concepts = [
  { value: "Intereses de mora", account: "421005", label: "Ingresos financieros - intereses" },
  { value: "Flete o gasto por cobrar", account: "429505", label: "Ingresos diversos" },
  { value: "Ajuste por diferencia de precio", account: "413501", label: "Venta de productos de ferretería" },
  { value: "Gastos administrativos de cobro", account: "429505", label: "Ingresos diversos" },
  { value: "Otros cargos al cliente", account: "429505", label: "Ingresos diversos" },
]

const company = {
  name: "FERREIA S.A.S.",
  nit: "900123456-7",
  address: "Cra. 50 #80-120, Bogotá D.C.",
  email: "contabilidad@ferreia.co",
}

export function AccountsReceivableDebitNoteView() {
  const [notes, setNotes] = useState<DebitNote[]>([])
  const [date, setDate] = useState(today())
  const [dueDate, setDueDate] = useState(plusDays(15))
  const [customerId, setCustomerId] = useState(CUSTOMERS[0]?.id || "")
  const [customerName, setCustomerName] = useState(CUSTOMERS[0]?.nombre || "")
  const [referenceDocument, setReferenceDocument] = useState("FE-10231")
  const [concept, setConcept] = useState(concepts[0].value)
  const [detail, setDetail] = useState("Cargo adicional por intereses o ajuste de cartera.")
  const [base, setBase] = useState(85000)
  const [taxRate, setTaxRate] = useState(0)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState<DebitNote | null>(null)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setNotes(JSON.parse(stored) as DebitNote[])
  }, [])

  const selectedConcept = concepts.find((item) => item.value === concept) ?? concepts[0]
  const number = String(notes.length + 1).padStart(8, "0")
  const taxes = Math.round(base * taxRate / 100)
  const total = base + taxes
  const accounting = buildAccounting({
    base,
    taxes,
    total,
    incomeAccount: selectedConcept.account,
    incomeName: selectedConcept.label,
    detail,
    customerName,
  })
  const debit = accounting.reduce((sum, line) => sum + line.debit, 0)
  const credit = accounting.reduce((sum, line) => sum + line.credit, 0)
  const history = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...notes].reverse().filter((note) =>
      (!q || [note.number, note.customerId, note.customerName, note.referenceDocument, note.concept].some((value) => value.toLowerCase().includes(q))) &&
      (statusFilter === "todos" || note.status === statusFilter)
    )
  }, [notes, query, statusFilter])

  function chooseCustomer(id: string) {
    const customer = CUSTOMERS.find((item) => item.id === id)
    setCustomerId(id)
    setCustomerName(customer?.nombre || "")
    setSaved(false)
  }

  function buildNote(status: DebitNoteStatus): DebitNote {
    return {
      id: crypto.randomUUID(),
      number,
      date,
      dueDate,
      customerId,
      customerName,
      referenceDocument,
      concept,
      accountCode: selectedConcept.account,
      detail,
      base,
      taxRate,
      status,
      createdAt: new Date().toISOString(),
    }
  }

  function save(status: DebitNoteStatus = "Borrador") {
    if (!customerId || !customerName.trim()) {
      setError("Selecciona o completa el tercero de cartera.")
      return
    }
    if (!referenceDocument.trim()) {
      setError("Indica el documento o soporte que origina el cargo.")
      return
    }
    if (base <= 0) {
      setError("El valor base debe ser mayor a cero.")
      return
    }
    const note = buildNote(status)
    const next = [...notes, note]
    setNotes(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setPreview(note)
    setSaved(true)
    setError("")
  }

  function reset() {
    setDate(today())
    setDueDate(plusDays(15))
    setCustomerId(CUSTOMERS[0]?.id || "")
    setCustomerName(CUSTOMERS[0]?.nombre || "")
    setReferenceDocument("")
    setConcept(concepts[0].value)
    setDetail("")
    setBase(0)
    setTaxRate(0)
    setError("")
    setSaved(false)
    setPreview(null)
  }

  function updateStatus(id: string, status: DebitNoteStatus) {
    const next = notes.map((note) => note.id === id ? { ...note, status } : note)
    setNotes(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    if (preview?.id === id) setPreview(next.find((note) => note.id === id) ?? null)
  }

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/movimientos">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a movimientos
        </Link>
      </Button>

      <div className="flex flex-col justify-between gap-3 lg:flex-row">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold">Nota débito - cuentas por cobrar</h1>
            <Badge variant="secondary" className="font-mono">ND-CXC-{number}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Causa cargos adicionales al cliente, aumenta cartera y genera asiento contable sin transmisión DIAN.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={reset}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva
          </Button>
          <Button variant="outline" onClick={() => save()} disabled={saved}>
            <Save className="mr-2 h-4 w-4" />
            Guardar borrador
          </Button>
          <Button onClick={() => save("Aprobada")} disabled={saved}>
            <Send className="mr-2 h-4 w-4" />
            Aprobar y contabilizar
          </Button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Base cargo" value={base} />
        <Metric label="IVA generado" value={taxes} />
        <Metric label="Aumenta cartera" value={total} strong />
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Asiento</p>
            <p className={`mt-1 text-xl font-bold ${Math.abs(debit - credit) < 1 ? "text-emerald-700" : "text-rose-700"}`}>
              {Math.abs(debit - credit) < 1 ? "Balanceado" : "Revisar"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documento" className="space-y-4">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="documento">Documento</TabsTrigger>
          <TabsTrigger value="cartera">Cartera</TabsTrigger>
          <TabsTrigger value="contabilidad">Contabilidad</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="documento">
          <Card>
            <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Fecha">
                <Input type="date" value={date} onChange={(event) => { setDate(event.target.value); setSaved(false) }} />
              </Field>
              <Field label="Vence cartera">
                <Input type="date" value={dueDate} onChange={(event) => { setDueDate(event.target.value); setSaved(false) }} />
              </Field>
              <Field label="Cliente">
                <Select value={customerId} onValueChange={(value) => value && chooseCustomer(value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CUSTOMERS.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>{customer.id} · {customer.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Nombre / razón social">
                <Input value={customerName} onChange={(event) => { setCustomerName(event.target.value); setSaved(false) }} />
              </Field>
              <Field label="Documento origen">
                <Input value={referenceDocument} onChange={(event) => { setReferenceDocument(event.target.value); setSaved(false) }} placeholder="Factura, recibo o soporte interno" />
              </Field>
              <Field label="Concepto">
                <Select value={concept} onValueChange={(value) => { if (value) { setConcept(value); setSaved(false) } }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {concepts.map((item) => <SelectItem key={item.value} value={item.value}>{item.value}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Valor base">
                <Input type="number" min="0" value={base} onChange={(event) => { setBase(Number(event.target.value)); setSaved(false) }} />
              </Field>
              <Field label="IVA">
                <Select value={String(taxRate)} onValueChange={(value) => { if (value) { setTaxRate(Number(value)); setSaved(false) } }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0, 5, 19].map((rate) => <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <div className="md:col-span-2 xl:col-span-4">
                <Field label="Detalle / observación">
                  <Textarea value={detail} onChange={(event) => { setDetail(event.target.value); setSaved(false) }} placeholder="Describe el motivo contable y comercial de la nota débito." />
                </Field>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cartera">
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold">Afectación de cartera</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  La nota débito aumenta el saldo por cobrar del tercero seleccionado. No mueve caja hasta que se recaude.
                </p>
                <div className="mt-5 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tercero</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead className="text-right">Nuevo cargo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>{customerName || "—"}</TableCell>
                        <TableCell className="font-mono">{referenceDocument || "—"}</TableCell>
                        <TableCell>{concept}</TableCell>
                        <TableCell>{dueDate}</TableCell>
                        <TableCell className="text-right font-bold">{formatCOP(total)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-5">
                <h2 className="font-semibold">Controles antes de aprobar</h2>
                {[
                  "Tercero activo y plenamente identificado",
                  "Documento origen o soporte interno diligenciado",
                  "Período contable abierto",
                  "Asiento contable balanceado",
                  "Soporte autorizado por cartera o contabilidad",
                ].map((item) => (
                  <div key={item} className="flex gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contabilidad">
          <AccountingTable accounting={accounting} debit={debit} credit={credit} />
        </TabsContent>

        <TabsContent value="historial" className="space-y-4">
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_180px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por número, cliente, documento o concepto..." />
              </div>
              <Select value={statusFilter} onValueChange={(value) => value && setStatusFilter(value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="Borrador">Borrador</SelectItem>
                  <SelectItem value="Aprobada">Aprobada</SelectItem>
                  <SelectItem value="Anulada">Anulada</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <HistoryTable notes={history} preview={setPreview} updateStatus={updateStatus} />
        </TabsContent>
      </Tabs>

      {preview && <DebitNotePreview note={preview} close={() => setPreview(null)} updateStatus={updateStatus} />}
    </div>
  )
}

function buildAccounting({
  base,
  taxes,
  total,
  incomeAccount,
  incomeName,
  detail,
  customerName,
}: {
  base: number
  taxes: number
  total: number
  incomeAccount: string
  incomeName: string
  detail: string
  customerName: string
}): AccountingLine[] {
  return [
    {
      code: "130505",
      name: "Clientes nacionales",
      detail: "Aumento de cuenta por cobrar por nota débito",
      debit: total,
      credit: 0,
      thirdParty: customerName,
    },
    {
      code: incomeAccount,
      name: incomeName,
      detail: detail || "Ingreso o cargo causado al cliente",
      debit: 0,
      credit: base,
      thirdParty: customerName,
    },
    ...(taxes > 0 ? [{
      code: "240805",
      name: "IVA generado",
      detail: "Impuesto generado por nota débito",
      debit: 0,
      credit: taxes,
      thirdParty: customerName,
    }] : []),
  ]
}

function AccountingTable({ accounting, debit, credit }: { accounting: AccountingLine[]; debit: number; credit: number }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Asiento contable automático</p>
            <p className="text-xs text-muted-foreground">Débito a clientes y crédito a ingreso/IVA según concepto.</p>
          </div>
        </div>
        <Badge className={Math.abs(debit - credit) < 1 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"} variant="secondary">
          {Math.abs(debit - credit) < 1 ? "Balanceada" : "Desbalanceada"}
        </Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cuenta</TableHead>
            <TableHead>Detalle</TableHead>
            <TableHead>Tercero</TableHead>
            <TableHead className="text-right">Débito</TableHead>
            <TableHead className="text-right">Crédito</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounting.map((line) => (
            <TableRow key={line.code}>
              <TableCell>
                <p className="font-mono font-semibold">{line.code}</p>
                <p className="text-xs text-muted-foreground">{line.name}</p>
              </TableCell>
              <TableCell>{line.detail}</TableCell>
              <TableCell>{line.thirdParty || "—"}</TableCell>
              <TableCell className="text-right font-semibold">{line.debit ? formatCOP(line.debit) : "—"}</TableCell>
              <TableCell className="text-right font-semibold">{line.credit ? formatCOP(line.credit) : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="grid grid-cols-2 gap-4 border-t bg-muted/20 p-4 text-right">
        <div>
          <p className="text-xs text-muted-foreground">Total débitos</p>
          <p className="font-bold">{formatCOP(debit)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total créditos</p>
          <p className="font-bold">{formatCOP(credit)}</p>
        </div>
      </div>
    </Card>
  )
}

function HistoryTable({
  notes,
  preview,
  updateStatus,
}: {
  notes: DebitNote[]
  preview: (note: DebitNote) => void
  updateStatus: (id: string, status: DebitNoteStatus) => void
}) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nota</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Documento origen</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((note) => {
            const taxes = Math.round(note.base * note.taxRate / 100)
            return (
              <TableRow key={note.id}>
                <TableCell className="font-mono font-bold">ND-CXC-{note.number}</TableCell>
                <TableCell>{note.date}</TableCell>
                <TableCell>
                  <p className="font-medium">{note.customerName}</p>
                  <p className="text-xs text-muted-foreground">{note.customerId}</p>
                </TableCell>
                <TableCell className="font-mono text-xs">{note.referenceDocument}</TableCell>
                <TableCell className="text-right font-bold">{formatCOP(note.base + taxes)}</TableCell>
                <TableCell><Status status={note.status} /></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => preview(note)}>Ver</Button>
                    {note.status !== "Anulada" && (
                      <Button size="icon" variant="ghost" onClick={() => updateStatus(note.id, "Anulada")} title="Anular">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {!notes.length && (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                No hay notas débito para los filtros aplicados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  )
}

function DebitNotePreview({
  note,
  close,
  updateStatus,
}: {
  note: DebitNote
  close: () => void
  updateStatus: (id: string, status: DebitNoteStatus) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white">
        <div className="flex items-center justify-between border-b p-3">
          <div>
            <b>Nota débito cuentas por cobrar</b>
            <p className="text-xs text-muted-foreground">ND-CXC-{note.number}</p>
          </div>
          <div className="flex gap-2">
            {note.status === "Borrador" && <Button size="sm" onClick={() => updateStatus(note.id, "Aprobada")}>Aprobar</Button>}
            <Button size="sm" variant="outline" onClick={() => downloadNote(note)}>
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
            <Button size="sm" onClick={() => printNote(note)}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button size="icon" variant="ghost" onClick={close}><X className="h-4 w-4" /></Button>
          </div>
        </div>
        <iframe title="Vista previa de nota débito" className="min-h-0 flex-1 bg-slate-100" srcDoc={noteHtml(note)} />
      </div>
    </div>
  )
}

function noteHtml(note: DebitNote) {
  const taxes = Math.round(note.base * note.taxRate / 100)
  const total = note.base + taxes
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>ND-CXC-${note.number}</title><style>@page{size:Letter;margin:12mm}body{font:12px Arial;color:#17313b}.sheet{max-width:820px;margin:auto}.head{display:flex;justify-content:space-between;border-bottom:3px solid #153947;padding-bottom:14px}.brand{font-size:28px;font-weight:900;color:#153947}.right{text-align:right}.box{border:1px solid #9eafb5;padding:10px;margin:14px 0}.label{font-size:9px;color:#607780;text-transform:uppercase}table{width:100%;border-collapse:collapse;margin-top:14px}th{background:#153947;color:white;padding:7px;text-align:left}td{padding:7px;border-bottom:1px solid #c6d2d6}.totals{width:310px;margin:16px 0 16px auto}.totals div{display:flex;justify-content:space-between;padding:4px}.grand{border-top:2px solid #153947;font-size:15px;font-weight:bold}.note{border-top:1px solid #9eafb5;padding-top:12px;margin-top:18px;font-size:10px;line-height:1.5}</style></head><body><div class="sheet"><div class="head"><div><div class="brand">FERREIA</div><b>${esc(company.name)}</b><br>NIT ${esc(company.nit)}<br>${esc(company.address)}<br>${esc(company.email)}</div><div class="right"><h1>NOTA DÉBITO CXC</h1><b>ND-CXC-${note.number}</b><br>Fecha: ${note.date}<br>Vence: ${note.dueDate}<br>Estado: ${note.status}</div></div><div class="box"><span class="label">Cliente</span><br><b>${esc(note.customerName)}</b><br>${esc(note.customerId)}<br><span class="label">Documento origen</span><br>${esc(note.referenceDocument)}</div><table><thead><tr><th>Concepto</th><th>Detalle</th><th>Base</th><th>IVA</th><th>Total</th></tr></thead><tbody><tr><td>${esc(note.concept)}</td><td>${esc(note.detail)}</td><td>$${money(note.base)}</td><td>${note.taxRate}% · $${money(taxes)}</td><td><b>$${money(total)}</b></td></tr></tbody></table><div class="totals"><div><span>Base</span><b>$${money(note.base)}</b></div><div><span>IVA</span><b>$${money(taxes)}</b></div><div class="grand"><span>AUMENTA CARTERA</span><span>$${money(total)}</span></div></div><div class="note">Documento interno contable. No corresponde a nota electrónica DIAN. Genera débito a clientes y crédito a la cuenta de ingreso/IVA parametrizada.</div></div></body></html>`
}

function printNote(note: DebitNote) {
  const win = window.open("", "_blank", "width=920,height=760")
  if (!win) return
  win.document.write(noteHtml(note))
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 250)
}

function downloadNote(note: DebitNote) {
  const url = URL.createObjectURL(new Blob([noteHtml(note)], { type: "text/html;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = `ND-CXC-${note.number}.html`
  link.click()
  URL.revokeObjectURL(url)
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>
}

function Metric({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 ${strong ? "text-xl font-black text-primary" : "text-lg font-bold"}`}>{formatCOP(value)}</p></CardContent></Card>
}

function Status({ status }: { status: DebitNoteStatus }) {
  const style: Record<DebitNoteStatus, string> = {
    Borrador: "bg-slate-100 text-slate-700",
    Aprobada: "bg-emerald-50 text-emerald-700",
    Anulada: "bg-rose-50 text-rose-700",
  }
  return <Badge variant="secondary" className={style[status]}>{status}</Badge>
}

function money(value: number) {
  return new Intl.NumberFormat("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)
}

function esc(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!)
}
