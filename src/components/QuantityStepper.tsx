import { Minus, Plus } from 'lucide-react'
import type { Ref } from 'react'

interface QuantityStepperProps {
  value: number
  max: number
  onChange: (quantity: number) => void
  /** Product name used in the button labels. */
  label: string
  size?: 'sm' | 'md'
  /** Lets the caller move focus onto the increase button. */
  incrementRef?: Ref<HTMLButtonElement>
}

const SIZES = {
  sm: { wrap: 'h-8', button: 'h-8 w-8', icon: 'h-3.5 w-3.5', value: 'w-7 text-sm' },
  md: { wrap: 'h-11', button: 'h-11 w-11', icon: 'h-4 w-4', value: 'w-8 text-[15px]' },
}

/** Minus at 1 calls onChange(0) so the caller can remove the line. */
export function QuantityStepper({ value, max, onChange, label, size = 'md', incrementRef }: QuantityStepperProps) {
  const s = SIZES[size]
  const atMax = value >= max
  const button = `flex ${s.button} items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500 aria-disabled:cursor-not-allowed aria-disabled:text-ink-300 aria-disabled:hover:bg-transparent`

  return (
    <div className={`inline-flex ${s.wrap} items-center rounded-full border border-ink-200 bg-card`}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label={`Decrease quantity of ${label}`} className={button}>
        <Minus className={s.icon} strokeWidth={2.5} aria-hidden="true" />
      </button>
      <span className={`${s.value} text-center font-semibold tabular-nums text-ink-900`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        ref={incrementRef}
        // aria-disabled, not disabled: a disabled button drops keyboard focus at the limit.
        onClick={() => {
          if (!atMax) onChange(value + 1)
        }}
        aria-disabled={atMax}
        aria-label={atMax ? `Maximum of ${max} reached for ${label}` : `Increase quantity of ${label}`}
        className={button}
      >
        <Plus className={s.icon} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  )
}
