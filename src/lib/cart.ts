import { CATALOG, MAX_QUANTITY_PER_LINE } from '../../supabase/functions/_shared/catalog.ts'
import type { CartItem } from '../types'

export function cartKey(productId: string, sizeId: string): string {
  return `${productId}:${sizeId}`
}

/**
 * Rebuilds a cart loaded from storage against the current catalog.
 * Lines whose product or size no longer exists are dropped, prices and
 * labels come from the catalog, and quantities are clamped to the server limit.
 */
export function reconcileCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []
  const items: CartItem[] = []
  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) continue
    const line = entry as Record<string, unknown>
    if (line.variantId !== undefined && line.variantId !== null) continue
    const product = CATALOG.find((p) => p.id === line.productId)
    const size = product?.sizes.find((s) => s.id === line.sizeId)
    if (!product || !size) continue
    const quantity = line.quantity
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) continue
    const key = cartKey(product.id, size.id)
    if (items.some((i) => i.key === key)) continue
    items.push({
      key,
      productId: product.id,
      name: product.name,
      sizeId: size.id,
      sizeLabel: size.label,
      unitPrice: size.price,
      quantity: Math.min(quantity, MAX_QUANTITY_PER_LINE),
    })
  }
  return items
}
