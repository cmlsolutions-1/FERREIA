import { PageHeader } from "@/components/admin/page-header"
import { ProductCatalogView } from "@/components/admin/product-catalog-view"

export default function ArticulosPage() {
  return <div><PageHeader title="Catálogo de artículos" description="Maestro empresarial de productos, referencias, empaques y proveedores" /><ProductCatalogView /></div>
}
