import { ArrowLeft, Clock, ExternalLink, Info, Lock, MapPin } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { DELIVERY_ZONES, PICKUP_LOCATION } from '../data/fulfillment'
import type { CartApi } from '../hooks/useCart'
import { formatNaira } from '../lib/format'
import { validateCustomer } from '../lib/validation'
import type { CheckoutPayload, CustomerDetails, FulfillmentMethod } from '../types'
import { inputClass } from '../lib/styles'
import { FormField } from './FormField'
import { FulfillmentToggle } from './FulfillmentToggle'

interface CheckoutProps {
  cart: CartApi
  onBack: () => void
  onSubmit: (payload: CheckoutPayload) => void
  submitting?: boolean
  /** Non-error status shown above the pay button, e.g. after the customer closes Paystack. */
  notice?: string
}

const DRAFT_KEY = 'inida.checkout.v1'

const EMPTY: CustomerDetails = { fullName: '', phone: '', email: '', zoneId: '', address: '', landmark: '' }

function loadDraft(): CustomerDetails {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<CustomerDetails>) } : EMPTY
  } catch {
    return EMPTY
  }
}

export function Checkout({ cart, onBack, onSubmit, submitting = false, notice }: CheckoutProps) {
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>('delivery')
  const [customer, setCustomer] = useState<CustomerDetails>(loadDraft)
  const [attempted, setAttempted] = useState(false)

  // Remember details so returning customers don't retype them.
  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(customer))
    } catch {
      // Ignore storage failures.
    }
  }, [customer])

  // Errors show live, but only after the first submit attempt.
  const errors = attempted ? validateCustomer(customer, fulfillment) : {}

  const zone = DELIVERY_ZONES.find((z) => z.id === customer.zoneId)
  const deliveryFee = fulfillment === 'delivery' ? (zone?.fee ?? 0) : 0
  const total = cart.subtotal + deliveryFee

  const update = <K extends keyof CustomerDetails>(key: K, value: CustomerDetails[K]) =>
    setCustomer((c) => ({ ...c, [key]: value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setAttempted(true)
    const found = validateCustomer(customer, fulfillment)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      document.getElementById(`co-${firstInvalid}`)?.focus()
      return
    }
    onSubmit({
      fulfillment,
      customer: {
        ...customer,
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim(),
        address: fulfillment === 'delivery' ? customer.address.trim() : '',
        landmark: fulfillment === 'delivery' ? customer.landmark.trim() : '',
        zoneId: fulfillment === 'delivery' ? customer.zoneId : '',
      },
      deliveryZone: fulfillment === 'delivery' ? zone : undefined,
      items: cart.items,
      subtotal: cart.subtotal,
      deliveryFee,
      total,
    })
  }

  const describedBy = (k: keyof CustomerDetails) => `co-${k}-msg`

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-10 items-center gap-1.5 rounded-full pl-2 pr-4 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shop
      </button>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">Checkout</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
        {/* Left: details */}
        <div className="space-y-6">
          <section className="rounded-3xl border border-ink-100 bg-card p-5 sm:p-7">
            <h2 className="text-base font-semibold text-ink-900">How would you like to receive it?</h2>
            <div className="mt-4">
              <FulfillmentToggle value={fulfillment} onChange={setFulfillment} />
            </div>
          </section>

          <section className="rounded-3xl border border-ink-100 bg-card p-5 sm:p-7">
            <h2 className="text-base font-semibold text-ink-900">Your details</h2>
            <div className="mt-5 grid gap-x-4 gap-y-2 sm:grid-cols-2">
              <FormField id="co-fullName" label="Full name" error={errors.fullName}>
                <input
                  id="co-fullName"
                  autoComplete="name"
                  value={customer.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={describedBy('fullName')}
                  placeholder="Ada Okon"
                  className={inputClass(!!errors.fullName)}
                />
              </FormField>
              <FormField id="co-phone" label="WhatsApp number" error={errors.phone} hint="We'll send order updates here.">
                <input
                  id="co-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={customer.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  aria-invalid={!!errors.phone}
                  aria-describedby={describedBy('phone')}
                  placeholder="0801 234 5678"
                  className={inputClass(!!errors.phone)}
                />
              </FormField>
              <div className="sm:col-span-2">
                <FormField id="co-email" label="Email (optional)" error={errors.email} hint="For your Paystack payment receipt.">
                  <input
                    id="co-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={customer.email}
                    onChange={(e) => update('email', e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={describedBy('email')}
                    placeholder="you@example.com"
                    className={inputClass(!!errors.email)}
                  />
                </FormField>
              </div>
            </div>
          </section>

          {fulfillment === 'delivery' ? (
            <section key="delivery" className="animate-[price-in_250ms_ease-out] rounded-3xl border border-ink-100 bg-card p-5 sm:p-7">
              <h2 className="text-base font-semibold text-ink-900">Delivery address</h2>
              <div className="mt-5 grid gap-y-2">
                <FormField id="co-zoneId" label="Delivery zone" error={errors.zoneId}>
                  <select
                    id="co-zoneId"
                    value={customer.zoneId}
                    onChange={(e) => update('zoneId', e.target.value)}
                    aria-invalid={!!errors.zoneId}
                    aria-describedby={describedBy('zoneId')}
                    className={`${inputClass(!!errors.zoneId)} appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%2379828f'%20stroke-width='2'%3E%3Cpath%20d='m6%209%206%206%206-6'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10 ${
                      customer.zoneId ? '' : 'text-ink-300'
                    }`}
                  >
                    <option value="" disabled>
                      Select your area
                    </option>
                    {DELIVERY_ZONES.map((z) => (
                      <option key={z.id} value={z.id} className="text-ink-900">
                        {z.label} — {formatNaira(z.fee)}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField id="co-address" label="Street address" error={errors.address}>
                  <input
                    id="co-address"
                    autoComplete="street-address"
                    value={customer.address}
                    onChange={(e) => update('address', e.target.value)}
                    aria-invalid={!!errors.address}
                    aria-describedby={describedBy('address')}
                    placeholder="House number, street name"
                    className={inputClass(!!errors.address)}
                  />
                </FormField>
                <FormField id="co-landmark" label="Closest landmark" error={errors.landmark}>
                  <input
                    id="co-landmark"
                    value={customer.landmark}
                    onChange={(e) => update('landmark', e.target.value)}
                    aria-invalid={!!errors.landmark}
                    aria-describedby={describedBy('landmark')}
                    placeholder="e.g. Opposite Ibom Plaza"
                    className={inputClass(!!errors.landmark)}
                  />
                </FormField>
              </div>
            </section>
          ) : (
            <section key="pickup" className="animate-[price-in_250ms_ease-out] rounded-3xl border border-ink-100 bg-card p-5 sm:p-7">
              <h2 className="text-base font-semibold text-ink-900">Pickup location</h2>
              <div className="mt-5 flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink-900">{PICKUP_LOCATION.name}</p>
                  <p className="mt-0.5 text-sm text-ink-500">{PICKUP_LOCATION.address}</p>
                  <a
                    href={PICKUP_LOCATION.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Open in Google Maps
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
              <div className="mt-5 flex gap-4 border-t border-ink-100 pt-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-600">
                  <Clock className="h-5 w-5" />
                </span>
                <dl className="grid flex-1 grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
                  {PICKUP_LOCATION.hours.map((h) => (
                    <div key={h.days} className="contents">
                      <dt className="font-medium text-ink-700">{h.days}</dt>
                      <dd className="text-ink-500">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          )}
        </div>

        {/* Right: summary */}
        <aside className="rounded-2xl border border-ink-100 bg-card/80 p-5 backdrop-blur-md sm:p-7 lg:sticky lg:top-24">
          <h2 className="text-base font-semibold text-ink-900">Order summary</h2>
          <ul className="mt-4 divide-y divide-ink-100">
            {cart.items.map((item) => (
              <li key={item.key} className="flex items-start justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">
                    {item.name} <span className="text-ink-400">× {item.quantity}</span>
                  </p>
                  <p className="text-xs text-ink-500">{[item.variantLabel, item.sizeLabel].filter(Boolean).join(' · ')}</p>
                </div>
                <span className="shrink-0 font-medium tabular-nums text-ink-900">{formatNaira(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-2 space-y-2 border-t border-ink-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="tabular-nums text-ink-900">{formatNaira(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">{fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}</dt>
              <dd className="tabular-nums text-ink-900">
                {fulfillment === 'pickup' ? 'Free' : zone ? formatNaira(deliveryFee) : <span className="text-ink-400">Select zone</span>}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-ink-100 pt-3">
              <dt className="font-semibold text-ink-900">Total</dt>
              <dd className="font-display text-2xl font-semibold tabular-nums text-ink-900">{formatNaira(total)}</dd>
            </div>
          </dl>

          {notice && !submitting && (
            <p role="status" className="mt-5 flex items-start gap-2 rounded-xl bg-brand-50 px-3.5 py-3 text-sm text-brand-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              {notice}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || cart.items.length === 0}
            className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand-500 text-[15px] font-semibold text-white transition-all hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-ink-300"
          >
            <Lock className="h-4 w-4" strokeWidth={2.5} />
            {submitting ? 'Opening secure payment…' : `Pay Now · ${formatNaira(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-ink-400">Secured by Paystack. Card, transfer and USSD accepted.</p>
        </aside>
      </form>
    </div>
  )
}
