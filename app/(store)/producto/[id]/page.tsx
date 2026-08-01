import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/store/product-detail"
import { getProduct, PRODUCTS } from "@/lib/data"

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }))
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()
  return <ProductDetail product={product} />
}
