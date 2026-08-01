import { PageHeader } from "@/components/admin/page-header"
import { InventoryView } from "@/components/admin/inventory-view"

export default function InventarioPage() {
  return (
    <div>
      <PageHeader
        title="Inventario"
        description="Control de existencias, códigos de barras y referencias por bodega"
      />
      <InventoryView />
    </div>
  )
}
