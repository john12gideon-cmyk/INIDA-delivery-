import type { CatalogCategory, CatalogProduct, CatalogZone, CategoryId, ProductId } from '../../supabase/functions/_shared/catalog'

export type { CategoryId, ProductId }
export type Product = CatalogProduct
export type Category = CatalogCategory
export type DeliveryZone = CatalogZone

export interface CartItem {
  /** Unique key: productId + variantId + sizeId */
  key: string
  productId: ProductId
  name: string
  variantId?: string
  variantLabel?: string
  sizeId: string
  sizeLabel: string
  unitPrice: number
  quantity: number
}

export type FulfillmentMethod = 'delivery' | 'pickup'

export interface CustomerDetails {
  fullName: string
  phone: string // WhatsApp number
  email: string // optional; used for the Paystack receipt
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

/** Order as stored and returned by the create-order Edge Function. */
export interface ConfirmedOrderItem {
  productId: ProductId
  name: string
  variantId: string | null
  variantLabel: string | null
  sizeId: string
  sizeLabel: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface ConfirmedOrder {
  orderCode: string
  reference: string
  createdAt: string
  fulfillment: FulfillmentMethod
  customerName: string
  customerPhone: string
  zoneLabel: string | null
  address: string | null
  landmark: string | null
  items: ConfirmedOrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
}
