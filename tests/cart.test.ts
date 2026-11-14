import assert from 'node:assert/strict'
import { test } from 'node:test'
import { reconcileCart } from '../src/lib/cart.ts'

const line = (over: Record<string, unknown> = {}) => ({
  key: 'palmoil-1l:1l',
  productId: 'palmoil-1l',
  name: 'Pure Unadulterated Red Palm Oil',
  sizeId: '1l',
  sizeLabel: '1 Litre Bottle',
  unitPrice: 3000,
  quantity: 2,
  ...over,
})

test('drops unknown products', () => {
  assert.deepEqual(reconcileCart([line({ productId: 'palmoil', sizeId: '1l' })]), [])
})

test('drops unknown sizes', () => {
  assert.deepEqual(reconcileCart([line({ productId: 'crayfish-whole-250', sizeId: '1kg' })]), [])
})

test('reprices from catalog', () => {
  const [item] = reconcileCart([line({ unitPrice: 2200, name: 'Old', sizeLabel: 'Old label', key: 'x' })])
  assert.equal(item.unitPrice, 3000)
  assert.equal(item.name, 'Pure Unadulterated Red Palm Oil')
  assert.equal(item.sizeLabel, '1 Litre Bottle')
  assert.equal(item.key, 'palmoil-1l:1l')
  assert.equal(item.quantity, 2)
})

test('clamps quantity', () => {
  assert.equal(reconcileCart([line({ quantity: 80 })])[0].quantity, 50)
  assert.deepEqual(reconcileCart([line({ quantity: 0 })]), [])
  assert.deepEqual(reconcileCart([line({ quantity: 1.5 })]), [])
})

test('drops retired variant lines', () => {
  assert.deepEqual(reconcileCart([line({ variantId: 'whole' })]), [])
})

test('non-array input returns []', () => {
  assert.deepEqual(reconcileCart(null), [])
  assert.deepEqual(reconcileCart('x'), [])
})
