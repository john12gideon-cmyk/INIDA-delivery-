// Single source of truth for products, prices and delivery fees.
// Imported by BOTH the frontend (display) and the create-order Edge Function
// (authoritative pricing). Keep this file dependency-free so it runs in
// Vite, Node and Deno unchanged.

export type CategoryId = 'crayfish' | 'dryfish' | 'palmoil'

export type ProductId =
  | 'crayfish-whole-250'
  | 'crayfish-whole-500'
  | 'crayfish-ground-200'
  | 'catfish-cuts-300'
  | 'catfish-jumbo-600'
  | 'fish-flakes-250'
  | 'palmoil-1l'
  | 'palmoil-2l'
  | 'palmoil-5l'

export interface CatalogCategory {
  id: CategoryId
  name: string
  intro: string
}

export interface CatalogOption {
  id: string
  label: string
}

export interface CatalogSize extends CatalogOption {
  price: number // Naira
}

/** One sellable SKU. Exactly one size, no variants. */
export interface CatalogProduct {
  id: ProductId
  category: CategoryId
  name: string
  /** Photo under /images/. Omitted until a real product photo exists. */
  image?: string
  /** Short size shown on the card photo, e.g. "250g" or "5L". */
  badge: string
  sizes: [CatalogSize]
  /** Unused by current SKUs; kept so order.ts validation stays unchanged. */
  variants?: CatalogOption[]
}

export interface CatalogZone {
  id: string
  label: string
  fee: number // Naira
}

export const CATEGORIES: CatalogCategory[] = [
  { id: 'crayfish', name: 'Crayfish', intro: 'Sun-dried Oron crayfish, sorted by hand and free of grit.' },
  { id: 'dryfish', name: 'Dry Fish', intro: 'Catfish slow-smoked over hardwood until firm and aromatic.' },
  { id: 'palmoil', name: 'Red Palm Oil', intro: 'Freshly pressed in Akwa Ibom. No dye, no blending.' },
]

export const CATALOG: CatalogProduct[] = [
  {
    id: 'crayfish-whole-250',
    category: 'crayfish',
    name: 'Whole Oron Crayfish',
    image: '/images/crayfish-whole.jpg',
    badge: '250g',
    sizes: [{ id: '250g', label: '250g Pouch', price: 3500 }],
  },
  {
    id: 'crayfish-whole-500',
    category: 'crayfish',
    name: 'Whole Oron Crayfish',
    image: '/images/crayfish-whole.jpg',
    badge: '500g',
    sizes: [{ id: '500g', label: '500g Family Pack', price: 6500 }],
  },
  {
    id: 'crayfish-ground-200',
    category: 'crayfish',
    name: 'Stone-Free Ground Crayfish',
    badge: '200g',
    sizes: [{ id: '200g', label: '200g Jar/Pouch', price: 3200 }],
  },
  {
    id: 'catfish-cuts-300',
    category: 'dryfish',
    name: 'Hardwood-Smoked Catfish (Whole Cuts)',
    image: '/images/catfish-smoked.jpg',
    badge: '300g',
    sizes: [{ id: '300g', label: '300g Pack', price: 4800 }],
  },
  {
    id: 'catfish-jumbo-600',
    category: 'dryfish',
    name: 'Hardwood-Smoked Catfish (Jumbo)',
    image: '/images/catfish-smoked.jpg',
    badge: '600g',
    sizes: [{ id: '600g', label: '600g Pack', price: 9000 }],
  },
  {
    id: 'fish-flakes-250',
    category: 'dryfish',
    name: 'Deboned Dry Fish Flakes',
    badge: '250g',
    sizes: [{ id: '250g', label: '250g Pack', price: 4200 }],
  },
  {
    id: 'palmoil-1l',
    category: 'palmoil',
    name: 'Pure Unadulterated Red Palm Oil',
    image: '/images/palm-oil.jpg',
    badge: '1L',
    sizes: [{ id: '1l', label: '1 Litre Bottle', price: 3000 }],
  },
  {
    id: 'palmoil-2l',
    category: 'palmoil',
    name: 'Pure Unadulterated Red Palm Oil',
    image: '/images/palm-oil.jpg',
    badge: '2L',
    sizes: [{ id: '2l', label: '2 Litre Keg', price: 5800 }],
  },
  {
    id: 'palmoil-5l',
    category: 'palmoil',
    name: 'Pure Unadulterated Red Palm Oil',
    image: '/images/palm-oil.jpg',
    badge: '5L',
    sizes: [{ id: '5l', label: '5 Litre Kitchen Keg', price: 14000 }],
  },
]

// Flat delivery fees per zone. Edit to match INIDA's real rates.
export const DELIVERY_ZONES: CatalogZone[] = [
  { id: 'uyo', label: 'Within Uyo', fee: 1500 },
  { id: 'uyo-outskirts', label: 'Uyo Outskirts (Ewet, Use Offot, Nwaniba)', fee: 2000 },
  { id: 'ikot-ekpene', label: 'Ikot Ekpene', fee: 3000 },
  { id: 'eket', label: 'Eket', fee: 3500 },
  { id: 'oron', label: 'Oron', fee: 4000 },
]

export const MAX_QUANTITY_PER_LINE = 50
