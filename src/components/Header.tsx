import { ShoppingBag } from 'lucide-react'

interface HeaderProps {
  cartCount: number
  onCartClick: () => void
}

export function Header({ cartCount, onCartClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-100/80 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5" aria-label="INIDA home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-display text-lg font-bold text-cream">
            I
          </span>
          <span className="font-display text-xl font-bold tracking-[0.12em] text-ink-900">INIDA</span>
        </a>

        <button
          type="button"
          onClick={onCartClick}
          aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
          className="relative inline-flex h-11 items-center gap-2 rounded-full border border-ink-200 bg-white pl-4 pr-3 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2} />
          <span className="hidden sm:inline">Cart</span>
          <span
            className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums transition-colors ${
              cartCount > 0 ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-500'
            }`}
          >
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  )
}
