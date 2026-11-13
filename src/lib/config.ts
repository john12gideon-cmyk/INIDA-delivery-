// Public, browser-safe configuration only. Server secrets never belong here.

/** Returns undefined for empty values and the `your_..._here` placeholders in .env.local. */
function env(value: string | undefined): string | undefined {
  const v = value?.trim()
  if (!v || /^your_.*_here$/i.test(v)) return undefined
  return v
}

export const config = {
  supabaseUrl: env(import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: env(import.meta.env.VITE_SUPABASE_ANON_KEY),
  paystackPublicKey: env(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY),
  /** International format, digits only, e.g. 2348012345678. Empty hides WhatsApp buttons. */
  whatsappNumber: (env(import.meta.env.VITE_WHATSAPP_NUMBER) ?? '').replace(/\D/g, ''),
  /**
   * Paystack requires an email. When the customer leaves the optional email
   * blank we send <phone>@<this domain>. Use a domain INIDA controls.
   */
  paystackEmailDomain: env(import.meta.env.VITE_PAYSTACK_EMAIL_DOMAIN) ?? 'inida.ng',
}

export function whatsappLink(text: string): string | null {
  if (!config.whatsappNumber) return null
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`
}
