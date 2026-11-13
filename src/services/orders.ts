import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js'
import type { CheckoutPayload, ConfirmedOrder } from '../types'
import { getSupabase } from './supabase'

/** Body sent to the create-order Edge Function. Prices are NOT sent; the server computes them. */
export interface CreateOrderRequest {
  reference: string
  fulfillment: CheckoutPayload['fulfillment']
  customer: CheckoutPayload['customer']
  items: { productId: string; variantId?: string; sizeId: string; quantity: number }[]
}

export type OrderErrorCode =
  | 'invalid_request'
  | 'payment_not_successful'
  | 'amount_mismatch'
  | 'server_error'
  | 'network'
  | 'not_configured'

export class OrderError extends Error {
  readonly code: OrderErrorCode
  constructor(message: string, code: OrderErrorCode) {
    super(message)
    this.code = code
  }
  /** Worth retrying automatically / offering a Retry button. */
  get retryable(): boolean {
    return this.code === 'network' || this.code === 'server_error' || this.code === 'payment_not_successful'
  }
}

export function buildOrderRequest(reference: string, payload: CheckoutPayload): CreateOrderRequest {
  return {
    reference,
    fulfillment: payload.fulfillment,
    customer: payload.customer,
    items: payload.items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      sizeId: i.sizeId,
      quantity: i.quantity,
    })),
  }
}

async function invokeOnce(body: CreateOrderRequest): Promise<ConfirmedOrder> {
  let supabase
  try {
    supabase = getSupabase()
  } catch (err) {
    throw new OrderError((err as Error).message, 'not_configured')
  }

  const { data, error } = await supabase.functions.invoke<{ order: ConfirmedOrder }>('create-order', { body })

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const res = error.context as Response
      let parsed: { error?: string; code?: OrderErrorCode } = {}
      try {
        parsed = (await res.json()) as typeof parsed
      } catch {
        // Non-JSON error body.
      }
      throw new OrderError(
        parsed.error ?? 'Something went wrong confirming your order.',
        parsed.code ?? (res.status >= 500 ? 'server_error' : 'invalid_request'),
      )
    }
    if (error instanceof FunctionsFetchError || error instanceof FunctionsRelayError) {
      throw new OrderError('Connection problem while confirming your order. Your payment is safe; tap Try again.', 'network')
    }
    throw new OrderError('Something went wrong confirming your order.', 'server_error')
  }
  if (!data?.order) throw new OrderError('Unexpected response from the server.', 'server_error')
  return data.order
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Calls create-order with automatic retries. Safe: the server is idempotent per reference. */
export async function confirmOrder(body: CreateOrderRequest, attempts = 3): Promise<ConfirmedOrder> {
  let lastError: OrderError | null = null
  for (let i = 0; i < attempts; i++) {
    try {
      return await invokeOnce(body)
    } catch (err) {
      lastError = err instanceof OrderError ? err : new OrderError('Unexpected error.', 'server_error')
      if (!lastError.retryable) break
      if (i < attempts - 1) await sleep(1200 * (i + 1))
    }
  }
  throw lastError ?? new OrderError('Unexpected error.', 'server_error')
}

// A paid-but-unconfirmed order is kept locally so a refresh or dropped
// connection never loses it. Saved only AFTER Paystack reports success.
const PENDING_KEY = 'inida.pending-order.v1'

export function savePendingOrder(body: CreateOrderRequest): void {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(body))
  } catch {
    // Ignore storage failures.
  }
}

export function loadPendingOrder(): CreateOrderRequest | null {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as CreateOrderRequest) : null
  } catch {
    return null
  }
}

export function clearPendingOrder(): void {
  try {
    window.localStorage.removeItem(PENDING_KEY)
  } catch {
    // Ignore storage failures.
  }
}
