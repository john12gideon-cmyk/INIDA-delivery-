import { CATALOG } from '../../supabase/functions/_shared/catalog'
import type { Product } from '../types'

// Prices live in the shared catalog so the server prices orders identically.
export const PRODUCTS: Product[] = CATALOG
