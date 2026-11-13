import type { ReactNode } from 'react'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      {children}
      {/* Reserve the line so errors appearing never shift the layout. */}
      <p
        id={`${id}-msg`}
        className={`mt-1.5 min-h-[1.125rem] text-xs ${error ? 'text-red-600' : 'text-ink-400'}`}
        role={error ? 'alert' : undefined}
      >
        {error ?? hint ?? ''}
      </p>
    </div>
  )
}
