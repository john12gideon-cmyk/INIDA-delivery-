import { useCallback, useEffect, useMemo, useState } from 'react'
import { MAX_QUANTITY_PER_LINE } from '../../supabase/functions/_shared/catalog'
import { reconcileCart } from '../lib/cart'
import type { CartItem } from '../types'

const STORAGE_KEY = 'inida.cart.v1'

function loadCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return reconcileCart(JSON.parse(raw))
  } catch {
    return []
  }
}

const clampQuantity = (q: number) => Math.min(q, MAX_QUANTITY_PER_LINE)

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
        return prev.map((i) =>
          i.key === item.key ? { ...i, quantity: clampQuantity(i.quantity + quantity) } : i,
        )
      }
      return [...prev, { ...item, quantity: clampQuantity(quantity) }]
    })
  }, [])

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, quantity: clampQuantity(quantity) } : i)),
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
