import { Plus } from 'lucide-react'
import { cartKey } from '../lib/cart'
import { formatNaira } from '../lib/format'
import type { CartItem, Product } from '../types'
import { ProductImage } from './ProductImage'

interface ProductCardProps {
  product: Product
  onAdd: (item: Omit<CartItem, 'quantity'>) => void
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const [size] = product.sizes

  const handleAdd = () => {
    onAdd({
      key: cartKey(product.id, size.id),
      productId: product.id,
      name: product.name,
      sizeId: size.id,
      sizeLabel: size.label,
      unitPrice: size.price,
    })
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-card">
      <div className="aspect-[4/3]">
        <ProductImage product={product} alt={`${product.name}, ${size.label}`} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-semibold text-ink-900">{product.name}</h3>
        <p className="text-sm text-ink-500">{size.label}</p>
        <div className="mt-auto flex items-center justify-between">
          <p className="font-display text-xl font-semibold tabular-nums text-ink-900">{formatNaira(size.price)}</p>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add
          </button>
        </div>
      </div>
    </article>
  )
}
