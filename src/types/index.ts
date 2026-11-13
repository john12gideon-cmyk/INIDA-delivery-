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

export type FulfillmentMethod = 'delivery' | 'pickup'

export interface DeliveryZone {
  id: string
  label: string
  fee: number // Naira
}

export interface CustomerDetails {
  fullName: string
  phone: string // WhatsApp number
  zoneId: string
  address: string
  landmark: string
}

export interface CheckoutPayload {
  fulfillment: FulfillmentMethod
  customer: CustomerDetails
  deliveryZone?: DeliveryZone
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
}
