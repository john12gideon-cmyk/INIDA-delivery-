import { config } from '../lib/config'

const SCRIPT_SRC = 'https://js.paystack.co/v1/inline.js'

interface PaystackSuccess {
  reference: string
  status: string
  message?: string
}

interface PaystackSetupOptions {
  key: string
  email: string
  amount: number // kobo
  currency: 'NGN'
  ref: string
  metadata?: Record<string, unknown>
  callback: (response: PaystackSuccess) => void
  onClose: () => void
}

declare global {
  interface Window {
    PaystackPop?: { setup(options: PaystackSetupOptions): { openIframe(): void } }
  }
}

let loader: Promise<void> | null = null

/** Loads Paystack Inline once. Safe to call repeatedly (e.g. to preload). */
export function loadPaystack(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve()
  if (loader) return loader
  loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loader = null
      script.remove()
      reject(new Error('Could not load Paystack. Check your connection and try again.'))
    }
    document.head.appendChild(script)
  })
  return loader
}

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I confusion

/** Unique Paystack reference like INIDA-7KQ2MX9VHT (10 random chars, ~50 bits). */
export function createPaymentReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10))
  let out = ''
  for (const b of bytes) out += REF_ALPHABET[b % REF_ALPHABET.length]
  return `INIDA-${out}`
}

/** Customer's email if given, otherwise a stable phone-based address. */
export function paystackEmail(phone: string, email?: string): string {
  const e = email?.trim()
  return e ? e : `${phone.replace(/\D/g, '')}@${config.paystackEmailDomain}`
}

interface PayOptions {
  reference: string
  amountNaira: number
  email: string
  metadata?: Record<string, unknown>
  onSuccess: (reference: string) => void
  onCancel: () => void
}

export async function payWithPaystack(opts: PayOptions): Promise<void> {
  if (!config.paystackPublicKey) throw new Error('Payments are not configured yet (missing VITE_PAYSTACK_PUBLIC_KEY).')
  await loadPaystack()
  if (!window.PaystackPop) throw new Error('Paystack failed to initialise. Please refresh and try again.')

  const handler = window.PaystackPop.setup({
    key: config.paystackPublicKey,
    email: opts.email,
    amount: opts.amountNaira * 100,
    currency: 'NGN',
    ref: opts.reference,
    metadata: opts.metadata,
    callback: (res) => opts.onSuccess(res.reference),
    onClose: opts.onCancel,
  })
  handler.openIframe()
}
