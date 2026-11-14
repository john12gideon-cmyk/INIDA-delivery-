# Storefront UI + catalog upgrade — design

Approved by owner 2026-11-13.

## Intent
Make the INIDA storefront feel like a mature, human-crafted boutique pantry and
replace the variant/size matrix with nine fixed SKUs in three sections. Payment,
order persistence and Telegram logic must keep working unchanged.

## Goals
- Nine SKUs (prices in Naira):
  - Crayfish: Whole Oron Crayfish 250g Pouch 3,500; Whole Oron Crayfish 500g
    Family Pack 6,500; Stone-Free Ground Crayfish 200g Jar/Pouch 3,200
  - Dry Fish: Hardwood-Smoked Catfish (Whole Cuts) 300g Pack 4,800;
    Hardwood-Smoked Catfish (Jumbo) 600g Pack 9,000; Deboned Dry Fish Flakes
    250g Pack 4,200
  - Red Palm Oil: Pure Unadulterated Red Palm Oil 1 Litre Bottle 3,000;
    2 Litre Keg 5,800; 5 Litre Kitchen Keg 14,000
- Real, unbranded product photography with a size badge per card.
- Warm pantry palette, tighter editorial hero, structured cards with Add/stepper.
- Frosted glass only on header, cart drawer, checkout order summary.

## Non-goals / anti-goals
- No change to `order.ts` pricing logic, `create-order`, DB schema, Paystack flow.
- No competitor logos in imagery. No emojis. No walls of text in cards.
- Failure even if it works: stale carts that the server rejects at payment time.

## Approaches (photos)
1. Download vetted free photos into `public/images/` (picked). Stable, verified
   by viewing each file. Not the owner's real products.
2. Hotlink Unsplash/Pexels. Fastest; links can break, no crop control.
3. Owner's own photos. Most honest; blocks on owner.

## Decisions
- Catalog: each SKU is a `CatalogProduct` with a single-entry `sizes` array and
  no `variants`, plus `category`, `image`, `badge`. Server logic untouched;
  `create-order` must be redeployed.
- Cart load drops items not in the catalog and reprices from the catalog.
- 5 photos (whole crayfish, ground crayfish, smoked catfish, fish flakes, palm
  oil); sizes share a photo, badge distinguishes. Credits in
  `public/images/CREDITS.md`.
- Palette: parchment `#F6EFE2`, card `#FFFBF4`, roasted charcoal `#2A211B`,
  smoke `#7C6E61`, palm terracotta `#B4441C` (actions), amber `#E09A2C`
  (highlights), emerald `#10B981` (success).
- Type (Claude's call): Bricolage Grotesque display/prices, Figtree body.
- Hero: left-aligned text + photo (right on desktop, below on mobile), perks row
  removed, one plain line "Same-day delivery within Uyo."
- Sections: heading + one-line intro + 3-column grid. Card: photo with solid
  charcoal size chip, name, pack pill, price, `Add` that becomes `- n +`.
- `PackagingMockup` removed; cart drawer uses photo thumbnails.

## Left to the builder
Exact copy, spacing values, photo crops.
