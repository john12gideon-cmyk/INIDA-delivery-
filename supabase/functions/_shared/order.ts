// Pure order logic shared by the Edge Function and tests.
// Never trusts client prices: everything is recomputed from CATALOG.

import { CATALOG, DELIVERY_ZONES, MAX_QUANTITY_PER_LINE, type CatalogZone } from './catalog.ts'

export type Fulfillment = 'delivery' | 'pickup'

export interface CreateOrderRequest {
  reference: string
  fulfillment: Fulfillment
  customer: {
    fullName: string
    phone: string
    zoneId: string
    address: string
    landmark: string
  }
  items: { productId: string; variantId?: string; sizeId: string; quantity: number }[]
}

export interface PricedItem {
  productId: string
  name: string
  variantId: string | null
  variantLabel: string | null
  sizeId: string
  sizeLabel: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface PricedOrder {
  reference: string
  fulfillment: Fulfillment
  customerName: string
  customerPhone: string
  zone: CatalogZone | null
  address: string | null
  landmark: string | null
  items: PricedItem[]
  subtotal: number
  deliveryFee: number
  total: number
}

export class ValidationError extends Error {}

const PHONE_RE = /^(\+?234|0)[789][01]\d{8}$/
const REFERENCE_RE = /^[A-Za-z0-9_.=-]{8,100}$/

function str(value: unknown, field: string, { min = 0, max = 300 } = {}): string {
  if (typeof value !== 'string') throw new ValidationError(`${field} is required.`)
  const v = value.trim()
  if (v.length < min) throw new ValidationError(`${field} is too short.`)
  if (v.length > max) throw new ValidationError(`${field} is too long.`)
  return v
}

/** Validates an untrusted request body and prices it from the catalog. */
export function priceOrder(body: unknown): PricedOrder {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body.')
  const b = body as Record<string, unknown>

  const reference = str(b.reference, 'Payment reference')
  if (!REFERENCE_RE.test(reference)) throw new ValidationError('Invalid payment reference.')

  if (b.fulfillment !== 'delivery' && b.fulfillment !== 'pickup') {
    throw new ValidationError('Invalid fulfillment method.')
  }
  const fulfillment: Fulfillment = b.fulfillment

  if (typeof b.customer !== 'object' || b.customer === null) throw new ValidationError('Customer details are required.')
  const c = b.customer as Record<string, unknown>
  const customerName = str(c.fullName, 'Full name', { min: 2, max: 120 })
  const customerPhone = str(c.phone, 'Phone number', { max: 25 })
  if (!PHONE_RE.test(customerPhone.replace(/[\s()-]/g, ''))) throw new ValidationError('Invalid phone number.')

  let zone: CatalogZone | null = null
  let address: string | null = null
  let landmark: string | null = null
  if (fulfillment === 'delivery') {
    const zoneId = str(c.zoneId, 'Delivery zone')
    zone = DELIVERY_ZONES.find((z) => z.id === zoneId) ?? null
    if (!zone) throw new ValidationError('Unknown delivery zone.')
    address = str(c.address, 'Street address', { min: 5, max: 300 })
    landmark = str(c.landmark, 'Landmark', { min: 2, max: 200 })
  }

  if (!Array.isArray(b.items) || b.items.length === 0) throw new ValidationError('Your cart is empty.')
  if (b.items.length > 30) throw new ValidationError('Too many items.')

  const items: PricedItem[] = b.items.map((raw: unknown) => {
    if (typeof raw !== 'object' || raw === null) throw new ValidationError('Invalid item.')
    const i = raw as Record<string, unknown>
    const product = CATALOG.find((p) => p.id === i.productId)
    if (!product) throw new ValidationError('Unknown product.')
    const size = product.sizes.find((s) => s.id === i.sizeId)
    if (!size) throw new ValidationError(`Unknown size for ${product.name}.`)

    let variant: { id: string; label: string } | null = null
    if (product.variants) {
      variant = product.variants.find((v) => v.id === i.variantId) ?? null
      if (!variant) throw new ValidationError(`Choose a type for ${product.name}.`)
    } else if (i.variantId !== undefined && i.variantId !== null && i.variantId !== '') {
      throw new ValidationError(`${product.name} has no types.`)
    }

    const quantity = i.quantity
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      throw new ValidationError('Invalid quantity.')
    }

    return {
      productId: product.id,
      name: product.name,
      variantId: variant?.id ?? null,
      variantLabel: variant?.label ?? null,
      sizeId: size.id,
      sizeLabel: size.label,
      unitPrice: size.price,
      quantity,
      lineTotal: size.price * quantity,
    }
  })

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)
  const deliveryFee = zone?.fee ?? 0

  return {
    reference,
    fulfillment,
    customerName,
    customerPhone,
    zone,
    address,
    landmark,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  }
}

/** Random public order code like IND-8492. */
export function generateOrderCode(digits = 4): string {
  const min = 10 ** (digits - 1)
  const n = min + Math.floor(Math.random() * (9 * min))
  return `IND-${n}`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function naira(n: number): string {
  return `₦${n.toLocaleString('en-NG')}`
}

/** Telegram message body (parse_mode: HTML). */
export function formatTelegramMessage(order: PricedOrder, orderCode: string): string {
  const lines = [
    `<b>New paid order #${escapeHtml(orderCode)}</b>`,
    `<b>Total paid:</b> ${naira(order.total)} (NGN)`,
    '',
    `<b>Customer:</b> ${escapeHtml(order.customerName)}`,
    `<b>WhatsApp:</b> ${escapeHtml(order.customerPhone)}`,
  ]
  if (order.fulfillment === 'delivery') {
    lines.push(
      `<b>Fulfillment:</b> Doorstep Delivery, ${escapeHtml(order.zone?.label ?? '')} (fee ${naira(order.deliveryFee)})`,
      `<b>Address:</b> ${escapeHtml(order.address ?? '')}`,
      `<b>Landmark:</b> ${escapeHtml(order.landmark ?? '')}`,
    )
  } else {
    lines.push('<b>Fulfillment:</b> Pickup at INIDA')
  }
  lines.push('', '<b>Items</b>')
  for (const i of order.items) {
    const desc = [i.variantLabel, i.sizeLabel].filter(Boolean).join(', ')
    lines.push(`• ${i.quantity} × ${escapeHtml(i.name)} (${escapeHtml(desc)}) = ${naira(i.lineTotal)}`)
  }
  lines.push('', `<b>Paystack ref:</b> <code>${escapeHtml(order.reference)}</code>`)
  return lines.join('\n')
}
