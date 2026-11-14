import { Check, Copy, MapPin, MessageCircle, Store, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PICKUP_LOCATION } from '../data/fulfillment'
import { whatsappLink } from '../lib/config'
import { formatNaira } from '../lib/format'
import { copyText, formatReceipt, itemDescription } from '../lib/receipt'
import type { ConfirmedOrder } from '../types'

interface SuccessScreenProps {
  order: ConfirmedOrder
  onContinue: () => void
}

export function SuccessScreen({ order, onContinue }: SuccessScreenProps) {
  const [toast, setToast] = useState<'copied' | 'failed' | null>(null)
  const receipt = formatReceipt(order)
  const waLink = whatsappLink(`Hello INIDA, here is my order receipt:\n\n${receipt}`)
  const isDelivery = order.fulfillment === 'delivery'

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2000)
    return () => window.clearTimeout(t)
  }, [toast])

  const handleCopy = async () => {
    setToast((await copyText(receipt)) ? 'copied' : 'failed')
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-10 sm:pt-16">
      {/* Animated emerald check */}
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-[success-ring_1.2s_ease-out_0.35s_both] rounded-full bg-success/25" />
          <span className="relative flex h-24 w-24 animate-[success-pop_500ms_cubic-bezier(0.34,1.56,0.64,1)_both] items-center justify-center rounded-full bg-success shadow-[0_12px_32px_-8px_rgba(16,185,129,0.6)]">
            <Check
              className="h-12 w-12 text-white [&_path]:animate-[success-draw_400ms_ease-out_300ms_both] [&_path]:[stroke-dasharray:24] [&_path]:[stroke-dashoffset:24]"
              strokeWidth={3}
            />
          </span>
        </div>
        <h1 className="mt-7 animate-[rise-in_500ms_ease-out_200ms_both] font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
          Order confirmed
        </h1>
        <p className="mt-2 animate-[rise-in_500ms_ease-out_280ms_both] text-ink-500">
          Thank you, {order.customerName.split(' ')[0]}. Payment received.
        </p>
        <p className="mt-5 animate-[rise-in_500ms_ease-out_360ms_both] rounded-full border border-ink-200 bg-card px-4 py-1.5 font-mono text-sm font-semibold tracking-wide text-ink-900">
          #{order.orderCode}
        </p>
      </div>

      <div className="mt-10 animate-[rise-in_600ms_ease-out_450ms_both] overflow-hidden rounded-3xl border border-ink-100 bg-card">
        {/* Fulfillment summary */}
        <div className="flex gap-4 border-b border-ink-100 p-5 sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            {isDelivery ? <Truck className="h-5 w-5" /> : <Store className="h-5 w-5" />}
          </span>
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-ink-900">{isDelivery ? 'Doorstep Delivery' : 'Pickup at INIDA'}</p>
            {isDelivery ? (
              <>
                <p className="mt-0.5 text-ink-500">{order.zoneLabel}</p>
                <p className="mt-1 text-ink-700">{order.address}</p>
                <p className="text-ink-500">Near {order.landmark}</p>
              </>
            ) : (
              <>
                <p className="mt-0.5 text-ink-700">{PICKUP_LOCATION.address}</p>
                <a
                  href={PICKUP_LOCATION.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Get directions
                </a>
              </>
            )}
            <p className="mt-2 text-ink-500">
              We'll message you on WhatsApp at <span className="font-medium text-ink-700">{order.customerPhone}</span>.
            </p>
          </div>
        </div>

        {/* Items */}
        <ul className="divide-y divide-ink-100 px-5 sm:px-6">
          {order.items.map((i) => (
            <li key={`${i.productId}:${i.variantId ?? ''}:${i.sizeId}`} className="flex justify-between gap-4 py-3.5 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-ink-900">
                  {i.name} <span className="text-ink-400">× {i.quantity}</span>
                </p>
                <p className="text-xs text-ink-500">{itemDescription(i)}</p>
              </div>
              <span className="shrink-0 tabular-nums text-ink-900">{formatNaira(i.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-ink-100 bg-ink-50/50 p-5 text-sm sm:px-6">
          <div className="flex justify-between">
            <dt className="text-ink-500">Subtotal</dt>
            <dd className="tabular-nums text-ink-900">{formatNaira(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">{isDelivery ? 'Delivery' : 'Pickup'}</dt>
            <dd className="tabular-nums text-ink-900">{order.deliveryFee ? formatNaira(order.deliveryFee) : 'Free'}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-ink-200/70 pt-3">
            <dt className="font-semibold text-ink-900">Total paid</dt>
            <dd className="font-display text-2xl font-semibold tabular-nums text-ink-900">{formatNaira(order.total)}</dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="mt-6 grid animate-[rise-in_600ms_ease-out_550ms_both] gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ink-200 bg-card text-sm font-semibold text-ink-900 transition-colors hover:border-ink-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          {toast === 'copied' ? <Check className="h-4 w-4 text-success" strokeWidth={2.5} /> : <Copy className="h-4 w-4" />}
          {toast === 'copied' ? 'Copied!' : 'Copy Receipt'}
        </button>
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ink-200 bg-card text-sm font-semibold text-ink-900 transition-colors hover:border-ink-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            <MessageCircle className="h-4 w-4" />
            Send to INIDA on WhatsApp
          </a>
        ) : null}
        <button
          type="button"
          onClick={onContinue}
          className={`inline-flex h-12 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-cream transition-colors hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
            waLink ? 'sm:col-span-2' : ''
          }`}
        >
          Continue shopping
        </button>
      </div>

      {/* Toast */}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 transition-all duration-200 ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2.5 text-sm font-medium text-cream shadow-lg">
          {toast === 'failed' ? (
            'Could not copy. Please select the text manually.'
          ) : (
            <>
              <Check className="h-4 w-4 text-success" strokeWidth={2.5} />
              Receipt copied to clipboard
            </>
          )}
        </span>
      </div>
    </div>
  )
}
