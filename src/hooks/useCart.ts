import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CartItem } from '../types'

const STORAGE_KEY = 'inida.cart.v1'

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.key === 'string' &&
    typeof v.productId === 'string' &&
    typeof v.name === 'string' &&
    typeof v.sizeLabel === 'string' &&
    typeof v.unitPrice === 'number' &&
    typeof v.quantity === 'number' &&
    v.quantity > 0
  )
}

function loadCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : []
  } catch {
    return []
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage full or blocked (private mode). Cart still works in memory.
    }
  }, [items])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.key === item.key)
      if (existing) {
        return prev.map((i) => (i.key === item.key ? { ...i, quantity: i.quantity + quantity } : i))
      }
      return [...prev, { ...item, quantity }]
    })
  }, [])

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, quantity } : i)),
    )
  }, [])

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const { count, subtotal } = useMemo(
    () =>
      items.reduce(
        (acc, i) => ({ count: acc.count + i.quantity, subtotal: acc.subtotal + i.unitPrice * i.quantity }),
        { count: 0, subtotal: 0 },
      ),
    [items],
  )

  return { items, count, subtotal, addItem, setQuantity, removeItem, clear }
}

export type CartApi = ReturnType<typeof useCart>
