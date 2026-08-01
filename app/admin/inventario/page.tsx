import { PageHeader } from "@/components/admin/page-header"
import { StockControlView } from "@/components/admin/stock-control-view"

export default function InventarioPage() {
  return <div><PageHeader title="Inventario" description="Existencias, disponibilidad, niveles de reposición y valorización por bodega" /><StockControlView /></div>
}
