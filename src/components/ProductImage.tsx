import { Droplet, Fish, Shrimp } from 'lucide-react'
import { useState } from 'react'
import type { CategoryId, Product } from '../types'

const CATEGORY_ICON: Record<CategoryId, typeof Fish> = {
  crayfish: Shrimp,
  dryfish: Fish,
  palmoil: Droplet,
}

interface ProductImageProps {
  product: Product
  /** Decorative thumbnails pass an empty alt. */
  alt: string
  iconClassName?: string
  loading?: 'lazy' | 'eager'
}

/** Product photo that fills its parent; falls back to a category tile if missing or broken. */
export function ProductImage({ product, alt, iconClassName = 'h-10 w-10', loading = 'lazy' }: ProductImageProps) {
  const [failed, setFailed] = useState(false)

  if (!product.image || failed) {
    const Icon = CATEGORY_ICON[product.category]
    return (
      <div className="flex h-full w-full items-center justify-center bg-cream" role={alt ? 'img' : undefined} aria-label={alt || undefined}>
        <Icon className={`${iconClassName} text-brand-600/45`} strokeWidth={1.25} aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={product.image}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  )
}
