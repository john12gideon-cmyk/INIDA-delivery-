import { AlertCircle, Loader2, MessageCircle, RotateCw, X } from 'lucide-react'
import { whatsappLink } from '../lib/config'

interface PaymentStatusOverlayProps {
  state: { kind: 'confirming' } | { kind: 'error'; message: string; reference?: string; canRetry: boolean }
  onRetry: () => void
  onDismiss: () => void
}

/** Full-screen state between Paystack success and the order being saved. */
export function PaymentStatusOverlay({ state, onRetry, onDismiss }: PaymentStatusOverlayProps) {
  const help =
    state.kind === 'error' && state.reference
      ? whatsappLink(`Hello INIDA, I paid but my order did not confirm. Payment ref: ${state.reference}`)
      : null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cream/95 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-live="polite">
      {state.kind === 'confirming' ? (
        <div className="flex flex-col items-center text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-500" strokeWidth={2} />
          <p className="mt-5 font-display text-2xl font-semibold text-ink-900">Confirming your payment</p>
          <p className="mt-1.5 text-sm text-ink-500">This takes a few seconds. Please keep this page open.</p>
        </div>
      ) : (
        <div className="w-full max-w-sm rounded-3xl border border-ink-100 bg-white p-6 text-center shadow-xl">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-7 w-7" />
          </span>
          <p className="mt-4 font-display text-xl font-semibold text-ink-900">We hit a snag</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{state.message}</p>
          {state.reference && (
            <p className="mt-3 rounded-xl bg-ink-50 px-3 py-2 font-mono text-xs text-ink-600">Ref: {state.reference}</p>
          )}
          <div className="mt-6 grid gap-2.5">
            {state.canRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-500 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                <RotateCw className="h-4 w-4" />
                Try again
              </button>
            )}
            {help && (
              <a
                href={help}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ink-200 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-400"
              >
                <MessageCircle className="h-4 w-4" />
                Message INIDA on WhatsApp
              </a>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
