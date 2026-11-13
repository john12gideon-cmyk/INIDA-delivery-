import { useCallback, useEffect, useState } from 'react'
import { CartDrawer } from './components/CartDrawer'
import { Checkout } from './components/Checkout'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ProductCard } from './components/ProductCard'
import { PRODUCTS } from './data/products'
import { useCart } from './hooks/useCart'
import type { CheckoutPayload } from './types'

const YEAR = new Date().getFullYear()

type View = 'shop' | 'checkout'

export default function App() {
  const cart = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [view, setView] = useState<View>('shop')
  const closeCart = useCallback(() => setCartOpen(false), [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view])

  // Checkout with an empty cart makes no sense; fall back to the shop.
  const showCheckout = view === 'checkout' && cart.items.length > 0

  const handleCheckout = () => {
    setCartOpen(false)
    setView('checkout')
  }

  const handlePay = (payload: CheckoutPayload) => {
    // Paystack wired in Milestone 4.
    console.info('Checkout payload ready', payload)
  }

  return (
    <div className="min-h-screen">
      <Header cartCount={cart.count} onCartClick={() => setCartOpen(true)} />
      <main>
        {showCheckout ? (
          <Checkout cart={cart} onBack={() => setView('shop')} onSubmit={handlePay} />
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

      <CartDrawer open={cartOpen} onClose={closeCart} cart={cart} onCheckout={handleCheckout} />
    </div>
  )
}
