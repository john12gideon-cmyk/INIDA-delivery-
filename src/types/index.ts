export type ProductId = 'crayfish' | 'dryfish' | 'palmoil'

export type PackagingKind = 'pouch' | 'bottle'

export interface SizeOption {
  id: string
  label: string
  price: number // Naira
}

export interface VariantOption {
  id: string
  label: string
}

export interface Product {
  id: ProductId
  name: string
  tagline: string
  description: string
  packaging: PackagingKind
  /** Optional style/type choice, e.g. Whole vs Blended. */
  variants?: VariantOption[]
  sizes: SizeOption[]
}

export interface CartItem {
  /** Unique key: productId + variantId + sizeId */
  key: string
  productId: ProductId
  name: string
  variantLabel?: string
  sizeLabel: string
  unitPrice: number
  quantity: number
}
