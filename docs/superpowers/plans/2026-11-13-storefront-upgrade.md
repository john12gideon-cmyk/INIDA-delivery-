# Storefront UI + Catalog Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nine fixed SKUs in three sections with real photos, a warm pantry palette, editorial hero and Add/stepper cards, without touching payment or order logic.

**Architecture:** Each SKU is a `CatalogProduct` with one entry in `sizes` and no `variants`, so `priceOrder` in `supabase/functions/_shared/order.ts` validates it unchanged. A pure `reconcileCart` helper reprices/drops stale localStorage cart lines against `CATALOG`. UI changes are confined to tokens, `Hero`, `ProductCard`, a new `CategorySection`, `CartDrawer`, `Checkout` summary.

**Tech Stack:** React 19, Vite, TypeScript strict, Tailwind v4, lucide-react, Node 26 built-in test runner (native TS type stripping).

**Spec:** `docs/superpowers/specs/2026-11-13-storefront-upgrade-design.md`

## Global Constraints

- Prices change only in `supabase/functions/_shared/catalog.ts`; integers in Naira.
- `_shared/*.ts` stays dependency-free and uses `.ts` on relative imports.
- Do not modify `supabase/functions/_shared/order.ts`, `supabase/functions/create-order/`, `src/services/*`, migrations.
- Icons: lucide-react only. No emojis.
- Palette: parchment `#F6EFE2`, card `#FFFBF4`, charcoal `#2A211B`, smoke `#7C6E61`, terracotta `#B4441C`, amber `#E09A2C`, success `#10B981`.
- Fonts: Bricolage Grotesque (display, prices), Figtree (body), via Google Fonts.
- `backdrop-blur-md` only on header, cart drawer panel, checkout order summary.
- `npm run build` and `npm test` pass at the end of every task; commit per task.

## Review Focus

1. Stale cart in localStorage (`inida.cart.v1`) holding old IDs (`crayfish`, `dryfish`, `palmoil`) or old prices: must be dropped/repriced on load, never sent to the server. Test in Task 2.
2. Quantity above `MAX_QUANTITY_PER_LINE` (50) via repeated Add or stepper `+`: must clamp at 50 and disable `+`. Test in Task 2; UI in Task 5.
3. Stepper `-` from 1: line removed, card returns to `Add`. Covered in Task 5 manual check.
4. Photo fails to load: card keeps its fixed aspect ratio and shows the parchment fill with the size chip; no layout shift. Task 5.
5. Long names ("Hardwood-Smoked Catfish (Whole Cuts)") at 360px width: wraps, price/button row stays aligned at card bottom. Task 5.

Known residual risk (report to owner, no task): a payment in flight during deploy with old IDs stored by `savePendingOrder` would be rejected by the new server. Pre-launch, acceptable.

---

### Task 1: Product photos

**Files:**
- Create: `public/images/crayfish-whole.jpg`, `crayfish-ground.jpg`, `catfish-smoked.jpg`, `fish-flakes.jpg`, `palm-oil.jpg`
- Create: `public/images/CREDITS.md`

**Interfaces:**
- Produces: the five paths above, served as `/images/<name>.jpg`.

- [ ] **Step 1:** Find candidates on Unsplash or Pexels (licenses need no attribution; prefer these over CC-BY-SA). Download each to the scratchpad with `curl -L`.
- [ ] **Step 2:** View each file with the Read tool. Reject: wrong subject (shrimp, lobster, olive oil, fresh fish), visible brand/logo/text, cluttered framing. Re-search until all five pass.
- [ ] **Step 3:** Copy accepted files into `public/images/` at ~1200px on the long edge, each under 300 KB (use the download URL's `w=1200&q=75` params on Unsplash/Pexels).
- [ ] **Step 4:** Write `public/images/CREDITS.md`: one line per file with photographer, source URL, license.
- [ ] **Step 5:** Commit `feat: add product photography`.

### Task 2: Catalog, cart reconciliation, tests

**Files:**
- Modify: `supabase/functions/_shared/catalog.ts`
- Modify: `src/types/index.ts`, `src/data/products.ts`, `src/hooks/useCart.ts`
- Create: `src/lib/cart.ts`
- Modify: `src/components/ProductCard.tsx`, `src/components/CartDrawer.tsx` (swap `PackagingMockup` for `<img>` only; redesign is Task 5)
- Delete: `src/components/PackagingMockup.tsx`
- Create: `tests/catalog.test.ts`, `tests/cart.test.ts`
- Modify: `package.json` (add `"test": "node --test \"tests/**/*.test.ts\""`)

**Interfaces:**
- Produces in `catalog.ts`:
  - `type CategoryId = 'crayfish' | 'dryfish' | 'palmoil'`
  - `type ProductId` = union of the nine IDs below
  - `interface CatalogCategory { id: CategoryId; name: string; intro: string }` and `export const CATEGORIES: CatalogCategory[]` (order: crayfish, dryfish, palmoil)
  - `CatalogProduct` = `{ id: ProductId; category: CategoryId; name: string; image: string; badge: string; sizes: [CatalogSize] }` (drop `tagline`, `description`, `packaging`, `variants`)
- Produces in `src/data/products.ts`: `PRODUCTS`, `CATEGORIES`, `getProduct(id: string): Product | undefined`
- Produces in `src/lib/cart.ts`: `reconcileCart(raw: unknown): CartItem[]` and `cartKey(productId: string, sizeId: string): string` (returns `` `${productId}:${sizeId}` ``). Imports `CATALOG`, `MAX_QUANTITY_PER_LINE` from `'../../supabase/functions/_shared/catalog.ts'` (extension needed for Node tests).
- `useCart` loads via `reconcileCart`; `addItem` and `setQuantity` clamp to `MAX_QUANTITY_PER_LINE`.

Catalog data (id / category / name / size id / size label / price / badge / image):

| id | cat | name | size | label | price | badge | image |
|---|---|---|---|---|---|---|---|
| crayfish-whole-250 | crayfish | Whole Oron Crayfish | 250g | 250g Pouch | 3500 | 250g | crayfish-whole |
| crayfish-whole-500 | crayfish | Whole Oron Crayfish | 500g | 500g Family Pack | 6500 | 500g | crayfish-whole |
| crayfish-ground-200 | crayfish | Stone-Free Ground Crayfish | 200g | 200g Jar/Pouch | 3200 | 200g | crayfish-ground |
| catfish-cuts-300 | dryfish | Hardwood-Smoked Catfish (Whole Cuts) | 300g | 300g Pack | 4800 | 300g | catfish-smoked |
| catfish-jumbo-600 | dryfish | Hardwood-Smoked Catfish (Jumbo) | 600g | 600g Pack | 9000 | 600g | catfish-smoked |
| fish-flakes-250 | dryfish | Deboned Dry Fish Flakes | 250g | 250g Pack | 4200 | 250g | fish-flakes |
| palmoil-1l | palmoil | Pure Unadulterated Red Palm Oil | 1l | 1 Litre Bottle | 3000 | 1L | palm-oil |
| palmoil-2l | palmoil | Pure Unadulterated Red Palm Oil | 2l | 2 Litre Keg | 5800 | 2L | palm-oil |
| palmoil-5l | palmoil | Pure Unadulterated Red Palm Oil | 5l | 5 Litre Kitchen Keg | 14000 | 5L | palm-oil |

`image` is stored as `/images/<name>.jpg`. `DELIVERY_ZONES` and `MAX_QUANTITY_PER_LINE` unchanged.

- [ ] **Step 1: Write failing tests**

`tests/catalog.test.ts` (imports `../supabase/functions/_shared/catalog.ts` and `order.ts`):
- `nine SKUs with spec prices`: map of id to `sizes[0].price` deep-equals the table.
- `every SKU has exactly one size, a known category and an image under /images/`.
- `priceOrder accepts every SKU`: build a pickup request (`reference: 'test_ref_12345'`, phone `'08031234567'`, fullName `'Ada Obi'`) with one of each SKU, quantity 1; assert `subtotal === 54000`.
- `priceOrder rejects retired ids`: item `{ productId: 'crayfish', sizeId: '250g', variantId: 'whole', quantity: 1 }` throws `ValidationError`.

`tests/cart.test.ts`:
- `drops unknown products`: `[{ ...validLine, productId: 'palmoil', sizeId: '1l' }]` returns `[]`.
- `drops unknown sizes`: `crayfish-whole-250` with `sizeId: '1kg'` returns `[]`.
- `reprices from catalog`: `palmoil-1l` line with `unitPrice: 2200, name: 'Old'` returns `unitPrice 3000`, `name 'Pure Unadulterated Red Palm Oil'`, `sizeLabel '1 Litre Bottle'`, `key 'palmoil-1l:1l'`.
- `clamps quantity`: quantity 80 returns 50; quantity 0 or non-integer returns `[]`.
- `non-array input returns []`: `reconcileCart(null)`, `reconcileCart('x')`.

- [ ] **Step 2:** Run `npm test`. Expected: FAIL (missing exports / wrong prices).
- [ ] **Step 3:** Implement catalog, `src/lib/cart.ts`, `useCart` changes, `getProduct`, `CATEGORIES` re-export. In `ProductCard` and `CartDrawer` replace `PackagingMockup` with `<img src={product.image} alt="" />` (CartDrawer looks up via `getProduct(item.productId)`), remove variant `PillGroup` usage; delete `PackagingMockup.tsx`. Delete `PillGroup.tsx` if no longer imported.
- [ ] **Step 4:** Run `npm test` then `npm run build`. Expected: all tests pass, build exits 0.
- [ ] **Step 5:** Commit `feat: switch catalog to nine fixed SKUs and reconcile stale carts`.

### Task 3: Palette and type tokens

**Files:**
- Modify: `src/index.css`, `index.html` (`theme-color` `#B4441C`), `CLAUDE.md` (Design System section)

**Interfaces:**
- Produces tokens (keep existing names so components keep compiling): `--color-cream` becomes parchment `#F6EFE2`; add `--color-card: #fffbf4`, `--color-amber: #e09a2c`. Rebuild `brand-50..900` around `brand-600 = #B4441C` (primary action; hover `brand-700`). Rebuild `ink-50..900` as warm browns with `ink-900 = #2A211B`, `ink-500 = #7C6E61`. `--font-display: 'Bricolage Grotesque'`, `--font-sans: 'Figtree'`.

- [ ] **Step 1:** Swap the Google Fonts import to Bricolage Grotesque (opsz, 500/600/700) and Figtree (400/500/600/700). Replace token values.
- [ ] **Step 2:** Replace `bg-brand-500` primary buttons and accents across `src/` with `bg-brand-600` / `hover:bg-brand-700` so the action colour is `#B4441C`. Replace card `bg-white` with `bg-card`.
- [ ] **Step 3:** Update `CLAUDE.md` Design System bullets to the spec palette and fonts.
- [ ] **Step 4:** `npm run build` exits 0. Run `npm run dev`, screenshot storefront and checkout: text on parchment and white on terracotta readable.
- [ ] **Step 5:** Commit `style: warm pantry palette and new type pairing`.

### Task 4: Editorial hero

**Files:**
- Modify: `src/components/Hero.tsx`

- [ ] **Step 1:** Rewrite as a two-column grid at `lg` (text left, `/images/palm-oil.jpg` right in a `rounded-2xl` frame with fixed `aspect-[4/5]`), single column on mobile with photo below text at `aspect-[4/3]`. Remove `PERKS`, the eyebrow pill and the blur blob. Headline copy: "Pantry staples from Akwa Ibom, cleaned and sealed." Sub: "Crayfish, smoked fish and red palm oil, packed by weight and delivered to your door." CTA: `Shop the range` to `#shop`. Under CTA one plain line: "Same-day delivery within Uyo." Padding about half of current (`pt-8 pb-10 sm:pt-12 sm:pb-14`). No single-word colour accent in the headline.
- [ ] **Step 2:** `npm run build` exits 0; screenshot at 390px and 1280px; image has `width`/`height` attributes, no layout shift.
- [ ] **Step 3:** Commit `feat: editorial hero`.

### Task 5: Category sections and product cards with stepper

**Files:**
- Create: `src/components/CategorySection.tsx`, `src/components/QuantityStepper.tsx`
- Modify: `src/components/ProductCard.tsx`, `src/App.tsx` (shop section only), `src/components/CartDrawer.tsx` (reuse `QuantityStepper` if its stepper matches)

**Interfaces:**
- Consumes: `CATEGORIES`, `PRODUCTS`, `cartKey`, `CartApi` (`items`, `addItem`, `setQuantity`), `MAX_QUANTITY_PER_LINE`.
- `CategorySection({ category: CatalogCategory; products: Product[]; cart: CartApi })`
- `ProductCard({ product: Product; quantity: number; onAdd: () => void; onSetQuantity: (q: number) => void })`
- `QuantityStepper({ value: number; max: number; onChange: (q: number) => void; label: string })` — `-` at 1 calls `onChange(0)`; `+` disabled at `max`; buttons are 40px min, `aria-label`s "Decrease/Increase quantity of {label}".

- [ ] **Step 1:** Build `ProductCard`: photo area `aspect-[4/3]` with `bg-cream` fill, `object-cover`, `loading="lazy"`, `alt` = product name + size label; solid charcoal chip bottom-left showing `badge`. Body: name (display font), pill with `sizes[0].label`, then a bottom row pinned with `mt-auto`: price (display font, `tabular-nums`) and either `+ Add` (lucide `Plus`) or `QuantityStepper`. Card: `rounded-2xl bg-card ring-1 ring-ink-100`, hover `-translate-y-0.5` plus deeper shadow, focus-visible ring on controls, disabled states defined. Fixed 44px control height so Add/stepper swap causes no shift.
- [ ] **Step 2:** `CategorySection`: `h2` category name, one-line `intro`, grid `sm:grid-cols-2 lg:grid-cols-3 gap-5`, section spacing `py-10` with a hairline top border between sections. `App.tsx` maps `CATEGORIES` to sections inside `#shop`; drop the "Flagship range" eyebrow.
- [ ] **Step 3:** `npm run build` exits 0. In `npm run dev`, check Review Focus 2 to 5: hold `+` to 50 (button disables), `-` from 1 returns to Add, block `/images/*` in devtools (layout holds), 360px width with the catfish card.
- [ ] **Step 4:** Commit `feat: category sections and product cards with quantity stepper`.

### Task 6: Frosted drawer and checkout summary

**Files:**
- Modify: `src/components/CartDrawer.tsx`, `src/components/Checkout.tsx` (summary aside only), `src/components/Header.tsx` (tint only)

- [ ] **Step 1:** Cart drawer panel `bg-card/85 backdrop-blur-md ring-1 ring-ink-100`; overlay stays solid dim. Line thumbnails 56px `rounded-xl object-cover` from `getProduct(...).image`. Checkout summary aside: `lg:sticky lg:top-24 bg-card/80 backdrop-blur-md`. Header: `bg-cream/75 backdrop-blur-md`. Do not touch submit/payment handlers or props.
- [ ] **Step 2:** `npm run build` exits 0. Run a test-mode checkout up to the Paystack popup opening (no live charge); confirm `Pay` button, cancel notice and error overlay still render.
- [ ] **Step 3:** Commit `style: frosted cart drawer and checkout summary`.

### Task 7: Final verification and handoff

- [ ] **Step 1:** `npm test`, `npm run build`, `npm run lint` all exit 0.
- [ ] **Step 2:** Push. Tell owner: redeploy `create-order` (`npx supabase functions deploy create-order`) or the server charges old prices and rejects new IDs.
