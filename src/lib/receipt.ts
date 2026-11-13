import type { ConfirmedOrder } from '../types'
import { formatNaira } from './format'

export function itemDescription(i: { variantLabel?: string | null; sizeLabel: string }): string {
  return [i.variantLabel, i.sizeLabel].filter(Boolean).join(' · ')
}

/** Plain-text receipt for clipboard and WhatsApp. */
export function formatReceipt(order: ConfirmedOrder): string {
  const date = new Date(order.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
  const lines = [
    `INIDA Order #${order.orderCode}`,
    date,
    '',
    `Name: ${order.customerName}`,
    `WhatsApp: ${order.customerPhone}`,
  ]
  if (order.fulfillment === 'delivery') {
    lines.push(
      `Fulfillment: Doorstep Delivery (${order.zoneLabel ?? ''})`,
      `Address: ${order.address ?? ''}`,
      `Landmark: ${order.landmark ?? ''}`,
    )
  } else {
    lines.push('Fulfillment: Pickup')
  }
  lines.push('', 'Items:')
  for (const i of order.items) {
    lines.push(`- ${i.quantity} x ${i.name} (${itemDescription(i)}): ${formatNaira(i.lineTotal)}`)
  }
  lines.push(
    '',
    `Subtotal: ${formatNaira(order.subtotal)}`,
    `${order.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}: ${order.deliveryFee ? formatNaira(order.deliveryFee) : 'Free'}`,
    `Total paid: ${formatNaira(order.total)}`,
    '',
    `Payment ref: ${order.reference}`,
  )
  return lines.join('\n')
}

/** Clipboard write with a fallback for older/insecure contexts. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to legacy path.
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}
