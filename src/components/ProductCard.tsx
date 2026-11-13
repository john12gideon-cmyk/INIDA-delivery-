import { Check, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatNaira } from '../lib/format'
import type { CartItem, Product } from '../types'
import { PackagingMockup } from './PackagingMockup'
import { PillGroup } from './PillGroup'

interface ProductCardProps {
  product: Product
  onAdd: (item: Omit<CartItem, 'quantity'>) => void
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id ?? '')
  const [sizeId, setSizeId] = useState(product.sizes[0].id)
  const [justAdded, setJustAdded] = useState(false)

  const variant = product.variants?.find((v) => v.id === variantId)
  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0]

  useEffect(() => {
    if (!justAdded) return
    const t = window.setTimeout(() => setJustAdded(false), 1400)
    return () => window.clearTimeout(t)
  }, [justAdded])

  const handleAdd = () => {
    onAdd({
      key: [product.id, variant?.id, size.id].filter(Boolean).join(':'),
      productId: product.id,
      name: product.name,
      variantId: variant?.id,
      variantLabel: variant?.label,
      sizeId: size.id,
      sizeLabel: size.label,
      unitPrice: size.price,
    })
    setJustAdded(true)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-[0_1px_2px_rgba(22,25,29,0.04),0_8px_24px_-12px_rgba(22,25,29,0.12)] transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(22,25,29,0.04),0_20px_40px_-16px_rgba(22,25,29,0.18)]">
      <div className="relative flex h-64 items-center justify-center bg-gradient-to-b from-brand-50 to-cream px-10 pt-6">
        <div className="h-full w-full max-w-[180px] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.02]">
          <PackagingMockup productId={product.id} variantLabel={variant?.label} sizeLabel={size.label} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">{product.tagline}</p>
          <h3 className="mt-1.5 font-display text-2xl font-semibold text-ink-900">{product.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{product.description}</p>
        </div>

        {product.variants && (
          <PillGroup label="Type" options={product.variants} value={variantId} onChange={setVariantId} />
        )}
        <PillGroup label="Size" options={product.sizes} value={sizeId} onChange={setSizeId} />

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-ink-100 pt-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-400">Price</p>
            <p key={size.price} className="animate-[price-in_200ms_ease-out] font-display text-2xl font-semibold tabular-nums text-ink-900">
              {formatNaira(size.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className={`inline-flex h-12 min-w-[148px] items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.97] ${
              justAdded ? 'bg-success' : 'bg-brand-500 hover:bg-brand-600'
            }`}
          >
            {justAdded ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Plus className="h-4 w-4" strokeWidth={2.5} />}
            {justAdded ? 'Added' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
