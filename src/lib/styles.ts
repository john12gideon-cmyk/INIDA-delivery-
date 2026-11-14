export const inputClass = (hasError: boolean) =>
  `block h-12 w-full rounded-xl border bg-card px-4 text-[15px] text-ink-900 placeholder:text-ink-300 transition-colors focus:outline-none focus:ring-4 ${
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-ink-200 hover:border-ink-300 focus:border-brand-500 focus:ring-brand-100'
  }`
