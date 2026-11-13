# INIDA — Project Guidelines

INIDA is a premium order-and-delivery web app for branded Nigerian food products
(Crayfish, Dry Fish, Red Palm Oil). It must feel fast, polished, and glitch-free.

## Tech Stack
- React 19 + Vite + TypeScript (strict)
- Tailwind CSS v4 (via `@tailwindcss/vite`, theme tokens in `src/index.css`)
- Icons: `lucide-react` only. **No emojis anywhere in the UI.**
- Routing: `react-router-dom` (`/` storefront, `/admin` admin panel)
- Backend: Supabase (`@supabase/supabase-js`) — `orders` table + Realtime
- Payments: Paystack Inline JS (loaded from `https://js.paystack.co/v1/inline.js`)
- Notifications: Telegram Bot API (silent background `fetch`)

## Folder Structure
```
src/
  components/   Storefront UI (ProductCard, CartDrawer, Checkout, SuccessScreen, ...)
  admin/        PIN-protected admin panel (/admin)
  services/     Side-effect modules: supabase.ts, paystack.ts, telegram.ts
  types/        Shared TypeScript types (Product, Variant, CartItem, Order, ...)
  data/         Static catalog data (products, delivery zones, pickup info)
  hooks/        Custom hooks (useCart, ...)
  lib/          Pure helpers (formatNaira, order id generation, ...)
```

## Design System
- Accent: burnt/sunset orange (`brand-*` tokens, primary `#E8590C`)
- Neutrals: deep charcoal/slate (`ink-*` tokens), background off-white `#FAF9F6`
- Success: emerald `#10B981`
- Mobile-first, generous whitespace, rounded-2xl cards, subtle shadows
- Every interactive state (hover, focus, disabled, loading) must be defined.
  No layout shift, no flash of empty content.

## Coding Standards
- Strict TypeScript. No `any`. Shared types live in `src/types`.
- Small, modular components; one component per file.
- Prices are integers in Naira (kobo only when talking to Paystack: `naira * 100`).
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
3. Checkout (delivery/pickup toggle, forms) + Paystack
4. Supabase order persistence
5. Telegram background alert
6. Success screen + receipt actions
7. Admin panel (`/admin`, PIN, live orders, status toggle)

Do not rush or dump all code at once.
