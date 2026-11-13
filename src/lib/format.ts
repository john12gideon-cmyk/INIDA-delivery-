const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

/** Formats an integer Naira amount, e.g. 4800 -> "₦4,800". */
export function formatNaira(amount: number): string {
  return nairaFormatter.format(amount).replace('NGN', '₦').replace(/\s/g, '')
}
