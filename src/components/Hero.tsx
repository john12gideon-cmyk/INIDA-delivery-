import { ArrowDown, ShieldCheck, Truck, Zap } from 'lucide-react'

const PERKS = [
  { icon: Truck, label: 'Same-day delivery in Uyo' },
  { icon: ShieldCheck, label: 'Sealed, hygienic packs' },
  { icon: Zap, label: 'Secure Paystack checkout' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
        <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          The premium Nigerian pantry
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink-900 sm:text-6xl">
          Market-fresh staples, <span className="text-brand-500">beautifully</span> packed.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
          Crayfish, dry fish and red palm oil — cleaned, sealed and delivered to your door. No haggling, no grit, no
          guesswork.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#shop"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-ink-900 px-6 text-sm font-semibold text-cream transition-colors hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            Shop the range
            <ArrowDown className="h-4 w-4" />
          </a>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-3">
          {PERKS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm font-medium text-ink-700">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm ring-1 ring-ink-100">
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
