// create-order: the ONLY way an order enters the database.
//
// 1. Validate the request and recompute prices from the shared catalog.
// 2. Verify the Paystack transaction server-side (secret key) and check the
//    amount paid matches the recomputed total exactly.
// 3. Insert the order with the service role (bypasses RLS).
// 4. Fire the Telegram alert in the background (never blocks the customer).
//
// Idempotent on the Paystack reference: retries return the existing order.
//
// Secrets (set with `supabase secrets set ...`):
//   PAYSTACK_SECRET_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, ALLOWED_ORIGIN (optional)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by Supabase.

import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  ValidationError,
  formatTelegramMessage,
  generateOrderCode,
  priceOrder,
  type PricedOrder,
} from '../_shared/order.ts'

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void } | undefined

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

interface OrderRow {
  order_code: string
  payment_reference: string
  status: string
  fulfillment: 'delivery' | 'pickup'
  customer_name: string
  customer_phone: string
  delivery_zone_id: string | null
  delivery_zone_label: string | null
  delivery_address: string | null
  delivery_landmark: string | null
  items: PricedOrder['items']
  subtotal: number
  delivery_fee: number
  total: number
  amount_paid_kobo: number
  paid_at: string | null
  created_at: string
}

/** Public shape returned to the browser (matches ConfirmedOrder in src/types). */
function toConfirmed(row: OrderRow) {
  return {
    orderCode: row.order_code,
    reference: row.payment_reference,
    createdAt: row.created_at,
    fulfillment: row.fulfillment,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    zoneLabel: row.delivery_zone_label,
    address: row.delivery_address,
    landmark: row.delivery_landmark,
    items: row.items,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
  }
}

interface PaystackVerifyResponse {
  status: boolean
  message: string
  data?: { status: string; amount: number; currency: string; reference: string; paid_at: string | null }
}

async function verifyPaystack(reference: string) {
  const secret = Deno.env.get('PAYSTACK_SECRET_KEY')
  if (!secret) throw new Error('PAYSTACK_SECRET_KEY is not set')
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  })
  const body = (await res.json()) as PaystackVerifyResponse
  return { httpOk: res.ok, body }
}

async function sendTelegram(order: PricedOrder, orderCode: string): Promise<void> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')
  if (!token || !chatId) {
    console.warn('Telegram not configured; skipping alert for', orderCode)
    return
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatTelegramMessage(order, orderCode),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) console.error('Telegram alert failed', res.status, await res.text())
  } catch (err) {
    console.error('Telegram alert error', err)
  }
}

const SELECT_COLUMNS =
  'order_code, payment_reference, status, fulfillment, customer_name, customer_phone, delivery_zone_id, delivery_zone_label, delivery_address, delivery_landmark, items, subtotal, delivery_fee, total, amount_paid_kobo, paid_at, created_at'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed.' })

  // 1. Validate + price.
  let order: PricedOrder
  try {
    order = priceOrder(await req.json())
  } catch (err) {
    if (err instanceof ValidationError || err instanceof SyntaxError) {
      return json(400, { error: err.message, code: 'invalid_request' })
    }
    throw err
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })

  const findExisting = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(SELECT_COLUMNS)
      .eq('payment_reference', order.reference)
      .maybeSingle<OrderRow>()
    if (error) throw error
    return data
  }

  try {
    // Idempotency: this reference was already turned into an order.
    const existing = await findExisting()
    if (existing) return json(200, { order: toConfirmed(existing) })

    // 2. Verify payment with Paystack.
    const { httpOk, body } = await verifyPaystack(order.reference)
    const tx = body.data
    if (!httpOk || !body.status || !tx || tx.status !== 'success') {
      return json(402, {
        error: 'We could not confirm this payment. If you were charged, contact INIDA with your reference.',
        code: 'payment_not_successful',
      })
    }
    const expectedKobo = order.total * 100
    if (tx.currency !== 'NGN' || tx.amount !== expectedKobo) {
      console.error('Amount mismatch', { reference: order.reference, paid: tx.amount, expectedKobo, currency: tx.currency })
      return json(409, {
        error: 'The amount paid does not match your order total. INIDA will contact you to resolve this.',
        code: 'amount_mismatch',
      })
    }

    // 3. Insert. Retry on order_code collisions; widen the code if 4 digits keep colliding.
    const baseRow = {
      payment_reference: order.reference,
      status: 'pending',
      fulfillment: order.fulfillment,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      delivery_zone_id: order.zone?.id ?? null,
      delivery_zone_label: order.zone?.label ?? null,
      delivery_address: order.address,
      delivery_landmark: order.landmark,
      items: order.items,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      total: order.total,
      amount_paid_kobo: tx.amount,
      paid_at: tx.paid_at,
    }

    for (let attempt = 0; attempt < 8; attempt++) {
      const orderCode = generateOrderCode(attempt < 5 ? 4 : 6)
      const { data, error } = await supabase
        .from('orders')
        .insert({ ...baseRow, order_code: orderCode })
        .select(SELECT_COLUMNS)
        .single<OrderRow>()

      if (!error && data) {
        // 4. Background Telegram alert; response is not delayed by it.
        const alert = sendTelegram(order, data.order_code)
        if (typeof EdgeRuntime !== 'undefined') EdgeRuntime.waitUntil(alert)
        else await alert
        return json(201, { order: toConfirmed(data) })
      }

      if (error?.code === '23505') {
        // Unique violation: either the code collided, or a concurrent request
        // already stored this payment reference.
        const raced = await findExisting()
        if (raced) return json(200, { order: toConfirmed(raced) })
        continue
      }
      throw error
    }
    throw new Error('Could not allocate a unique order code')
  } catch (err) {
    console.error('create-order failed', { reference: order.reference, err })
    return json(500, {
      error: 'Something went wrong saving your order. Your payment is safe; please try again.',
      code: 'server_error',
    })
  }
})
