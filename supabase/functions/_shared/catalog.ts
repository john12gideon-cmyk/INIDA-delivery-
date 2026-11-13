// Single source of truth for products, prices and delivery fees.
// Imported by BOTH the frontend (display) and the create-order Edge Function
// (authoritative pricing). Keep this file dependency-free so it runs in
// Vite, Node and Deno unchanged.

export type ProductId = 'crayfish' | 'dryfish' | 'palmoil'

export interface CatalogOption {
  id: string
  label: string
}

export interface CatalogSize extends CatalogOption {
  price: number // Naira
}

export interface CatalogProduct {
  id: ProductId
  name: string
  tagline: string
  description: string
  packaging: 'pouch' | 'bottle'
  variants?: CatalogOption[]
  sizes: CatalogSize[]
}

export interface CatalogZone {
  id: string
  label: string
  fee: number // Naira
}

export const CATALOG: CatalogProduct[] = [
  {
    id: 'crayfish',
    name: 'Branded Crayfish',
    tagline: 'Sun-dried, sorted, stone-free',
    description:
      'Hand-picked from Atlantic coastal catches, cleaned and sealed for deep, smoky flavour in every pot.',
    packaging: 'pouch',
    variants: [
      { id: 'whole', label: 'Whole' },
      { id: 'blended', label: 'Blended (Ground)' },
    ],
    sizes: [
      { id: '250g', label: '250g Pouch', price: 2500 },
      { id: '500g', label: '500g Pouch', price: 4800 },
      { id: '1kg', label: '1kg Family Pack', price: 9200 },
    ],
  },
  {
    id: 'dryfish',
    name: 'Branded Dry Fish',
    tagline: 'Slow-smoked over hardwood',
    description:
      'Firm, aromatic and properly dried. Ready for soups, stews and native pots without the market hassle.',
    packaging: 'pouch',
    variants: [
      { id: 'catfish', label: 'Smoked Catfish' },
      { id: 'stockfish', label: 'Deboned Stockfish Cuts' },
    ],
    sizes: [
      { id: 'small', label: 'Small Pack', price: 3500 },
      { id: 'medium', label: 'Medium Pack', price: 6500 },
      { id: 'jumbo', label: 'Jumbo Pack', price: 12000 },
    ],
  },
  {
    id: 'palmoil',
    name: 'Branded Red Palm Oil',
    tagline: 'Pure, unadulterated, rich red',
    description:
      'Freshly pressed from Akwa Ibom palm fruits. No dyes, no blends, sealed for hygiene and shelf life.',
    packaging: 'bottle',
    sizes: [
      { id: '1l', label: '1 Litre Bottle', price: 2200 },
      { id: '2l', label: '2 Litres Gallon', price: 4200 },
      { id: '5l', label: '5 Litres Keg', price: 10000 },
    ],
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
