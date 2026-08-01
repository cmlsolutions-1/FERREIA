"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileText,
  FilterX,
  Landmark,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldCheck,
  X,
} from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

type Nature = "Débito" | "Crédito"
type Level = "Clase" | "Grupo" | "Cuenta" | "Subcuenta" | "Auxiliar"
type Account = {
  code: string
  name: string
  level: Level
  nature: Nature
  parent: string | null
  active: boolean
  acceptsEntries: boolean
  source: "PUC" | "Empresa"
  description?: string
}

const classNames = [
  ["1", "Activo", "Débito"], ["2", "Pasivo", "Crédito"], ["3", "Patrimonio", "Crédito"],
  ["4", "Ingresos", "Crédito"], ["5", "Gastos", "Débito"], ["6", "Costos de ventas", "Débito"],
  ["7", "Costos de producción o de operación", "Débito"], ["8", "Cuentas de orden deudoras", "Débito"],
  ["9", "Cuentas de orden acreedoras", "Crédito"],
] as const

const groupNames: Array<[string, string]> = [
  ["11", "Disponible"], ["12", "Inversiones"], ["13", "Deudores"], ["14", "Inventarios"], ["15", "Propiedades, planta y equipo"], ["16", "Intangibles"], ["17", "Diferidos"], ["18", "Otros activos"], ["19", "Valorizaciones"],
  ["21", "Obligaciones financieras"], ["22", "Proveedores"], ["23", "Cuentas por pagar"], ["24", "Impuestos, gravámenes y tasas"], ["25", "Obligaciones laborales"], ["26", "Pasivos estimados y provisiones"], ["27", "Diferidos"], ["28", "Otros pasivos"], ["29", "Bonos y papeles comerciales"],
  ["31", "Capital social"], ["32", "Superávit de capital"], ["33", "Reservas"], ["34", "Revalorización del patrimonio"], ["35", "Dividendos decretados en acciones"], ["36", "Resultados del ejercicio"], ["37", "Resultados de ejercicios anteriores"], ["38", "Superávit por valorizaciones"],
  ["41", "Operacionales"], ["42", "No operacionales"], ["47", "Ajustes por inflación"], ["51", "Operacionales de administración"], ["52", "Operacionales de ventas"], ["53", "No operacionales"], ["54", "Impuesto de renta y complementarios"], ["59", "Ganancias y pérdidas"],
  ["61", "Costo de ventas y prestación de servicios"], ["62", "Compras"], ["71", "Materia prima"], ["72", "Mano de obra directa"], ["73", "Costos indirectos"], ["74", "Contratos de servicios"],
  ["81", "Derechos contingentes"], ["82", "Deudoras fiscales"], ["83", "Deudoras de control"], ["84", "Derechos contingentes por contra"], ["85", "Deudoras fiscales por contra"], ["86", "Deudoras de control por contra"],
  ["91", "Responsabilidades contingentes"], ["92", "Acreedoras fiscales"], ["93", "Acreedoras de control"], ["94", "Responsabilidades contingentes por contra"], ["95", "Acreedoras fiscales por contra"], ["96", "Acreedoras de control por contra"],
]

const commonAccounts: Array<[string, string, string]> = [
  ["1105", "Caja", "11"], ["1110", "Bancos", "11"], ["1120", "Cuentas de ahorro", "11"], ["1305", "Clientes", "13"], ["1330", "Anticipos y avances", "13"], ["1355", "Anticipo de impuestos y contribuciones", "13"], ["1399", "Provisiones", "13"],
  ["1405", "Materias primas", "14"], ["1435", "Mercancías no fabricadas por la empresa", "14"], ["1499", "Provisiones", "14"], ["1524", "Equipo de oficina", "15"], ["1528", "Equipo de computación y comunicación", "15"], ["1540", "Flota y equipo de transporte", "15"], ["1592", "Depreciación acumulada", "15"],
  ["2105", "Bancos nacionales", "21"], ["2205", "Proveedores nacionales", "22"], ["2210", "Proveedores del exterior", "22"], ["2305", "Cuentas corrientes comerciales", "23"], ["2335", "Costos y gastos por pagar", "23"], ["2365", "Retención en la fuente", "23"], ["2367", "Impuesto a las ventas retenido", "23"], ["2368", "Impuesto de industria y comercio retenido", "23"], ["2380", "Acreedores varios", "23"], ["2404", "De renta y complementarios", "24"], ["2408", "Impuesto sobre las ventas por pagar", "24"], ["2505", "Salarios por pagar", "25"], ["2510", "Cesantías consolidadas", "25"],
  ["3105", "Capital suscrito y pagado", "31"], ["3115", "Aportes sociales", "31"], ["3305", "Reservas obligatorias", "33"], ["3605", "Utilidad del ejercicio", "36"], ["3610", "Pérdida del ejercicio", "36"], ["3705", "Utilidades acumuladas", "37"],
  ["4135", "Comercio al por mayor y al por menor", "41"], ["4175", "Devoluciones, rebajas y descuentos en ventas", "41"], ["4210", "Financieros", "42"], ["4295", "Diversos", "42"],
  ["5105", "Gastos de personal", "51"], ["5110", "Honorarios", "51"], ["5115", "Impuestos", "51"], ["5120", "Arrendamientos", "51"], ["5135", "Servicios", "51"], ["5145", "Mantenimiento y reparaciones", "51"], ["5160", "Depreciaciones", "51"], ["5195", "Diversos", "51"], ["5205", "Gastos de personal", "52"], ["5235", "Servicios", "52"], ["5305", "Financieros", "53"], ["5395", "Gastos diversos", "53"], ["5905", "Ganancias y pérdidas", "59"],
  ["6135", "Comercio al por mayor y al por menor", "61"], ["6205", "De mercancías", "62"],
]

const subAccounts: Array<[string, string, string]> = [
  ["110505", "Caja general", "1105"], ["110510", "Cajas menores", "1105"], ["111005", "Moneda nacional", "1110"], ["130505", "Clientes nacionales", "1305"], ["133005", "A proveedores", "1330"], ["135515", "Retención en la fuente", "1355"], ["143501", "Ferretería y herramientas", "1435"], ["143502", "Materiales de construcción", "1435"],
  ["220501", "Proveedores nacionales", "2205"], ["233525", "Honorarios", "2335"], ["233550", "Servicios públicos", "2335"], ["236505", "Salarios y pagos laborales", "2365"], ["236540", "Compras", "2365"], ["240805", "IVA generado", "2408"], ["240810", "IVA descontable", "2408"],
  ["310505", "Capital autorizado", "3105"], ["330505", "Reserva legal", "3305"], ["413501", "Venta de productos de ferretería", "4135"], ["417501", "Devoluciones en ventas", "4175"], ["510506", "Sueldos", "5105"], ["510527", "Auxilio de transporte", "5105"], ["513505", "Aseo y vigilancia", "5135"], ["513525", "Acueducto y alcantarillado", "5135"], ["513530", "Energía eléctrica", "5135"], ["513535", "Teléfono e internet", "5135"], ["613501", "Costo de mercancía vendida", "6135"],
]

function createInitialAccounts(): Account[] {
  const classes: Account[] = classNames.map(([code, name, nature]) => ({ code, name, nature, level: "Clase", parent: null, active: true, acceptsEntries: false, source: "PUC" }))
  const groups: Account[] = groupNames.map(([code, name]) => ({ code, name, nature: classNames.find(([c]) => c === code[0])?.[2] ?? "Débito", level: "Grupo", parent: code[0], active: true, acceptsEntries: false, source: "PUC" }))
  const accounts: Account[] = commonAccounts.map(([code, name, parent]) => ({ code, name, parent, nature: classNames.find(([c]) => c === code[0])?.[2] ?? "Débito", level: "Cuenta", active: true, acceptsEntries: false, source: "PUC" }))
  const subs: Account[] = subAccounts.map(([code, name, parent]) => ({ code, name, parent, nature: classNames.find(([c]) => c === code[0])?.[2] ?? "Débito", level: "Subcuenta", active: true, acceptsEntries: true, source: code.endsWith("01") || code === "143502" ? "Empresa" : "PUC" }))
  return [...classes, ...groups, ...accounts, ...subs]
}

const STORAGE_KEY = "ferreia-accounting-puc"
const emptyAccount: Account = { code: "", name: "", level: "Auxiliar", nature: "Débito", parent: null, active: true, acceptsEntries: true, source: "Empresa", description: "" }

export function PucView() {
  const [accounts, setAccounts] = useState<Account[]>(createInitialAccounts)
  const [query, setQuery] = useState("")
  const [classFilter, setClassFilter] = useState("todas")
  const [levelFilter, setLevelFilter] = useState("todos")
  const [statusFilter, setStatusFilter] = useState("activos")
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["1", "2", "3", "4", "5", "6"]))
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<Account>(emptyAccount)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setAccounts(JSON.parse(stored) as Account[])
  }, [])

  const childCounts = useMemo(() => accounts.reduce<Record<string, number>>((map, item) => { if (item.parent) map[item.parent] = (map[item.parent] ?? 0) + 1; return map }, {}), [accounts])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return accounts.filter((item) => {
      const matchesQuery = !q || item.code.includes(q) || item.name.toLowerCase().includes(q)
      return matchesQuery && (classFilter === "todas" || item.code.startsWith(classFilter)) && (levelFilter === "todos" || item.level === levelFilter) && (statusFilter === "todos" || (statusFilter === "activos" ? item.active : !item.active))
    })
  }, [accounts, query, classFilter, levelFilter, statusFilter])
  const searchMode = !!query || levelFilter !== "todos" || classFilter !== "todas" || statusFilter !== "activos"
  const visible = filtered.filter((item) => searchMode || !item.parent || ancestorsExpanded(item, accounts, expanded))

  function persist(next: Account[]) { setAccounts(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) }
  function toggleExpanded(code: string) { setExpanded((current) => { const next = new Set(current); next.has(code) ? next.delete(code) : next.add(code); return next }) }
  function openCreate() { setEditingCode(null); setForm({ ...emptyAccount }); setFormOpen(true) }
  function openChild(parent: Account) {
    const nextLevel: Level = parent.level === "Clase" ? "Grupo" : parent.level === "Grupo" ? "Cuenta" : parent.level === "Cuenta" ? "Subcuenta" : "Auxiliar"
    setEditingCode(null); setForm({ ...emptyAccount, parent: parent.code, level: nextLevel, nature: parent.nature }); setFormOpen(true)
  }
  function openEdit(account: Account) { setEditingCode(account.code); setForm({ ...account }); setFormOpen(true) }
  function save(event: React.FormEvent) {
    event.preventDefault()
    const clean = { ...form, code: form.code.replace(/\D/g, ""), name: form.name.trim() }
    if (!clean.code || !clean.name || (!editingCode && accounts.some((item) => item.code === clean.code))) return
    const next = editingCode ? accounts.map((item) => item.code === editingCode ? clean : item) : [...accounts, clean]
    persist(next.sort((a, b) => a.code.localeCompare(b.code))); setFormOpen(false); setExpanded((current) => new Set([...current, clean.parent ?? ""]))
  }
  function toggleStatus(account: Account) { persist(accounts.map((item) => item.code === account.code ? { ...item, active: !item.active } : item)) }
  function resetFilters() { setQuery(""); setClassFilter("todas"); setLevelFilter("todos"); setStatusFilter("activos") }
  function exportCsv() {
    const rows = [["Código", "Nombre", "Nivel", "Naturaleza", "Cuenta padre", "Permite movimiento", "Estado", "Origen"], ...filtered.map((a) => [a.code, a.name, a.level, a.nature, a.parent ?? "", a.acceptsEntries ? "Sí" : "No", a.active ? "Activa" : "Inactiva", a.source])]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n")
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" })); link.download = "puc-comercial-ferreia.csv"; link.click(); URL.revokeObjectURL(link.href)
  }

  return <div className="space-y-5">
    <PageHeader title="Plan Único de Cuentas" description="Catálogo contable comercial, jerarquías y cuentas auxiliares de la empresa" action={<div className="flex gap-2"><Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Exportar</Button><Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nueva cuenta</Button></div>} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Cuentas registradas" value={accounts.length.toLocaleString("es-CO")} detail="Catálogo y auxiliares" icon={BookOpenCheck} />
      <Stat label="Cuentas imputables" value={accounts.filter((a) => a.acceptsEntries && a.active).length.toString()} detail="Aceptan movimientos" icon={CircleDollarSign} />
      <Stat label="Auxiliares propios" value={accounts.filter((a) => a.source === "Empresa").length.toString()} detail="Adaptadas a FERREIA" icon={Landmark} />
      <Stat label="Catálogo activo" value={`${Math.round(accounts.filter((a) => a.active).length / accounts.length * 100)}%`} detail="Disponibilidad operativa" icon={CheckCircle2} />
    </div>

    <Tabs defaultValue="catalogo" className="space-y-4"><TabsList><TabsTrigger value="catalogo">Catálogo de cuentas</TabsTrigger><TabsTrigger value="estructura">Estructura y políticas</TabsTrigger></TabsList>
      <TabsContent value="catalogo" className="space-y-4">
        {formOpen && <AccountForm form={form} setForm={setForm} accounts={accounts} editing={!!editingCode} close={() => setFormOpen(false)} save={save} />}
        <Card><CardContent className="p-4"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_190px_160px_150px_auto]">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar por código o nombre de cuenta..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          <Select value={classFilter} onValueChange={(v) => v && setClassFilter(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todas">Todas las clases</SelectItem>{classNames.map(([c, n]) => <SelectItem key={c} value={c}>{c} · {n}</SelectItem>)}</SelectContent></Select>
          <Select value={levelFilter} onValueChange={(v) => v && setLevelFilter(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos los niveles</SelectItem>{["Clase", "Grupo", "Cuenta", "Subcuenta", "Auxiliar"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="activos">Solo activas</SelectItem><SelectItem value="inactivos">Solo inactivas</SelectItem><SelectItem value="todos">Todos los estados</SelectItem></SelectContent></Select>
          <Button variant="outline" onClick={resetFilters}><FilterX className="h-4 w-4" /></Button>
        </div></CardContent></Card>
        <Card className="overflow-hidden"><div className="flex items-center justify-between border-b px-4 py-3"><div><p className="font-semibold">Catálogo PUC comercial</p><p className="text-xs text-muted-foreground">{visible.length} registros visibles · Usa las flechas para explorar la jerarquía</p></div><Badge variant="secondary">Colombia</Badge></div><div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-muted/40"><TableHead className="w-32">Código</TableHead><TableHead>Nombre de la cuenta</TableHead><TableHead>Nivel</TableHead><TableHead>Naturaleza</TableHead><TableHead>Movimiento</TableHead><TableHead>Origen</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader><TableBody>{visible.map((account) => <AccountRow key={account.code} account={account} hasChildren={!!childCounts[account.code]} expanded={expanded.has(account.code)} toggle={() => toggleExpanded(account.code)} edit={() => openEdit(account)} add={() => openChild(account)} toggleStatus={() => toggleStatus(account)} />)}</TableBody></Table></div></Card>
      </TabsContent>
      <TabsContent value="estructura"><StructurePanel /></TabsContent>
    </Tabs>
  </div>
}

function ancestorsExpanded(item: Account, accounts: Account[], expanded: Set<string>) { let parent = item.parent; while (parent) { if (!expanded.has(parent)) return false; parent = accounts.find((a) => a.code === parent)?.parent ?? null } return true }

function Stat({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Landmark }) { return <Card><CardContent className="flex items-start justify-between p-4"><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></div><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" /></span></CardContent></Card> }

function AccountRow({ account, hasChildren, expanded, toggle, edit, add, toggleStatus }: { account: Account; hasChildren: boolean; expanded: boolean; toggle: () => void; edit: () => void; add: () => void; toggleStatus: () => void }) {
  const depth = account.code.length === 1 ? 0 : account.code.length === 2 ? 1 : account.code.length === 4 ? 2 : account.code.length === 6 ? 3 : 4
  return <TableRow className={!account.active ? "opacity-55" : account.level === "Clase" ? "bg-primary/[0.035]" : ""}><TableCell className="font-mono font-semibold"><div className="flex items-center" style={{ paddingLeft: depth * 16 }}><button onClick={toggle} disabled={!hasChildren} className="mr-1 flex h-6 w-6 items-center justify-center rounded hover:bg-muted disabled:opacity-0">{expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button>{account.code}</div></TableCell><TableCell><p className={account.level === "Clase" ? "font-bold uppercase" : account.level === "Grupo" ? "font-semibold" : "font-medium"}>{account.name}</p>{account.description && <p className="text-xs text-muted-foreground">{account.description}</p>}</TableCell><TableCell><Badge variant="outline">{account.level}</Badge></TableCell><TableCell><span className={account.nature === "Débito" ? "text-sky-700" : "text-violet-700"}>{account.nature}</span></TableCell><TableCell>{account.acceptsEntries ? <span className="text-emerald-700">Sí</span> : <span className="text-muted-foreground">No</span>}</TableCell><TableCell><Badge variant="secondary" className={account.source === "Empresa" ? "bg-cyan-50 text-cyan-800" : ""}>{account.source}</Badge></TableCell><TableCell><button onClick={toggleStatus}><Badge variant="secondary" className={account.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}>{account.active ? "Activa" : "Inactiva"}</Badge></button></TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={add} title="Agregar subcuenta"><Plus className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={edit} title="Editar cuenta"><Pencil className="h-4 w-4" /></Button></div></TableCell></TableRow>
}

function AccountForm({ form, setForm, accounts, editing, close, save }: { form: Account; setForm: React.Dispatch<React.SetStateAction<Account>>; accounts: Account[]; editing: boolean; close: () => void; save: (e: React.FormEvent) => void }) {
  return <Card className="border-accent/40"><div className="flex items-center justify-between border-b px-5 py-4"><div><p className="font-semibold">{editing ? "Editar cuenta contable" : "Crear cuenta contable"}</p><p className="text-xs text-muted-foreground">Los auxiliares propios deben conservar la jerarquía del catálogo.</p></div><Button variant="ghost" size="icon" onClick={close}><X className="h-4 w-4" /></Button></div><CardContent className="p-5"><form onSubmit={save} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><div className="space-y-1.5"><Label>Código *</Label><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.replace(/\D/g, "") }))} placeholder="Ej. 14350101" required /></div><div className="space-y-1.5 md:col-span-2"><Label>Nombre de la cuenta *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nombre descriptivo" required /></div><div className="space-y-1.5"><Label>Nivel</Label><Select value={form.level} onValueChange={(v) => v && setForm((f) => ({ ...f, level: v as Level }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Clase", "Grupo", "Cuenta", "Subcuenta", "Auxiliar"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><Label>Cuenta padre</Label><Select value={form.parent ?? "ninguna"} onValueChange={(v) => setForm((f) => ({ ...f, parent: v === "ninguna" ? null : v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ninguna">Sin cuenta padre</SelectItem>{accounts.filter((a) => a.code !== form.code && a.level !== "Auxiliar").map((a) => <SelectItem key={a.code} value={a.code}>{a.code} · {a.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><Label>Naturaleza</Label><Select value={form.nature} onValueChange={(v) => v && setForm((f) => ({ ...f, nature: v as Nature }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Débito">Débito</SelectItem><SelectItem value="Crédito">Crédito</SelectItem></SelectContent></Select></div><div className="space-y-1.5"><Label>Permite movimiento</Label><Select value={form.acceptsEntries ? "si" : "no"} onValueChange={(v) => setForm((f) => ({ ...f, acceptsEntries: v === "si" }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="si">Sí, recibe asientos</SelectItem><SelectItem value="no">No, solo agrupa</SelectItem></SelectContent></Select></div><div className="space-y-1.5"><Label>Estado</Label><Select value={form.active ? "activo" : "inactivo"} onValueChange={(v) => setForm((f) => ({ ...f, active: v === "activo" }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="activo">Activa</SelectItem><SelectItem value="inactivo">Inactiva</SelectItem></SelectContent></Select></div><div className="space-y-1.5 md:col-span-2 xl:col-span-4"><Label>Descripción o política de uso</Label><Textarea value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Indique cuándo debe utilizarse esta cuenta..." /></div><div className="flex justify-end gap-2 md:col-span-2 xl:col-span-4"><Button type="button" variant="outline" onClick={close}>Cancelar</Button><Button type="submit"><Save className="mr-2 h-4 w-4" />Guardar cuenta</Button></div></form></CardContent></Card>
}

function StructurePanel() { return <div className="grid gap-4 lg:grid-cols-[1fr_360px]"><Card><CardContent className="p-5"><div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><FileText className="h-5 w-5" /></span><div><p className="font-semibold">Estructura de codificación</p><p className="text-xs text-muted-foreground">Jerarquía utilizada por el catálogo de cuentas</p></div></div><div className="grid gap-3 sm:grid-cols-5">{[["1", "Clase"], ["11", "Grupo"], ["1105", "Cuenta"], ["110505", "Subcuenta"], ["11050501", "Auxiliar"]].map(([code, level], index) => <div key={level} className="rounded-xl border p-4 text-center"><p className="font-mono text-lg font-bold text-primary">{code}</p><p className="mt-1 text-xs text-muted-foreground">{level}</p><p className="mt-2 text-[10px] text-muted-foreground">{index === 4 ? "Empresa" : "PUC base"}</p></div>)}</div><div className="mt-5 rounded-xl bg-muted/60 p-4 text-sm"><p className="font-semibold">Regla operativa</p><p className="mt-1 leading-6 text-muted-foreground">Las clases, grupos y cuentas consolidan información. Los asientos contables deben registrarse únicamente en subcuentas o auxiliares marcados como imputables. Las extensiones internas conservan el prefijo de su cuenta padre.</p></div></CardContent></Card><Card><CardContent className="space-y-4 p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-600" /><p className="font-semibold">Políticas de control</p></div>{["Código único y exclusivamente numérico", "Naturaleza heredada de la clase contable", "Inactivación sin eliminar el historial", "Auxiliares empresariales separados del PUC base", "Exportación disponible para auditoría"].map((text) => <div key={text} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{text}</span></div>)}<div className="border-t pt-4 text-xs leading-5 text-muted-foreground">Catálogo inicial basado en la estructura tradicional del PUC para comerciantes de Colombia. La parametrización contable definitiva debe validarse con el contador de la organización y su marco técnico aplicable.</div></CardContent></Card></div> }
