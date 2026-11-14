# INIDA — Project Guidelines

INIDA is a premium order-and-delivery web app for branded Nigerian food products
(Crayfish, Dry Fish, Red Palm Oil). It must feel fast, polished, and glitch-free.

## Tech Stack
- React 19 + Vite + TypeScript (strict)
- Tailwind CSS v4 (via `@tailwindcss/vite`, theme tokens in `src/index.css`)
- Icons: `lucide-react` only. **No emojis anywhere in the UI.**
- Routing: `react-router-dom` (`/` storefront, `/admin` admin panel)
- Backend: Supabase (`@supabase/supabase-js`) — `orders` table + Realtime
- Payments: Paystack Inline JS (loaded from `https://js.paystack.co/v1/inline.js`).
  Payment is verified server-side in the `create-order` Edge Function. The
  browser never writes orders and never sends prices.
- Notifications: Telegram Bot API, called ONLY from a Supabase Edge Function
  (`supabase/functions/`). The bot token is a server secret and must never be a
  `VITE_*` variable or appear in frontend code.

## Folder Structure
```
src/
  components/   Storefront UI (ProductCard, CartDrawer, Checkout, SuccessScreen, ...)
  admin/        PIN-protected admin panel (/admin)
  services/     Side-effect modules: paystack.ts, orders.ts (create-order calls)
  types/        Shared TypeScript types (Product, Variant, CartItem, Order, ...)
  data/         Static catalog data (products, delivery zones, pickup info)
  hooks/        Custom hooks (useCart, ...)
  lib/          Helpers + config: supabase.ts (client), config.ts, format, receipt, validation
supabase/
  functions/_shared/catalog.ts  SINGLE source of truth for prices + delivery fees
                                (imported by frontend AND Edge Function)
  functions/create-order/       Verify Paystack -> insert order -> Telegram alert
  migrations/                   SQL schema (orders table, RLS, realtime)
```

## Design System
- Boutique pantry palette, tokens in `src/index.css`:
  - Accent: palm-oil terracotta (`brand-*`, primary action `brand-500` = `#B4441C`, hover `brand-600`)
  - Highlight: amber `#E09A2C` (`amber`)
  - Neutrals: roasted charcoal (`ink-*`, text `ink-900` = `#2A211B`, muted `ink-500` = `#6F6256`)
  - Background: parchment `#F6EFE2` (`cream`); cards `#FFFBF4` (`card`)
  - Success: emerald `#10B981`
- Type: Bricolage Grotesque (`font-display`: headings, prices), Figtree (`font-sans`: body)
- Frosted glass (`backdrop-blur-md`) only on the sticky header, cart drawer and
  checkout order summary
- Mobile-first, generous whitespace, rounded-2xl cards, subtle shadows
- Every interactive state (hover, focus, disabled, loading) must be defined.
  No layout shift, no flash of empty content.

## Coding Standards
- Strict TypeScript. No `any`. Shared types live in `src/types`.
- Small, modular components; one component per file.
- Prices are integers in Naira (kobo only when talking to Paystack: `naira * 100`).
- Never trust client prices. Change prices only in `_shared/catalog.ts`, then
  redeploy `create-order`.
- `_shared/*.ts` must stay dependency-free (runs in Vite, Node and Deno) and use
  `.ts` extensions on relative imports (Deno requirement).
- Side effects (network, storage) live in `src/services` or hooks, never inline in JSX.
- Handle errors explicitly: user-facing errors get a clear message; background
  tasks (Telegram) fail silently but log to console.
- Secrets come from `import.meta.env.VITE_*`. Never commit `.env.local`.
  See `.env.example` for required keys.

## Execution Protocol
Build in this order. Finish, verify (`npm run build`), commit, and push each step
before starting the next. Confirm with the owner after each milestone.
1. Core storefront (catalog + interactive variant cards)
2. Cart (slide-out drawer, localStorage persistence)
3. Checkout (delivery/pickup toggle, forms)
4. Paystack payment
5. Supabase order persistence
6. Telegram alert via Supabase Edge Function (server-side, token never in browser)
7. Success screen + receipt actions
8. Admin panel (`/admin`, PIN, live orders, status toggle)

Do not rush or dump all code at once.
