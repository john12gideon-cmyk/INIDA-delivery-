interface PillOption {
  id: string
  label: string
}

interface PillGroupProps {
  label: string
  options: PillOption[]
  value: string
  onChange: (id: string) => void
}

export function PillGroup({ label, options, value, onChange }: PillGroupProps) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">{label}</p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.id === value
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.id)}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
                active
                  ? 'border-ink-900 bg-ink-900 text-cream shadow-sm'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-ink-400 hover:text-ink-900'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
