# INIDA

Premium order-and-delivery web app for branded Nigerian food products
(Crayfish, Dry Fish, Red Palm Oil). React + Vite + TypeScript + Tailwind,
Supabase, Paystack, Telegram.

## Local development

```bash
npm install
# .env.local holds placeholders; paste your public keys into it.
# Placeholder values (your_..._here) are treated as "not configured".
npm run dev
```

## How an order is created

```
Browser                         Supabase Edge Function: create-order
-------                         ------------------------------------
Checkout form
  -> Paystack Inline popup
  -> onSuccess(reference)
  -> POST {reference, customer,  -> 1. Validate input, recompute prices from
           item ids + quantities}        supabase/functions/_shared/catalog.ts
                                    2. GET Paystack /transaction/verify (secret key)
                                       and require amount == total, currency NGN
                                    3. Insert into public.orders (service role)
                                    4. Telegram alert in the background
  <- {order}                     <-
Success screen
```

- The browser never sends prices and never writes to the database.
- `create-order` is idempotent per Paystack reference, so retries are safe.
- A paid-but-unconfirmed order is kept in `localStorage` and retried on the
  next page load.

## Supabase setup

1. Create the table (pick one):
   - Paste `supabase/migrations/20261113000000_create_orders.sql` into the
     Supabase SQL Editor and run it, **or**
   - `supabase link --project-ref <your-ref>` then `supabase db push`.
2. Set server secrets (never put these in `.env.local`):
   ```bash
   supabase secrets set PAYSTACK_SECRET_KEY=sk_test_xxx \
     TELEGRAM_BOT_TOKEN=123456:ABC... TELEGRAM_CHAT_ID=123456789
   # optional: lock CORS to your site
   supabase secrets set ALLOWED_ORIGIN=https://your-domain.com
   ```
3. Deploy the function:
   ```bash
   supabase functions deploy create-order --no-verify-jwt
   ```
   (`--no-verify-jwt` is intentional: the function trusts Paystack's
   server-side verification, not the caller.)

### Getting the Telegram chat ID
Message your bot once, then open
`https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `message.chat.id`.

## Changing prices or delivery zones
Edit `supabase/functions/_shared/catalog.ts` only. Both the storefront and the
Edge Function read from it. **Redeploy the function after any price change**,
or paid orders will be rejected with `amount_mismatch`.
