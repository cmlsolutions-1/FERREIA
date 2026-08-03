import { ArrowRightLeft, Boxes, FileCheck2, Landmark, Receipt, ShieldCheck } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { MOVEMENT_MODULES } from "@/lib/movement-modules"

export default function MovimientosPage() {
  const operationModules = MOVEMENT_MODULES.filter((item) => ["Punto de venta", "Compras"].includes(item.category))
  const dian = operationModules.filter((item) => item.dian).length
  const inventory = operationModules.filter((item) => item.effects.includes("Inventario")).length
  const accounting = operationModules.filter((item) => item.effects.includes("Contabilidad")).length
  return <div className="space-y-5">
    <PageHeader title="Movimientos" description="Gestión central de documentos y operaciones empresariales" />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Summary icon={ArrowRightLeft} label="Submódulos configurados" value={String(operationModules.length)} />
      <Summary icon={ShieldCheck} label="Integraciones DIAN" value={String(dian)} />
      <Summary icon={Boxes} label="Afectan inventario" value={String(inventory)} />
      <Summary icon={Landmark} label="Generan contabilidad" value={String(accounting)} />
    </div>
    <Card><CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center"><span className="rounded-2xl bg-primary/10 p-4 text-primary"><FileCheck2 className="h-8 w-8" /></span><h2 className="mt-4 text-xl font-bold">Selecciona un movimiento desde el menú lateral</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Los documentos contables, ventas, operaciones POS, compras y movimientos de inventario ahora están organizados como submódulos dentro de “Movimientos” en el sidebar.</p><div className="mt-5 flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-xs text-muted-foreground"><Receipt className="h-4 w-4" />Cada opción conserva su ruta, alcance, efectos e integración regulatoria.</div></CardContent></Card>
  </div>
}

function Summary({ icon: Icon, label, value }: { icon: typeof Boxes; label: string; value: string }) { return <Card><CardContent className="flex items-center gap-3 p-4"><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold">{value}</p></div></CardContent></Card> }
