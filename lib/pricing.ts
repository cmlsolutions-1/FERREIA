import type { Product, ProductPriceTiers } from "@/lib/data"

export type PriceBreakdownLine = {
  key: keyof ProductPriceTiers
  label: string
  packs: number
  quantity: number
  unitPrice: number
  total: number
}

export type TieredPriceResult = {
  quantity: number
  total: number
  averageUnitPrice: number
  savings: number
  breakdown: PriceBreakdownLine[]
  suggestion?: string
}

export function calculateTieredPrice(product: Product, quantity: number): TieredPriceResult {
  const safeQuantity = Math.max(1, Math.floor(quantity))
  const { unit, inner, master } = product.priceTiers
  let remaining = safeQuantity
  const breakdown: PriceBreakdownLine[] = []

  const masterPacks = Math.floor(remaining / master.quantity)
  if (masterPacks > 0) {
    const masterQuantity = masterPacks * master.quantity
    breakdown.push({
      key: "master",
      label: master.label,
      packs: masterPacks,
      quantity: masterQuantity,
      unitPrice: master.unitPrice,
      total: masterQuantity * master.unitPrice,
    })
    remaining -= masterQuantity
  }

  const innerPacks = Math.floor(remaining / inner.quantity)
  if (innerPacks > 0) {
    const innerQuantity = innerPacks * inner.quantity
    breakdown.push({
      key: "inner",
      label: inner.label,
      packs: innerPacks,
      quantity: innerQuantity,
      unitPrice: inner.unitPrice,
      total: innerQuantity * inner.unitPrice,
    })
    remaining -= innerQuantity
  }

  if (remaining > 0) {
    breakdown.push({
      key: "unit",
      label: unit.label,
      packs: remaining,
      quantity: remaining,
      unitPrice: unit.unitPrice,
      total: remaining * unit.unitPrice,
    })
  }

  const total = breakdown.reduce((acc, line) => acc + line.total, 0)
  const regularTotal = safeQuantity * unit.unitPrice
  const suggestion = getTierSuggestion(safeQuantity, product.priceTiers)

  return {
    quantity: safeQuantity,
    total,
    averageUnitPrice: Math.round(total / safeQuantity),
    savings: Math.max(0, regularTotal - total),
    breakdown,
    suggestion,
  }
}

export function getTierSuggestion(quantity: number, tiers: ProductPriceTiers) {
  const safeQuantity = Math.max(1, Math.floor(quantity))
  const missingForMaster = tiers.master.quantity - (safeQuantity % tiers.master.quantity)
  const missingForInner = tiers.inner.quantity - (safeQuantity % tiers.inner.quantity)

  if (missingForMaster > 0 && missingForMaster !== tiers.master.quantity) {
    return `Te faltan ${missingForMaster} unidades para completar otra caja máster y mejorar el precio.`
  }

  if (missingForInner > 0 && missingForInner !== tiers.inner.quantity) {
    return `Te faltan ${missingForInner} unidades para completar otra caja inner y mejorar el precio.`
  }

  return undefined
}
