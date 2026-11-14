import { Plus } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { MAX_QUANTITY_PER_LINE } from '../../supabase/functions/_shared/catalog'
import { formatNaira } from '../lib/format'
import type { Product } from '../types'
import { ProductImage } from './ProductImage'
import { QuantityStepper } from './QuantityStepper'

interface ProductCardProps {
  product: Product
  /** Quantity of this product already in the cart (0 if none). */
  quantity: number
  onAdd: () => void
  onSetQuantity: (quantity: number) => void
}

export function ProductCard({ product, quantity, onAdd, onSetQuantity }: ProductCardProps) {
  const [size] = product.sizes
  const inCart = quantity > 0
  const addRef = useRef<HTMLButtonElement>(null)
  const incrementRef = useRef<HTMLButtonElement>(null)
  // Set when this card's own control swaps Add and the stepper, so focus follows the swap.
  const keepFocus = useRef(false)

  useEffect(() => {
    if (!keepFocus.current) return
    keepFocus.current = false
    ;(inCart ? incrementRef : addRef).current?.focus()
  }, [inCart])

  const handleAdd = () => {
    keepFocus.current = true
    onAdd()
  }

  const handleSetQuantity = (q: number) => {
    if (q <= 0) keepFocus.current = true
    onSetQuantity(q)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-ink-100 shadow-[0_1px_2px_rgba(42,33,27,0.05)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(42,33,27,0.35)] motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0">
          <ProductImage product={product} alt={`${product.name}, ${size.label}`} />
        </div>
        <span className="absolute bottom-3 left-3 rounded-lg bg-ink-900 px-2.5 py-1 font-display text-sm font-semibold tabular-nums text-cream">
          {product.badge}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink-900">{product.name}</h3>
        <p className="mt-2">
          <span className="inline-flex rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-medium text-ink-600 ring-1 ring-ink-100">
            {size.label}
          </span>
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="font-display text-xl font-semibold tabular-nums text-ink-900">{formatNaira(size.price)}</p>
          {inCart ? (
            <QuantityStepper
              value={quantity}
              max={MAX_QUANTITY_PER_LINE}
              onChange={handleSetQuantity}
              label={product.name}
              incrementRef={incrementRef}
            />
          ) : (
            <button
              type="button"
              ref={addRef}
              onClick={handleAdd}
              aria-label={`Add ${product.name}, ${size.label}, to cart`}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:bg-brand-700"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
