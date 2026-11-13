import type { Product } from '../types'

export const PRODUCTS: Product[] = [
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
