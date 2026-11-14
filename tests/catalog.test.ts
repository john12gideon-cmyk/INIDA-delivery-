import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CATALOG, CATEGORIES } from '../supabase/functions/_shared/catalog.ts'
import { ValidationError, priceOrder } from '../supabase/functions/_shared/order.ts'

const SPEC_PRICES: Record<string, number> = {
  'crayfish-whole-250': 3500,
  'crayfish-whole-500': 6500,
  'crayfish-ground-200': 3200,
  'catfish-cuts-300': 4800,
  'catfish-jumbo-600': 9000,
  'fish-flakes-250': 4200,
  'palmoil-1l': 3000,
  'palmoil-2l': 5800,
  'palmoil-5l': 14000,
}

test('nine SKUs with spec prices', () => {
  const actual = Object.fromEntries(CATALOG.map((p) => [p.id, p.sizes[0].price]))
  assert.deepEqual(actual, SPEC_PRICES)
})

test('every SKU has exactly one size, a known category and an image under /images/ when set', () => {
  const categoryIds = CATEGORIES.map((c) => c.id)
  assert.deepEqual(categoryIds, ['crayfish', 'dryfish', 'palmoil'])
  for (const p of CATALOG) {
    assert.equal(p.sizes.length, 1, p.id)
    assert.ok(categoryIds.includes(p.category), p.id)
    if (p.image !== undefined) assert.match(p.image, /^\/images\/[a-z-]+\.jpg$/, p.id)
    assert.ok(p.badge.length > 0, p.id)
  }
})

const pickupRequest = (items: unknown[]) => ({
  reference: 'test_ref_12345',
  fulfillment: 'pickup',
  customer: { fullName: 'Ada Obi', phone: '08031234567', zoneId: '', address: '', landmark: '' },
  items,
})

test('priceOrder accepts every SKU', () => {
  const items = CATALOG.map((p) => ({ productId: p.id, sizeId: p.sizes[0].id, quantity: 1 }))
  const order = priceOrder(pickupRequest(items))
  assert.equal(order.subtotal, 54000)
  assert.equal(order.items.length, 9)
})

test('priceOrder rejects retired ids', () => {
  assert.throws(
    () => priceOrder(pickupRequest([{ productId: 'crayfish', sizeId: '250g', variantId: 'whole', quantity: 1 }])),
    ValidationError,
  )
})
