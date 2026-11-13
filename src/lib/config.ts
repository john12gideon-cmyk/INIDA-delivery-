// Public, browser-safe configuration only. Server secrets never belong here.

export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  paystackPublicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined,
  /** International format, digits only, e.g. 2348012345678. Empty hides WhatsApp buttons. */
  whatsappNumber: ((import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '').replace(/\D/g, ''),
  /**
   * Paystack requires an email, but INIDA checkout only asks for a phone number.
   * We send <phone>@<this domain>. Use a domain INIDA controls.
   */
  paystackEmailDomain: (import.meta.env.VITE_PAYSTACK_EMAIL_DOMAIN as string | undefined) || 'inida.ng',
}

export function whatsappLink(text: string): string | null {
  if (!config.whatsappNumber) return null
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`
}
