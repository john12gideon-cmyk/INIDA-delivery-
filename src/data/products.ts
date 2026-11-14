import { CATALOG, CATEGORIES } from '../../supabase/functions/_shared/catalog'
import type { Category, Product } from '../types'

// Prices live in the shared catalog so the server prices orders identically.
export const PRODUCTS: Product[] = CATALOG
export const PRODUCT_CATEGORIES: Category[] = CATEGORIES

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}
