import { useCallback, useEffect, useRef, useState } from 'react'
import { CartDrawer } from './components/CartDrawer'
import { Checkout } from './components/Checkout'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { PaymentStatusOverlay } from './components/PaymentStatusOverlay'
import { ProductCard } from './components/ProductCard'
import { SuccessScreen } from './components/SuccessScreen'
import { PRODUCTS } from './data/products'
import { useCart } from './hooks/useCart'
import {
  OrderError,
  buildOrderRequest,
  clearPendingOrder,
  confirmOrder,
  loadPendingOrder,
  savePendingOrder,
  type CreateOrderRequest,
} from './services/orders'
import { createPaymentReference, emailForPhone, loadPaystack, payWithPaystack } from './services/paystack'
import type { CheckoutPayload, ConfirmedOrder } from './types'

const YEAR = new Date().getFullYear()

type View = 'shop' | 'checkout' | 'success'

type PaymentState =
  | { kind: 'idle' }
  | { kind: 'paying' }
  | { kind: 'confirming' }
  | { kind: 'error'; message: string; reference?: string; canRetry: boolean }

export default function App() {
  const cart = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [view, setView] = useState<View>('shop')
  const [payment, setPayment] = useState<PaymentState>(() =>
    loadPendingOrder() ? { kind: 'confirming' } : { kind: 'idle' },
  )
  const [order, setOrder] = useState<ConfirmedOrder | null>(null)
  const pendingRef = useRef<CreateOrderRequest | null>(null)
  const closeCart = useCallback(() => setCartOpen(false), [])
  const { clear: clearCart } = cart

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view])

  // Preload Paystack as soon as the customer reaches checkout.
  useEffect(() => {
    if (view === 'checkout') loadPaystack().catch(() => undefined)
  }, [view])

  // Sends the paid order to create-order. Only sets state after awaiting.
  const runConfirm = useCallback(
    async (request: CreateOrderRequest) => {
      pendingRef.current = request
      try {
        const confirmed = await confirmOrder(request)
        clearPendingOrder()
        pendingRef.current = null
        clearCart()
        setOrder(confirmed)
        setView('success')
        setPayment({ kind: 'idle' })
      } catch (err) {
        const e = err instanceof OrderError ? err : new OrderError('Unexpected error.', 'server_error')
        setPayment({ kind: 'error', message: e.message, reference: request.reference, canRetry: e.retryable })
      }
    },
    [clearCart],
  )

  const finalize = (request: CreateOrderRequest) => {
    setPayment({ kind: 'confirming' })
    void runConfirm(request)
  }

  // Recover a payment that succeeded but was never confirmed (tab closed, network drop).
  // Initial state is already 'confirming' in that case (see useState above).
  useEffect(() => {
    const pending = loadPendingOrder()
    // runConfirm only sets state after awaiting the network call.
    // oxlint-disable-next-line react/set-state-in-effect
    if (pending) void runConfirm(pending)
  }, [runConfirm])

  const handlePay = async (payload: CheckoutPayload) => {
    const reference = createPaymentReference()
    const request = buildOrderRequest(reference, payload)
    setPayment({ kind: 'paying' })
    try {
      await payWithPaystack({
        reference,
        amountNaira: payload.total,
        email: emailForPhone(payload.customer.phone),
        metadata: { customer_name: payload.customer.fullName, phone: payload.customer.phone },
        onSuccess: () => {
          savePendingOrder(request)
          finalize(request)
        },
        onCancel: () => setPayment((p) => (p.kind === 'paying' ? { kind: 'idle' } : p)),
      })
    } catch (err) {
      setPayment({ kind: 'error', message: (err as Error).message, canRetry: false })
    }
  }

  const dismissError = () => {
    // Keep the pending order stored if it was paid; it will retry on next load.
    setPayment({ kind: 'idle' })
  }

  const showCheckout = view === 'checkout' && cart.items.length > 0
  const showSuccess = view === 'success' && order !== null

  return (
    <div className="min-h-screen">
      <Header cartCount={cart.count} onCartClick={() => setCartOpen(true)} />
      <main>
        {showSuccess ? (
          <SuccessScreen
            order={order}
            onContinue={() => {
              setOrder(null)
              setView('shop')
            }}
          />
        ) : showCheckout ? (
          <Checkout
            cart={cart}
            onBack={() => setView('shop')}
            onSubmit={handlePay}
            submitting={payment.kind === 'paying'}
          />
        ) : (
          <>
            <Hero />
            <section id="shop" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24 sm:px-6">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Flagship range</p>
                  <h2 className="mt-1.5 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">Shop INIDA</h2>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {PRODUCTS.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={cart.addItem} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="border-t border-ink-100 py-8 text-center text-xs text-ink-400">
        © {YEAR} INIDA Foods. Uyo, Akwa Ibom.
      </footer>

      <CartDrawer open={cartOpen} onClose={closeCart} cart={cart} onCheckout={() => {
        setCartOpen(false)
        setView('checkout')
      }} />

      {(payment.kind === 'confirming' || payment.kind === 'error') && (
        <PaymentStatusOverlay
          state={payment}
          onRetry={() => pendingRef.current && finalize(pendingRef.current)}
          onDismiss={dismissError}
        />
      )}
    </div>
  )
}
