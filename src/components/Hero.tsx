import { ArrowDown } from 'lucide-react'

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
      <div className="max-w-xl">
        <h1 className="font-display text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.02em] text-ink-900 sm:text-6xl">
          Pantry staples from Akwa Ibom, cleaned and sealed.
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-500 sm:text-lg">
          Crayfish, smoked fish and red palm oil, packed by weight and delivered to your door.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href="#shop"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-ink-900 px-6 text-sm font-semibold text-cream transition-colors hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            Shop the range
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
          <p className="text-sm text-ink-500">Same-day delivery within Uyo.</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-brand-100 aspect-[4/3] lg:aspect-[4/5]">
        <img
          src="/images/palm-oil.jpg"
          alt="Freshly pressed red palm oil in a white bowl"
          width={998}
          height={1434}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </section>
  )
}
