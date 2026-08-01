import { CatalogView } from "@/components/store/catalog-view"

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>
}) {
  const { categoria, q } = await searchParams
  return <CatalogView initialCategory={categoria} initialQuery={q} />
}
