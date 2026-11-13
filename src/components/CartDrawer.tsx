import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { CartApi } from '../hooks/useCart'
import { formatNaira } from '../lib/format'
import { PackagingMockup } from './PackagingMockup'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  cart: CartApi
  onCheckout: () => void
}

export function CartDrawer({ open, onClose, cart, onCheckout }: CartDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  // Escape to close, lock page scroll, move focus into the drawer.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const empty = cart.items.length === 0

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        inert={!open}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink-100 px-5">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-xl font-semibold text-ink-900">Your cart</h2>
            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-ink-600">
              {cart.count}
            </span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
              <ShoppingBag className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <p className="mt-5 font-display text-xl font-semibold text-ink-900">Your cart is empty</p>
            <p className="mt-1.5 text-sm text-ink-500">Add crayfish, dry fish or palm oil to get started.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-ink-900 px-5 text-sm font-semibold text-cream transition-colors hover:bg-ink-800"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink-100 overflow-y-auto overscroll-contain px-5">
              {cart.items.map((item) => (
                <li key={item.key} className="flex gap-4 py-5">
                  <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-brand-50 to-white p-1.5 ring-1 ring-ink-100">
                    <PackagingMockup productId={item.productId} variantLabel={item.variantLabel} sizeLabel={item.sizeLabel} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-900">{item.name}</p>
                        <p className="mt-0.5 text-xs text-ink-500">
                          {[item.variantLabel, item.sizeLabel].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => cart.removeItem(item.key)}
                        aria-label={`Remove ${item.name}`}
                        className="-mr-1.5 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-ink-200 bg-white">
                        <button
                          type="button"
                          onClick={() => cart.setQuantity(item.key, item.quantity - 1)}
                          aria-label={`Decrease ${item.name} quantity`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold tabular-nums text-ink-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => cart.setQuantity(item.key, item.quantity + 1)}
                          aria-label={`Increase ${item.name} quantity`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                      <p className="text-sm font-semibold tabular-nums text-ink-900">
                        {formatNaira(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="shrink-0 border-t border-ink-100 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-ink-500">Subtotal</span>
                <span className="font-display text-2xl font-semibold tabular-nums text-ink-900">
                  {formatNaira(cart.subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-400">Delivery fee calculated at checkout.</p>
              <button
                type="button"
                onClick={onCheckout}
                className="mt-4 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand-500 text-[15px] font-semibold text-white transition-all hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.99]"
              >
                Checkout
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
