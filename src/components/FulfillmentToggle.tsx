import { Store, Truck } from 'lucide-react'
import type { FulfillmentMethod } from '../types'

interface FulfillmentToggleProps {
  value: FulfillmentMethod
  onChange: (value: FulfillmentMethod) => void
}

const OPTIONS = [
  { id: 'delivery' as const, label: 'Doorstep Delivery', icon: Truck },
  { id: 'pickup' as const, label: 'Pickup', icon: Store },
]

export function FulfillmentToggle({ value, onChange }: FulfillmentToggleProps) {
  return (
    <div role="radiogroup" aria-label="Fulfillment method" className="relative grid grid-cols-2 rounded-2xl bg-ink-100 p-1">
      <span
        aria-hidden
        className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-xl bg-card shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          value === 'pickup' ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{ left: 4 }}
      />
      {OPTIONS.map(({ id, label, icon: Icon }) => {
        const active = id === value
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={`relative z-10 flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 ${
              active ? 'text-ink-900' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            <Icon className={`h-4 w-4 ${active ? 'text-brand-500' : ''}`} strokeWidth={2.25} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
