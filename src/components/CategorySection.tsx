import type { CartApi } from '../hooks/useCart'
import { cartKey } from '../lib/cart'
import type { Category, Product } from '../types'
import { ProductCard } from './ProductCard'

interface CategorySectionProps {
  category: Category
  products: Product[]
  cart: CartApi
}

export function CategorySection({ category, products, cart }: CategorySectionProps) {
  const headingId = `category-${category.id}`

  return (
    <section aria-labelledby={headingId} className="border-t border-ink-200/70 py-10 first:border-t-0 first:pt-2">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <h2 id={headingId} className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900 sm:text-3xl">
          {category.name}
        </h2>
        <p className="text-sm text-ink-500">{category.intro}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const [size] = product.sizes
          const key = cartKey(product.id, size.id)
          const quantity = cart.items.find((i) => i.key === key)?.quantity ?? 0
          return (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantity}
              onAdd={() =>
                cart.addItem({
                  key,
                  productId: product.id,
                  name: product.name,
                  sizeId: size.id,
                  sizeLabel: size.label,
                  unitPrice: size.price,
                })
              }
              onSetQuantity={(q) => cart.setQuantity(key, q)}
            />
          )
        })}
      </div>
    </section>
  )
}
