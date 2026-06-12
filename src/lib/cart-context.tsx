'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface CartItem {
  slug: string
  title: string
  price: number
  compareAtPrice?: number
  image?: string
  qty: number
}

interface CartState {
  items: CartItem[]
  /** Whether the cart has been hydrated from localStorage. */
  hydrated: boolean
}

type CartAction =
  | { type: 'HYDRATE'; items: CartItem[] }
  | { type: 'ADD'; item: Omit<CartItem, 'qty'>; qty?: number }
  | { type: 'REMOVE'; slug: string }
  | { type: 'SET_QTY'; slug: string; qty: number }
  | { type: 'CLEAR' }

const STORAGE_KEY = 'digisharks_cart_v2'
// Bumped from v1 to v2 to clear any stale cart items (e.g. with qty=6) that
// may have been persisted in older localStorage states. New carts will
// default to qty = 1.
const DEFAULT_QTY = 1

const initialState: CartState = { items: [], hydrated: false }

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items, hydrated: true }
    case 'ADD': {
      const qty = action.qty ?? 1
      const idx = state.items.findIndex((i) => i.slug === action.item.slug)
      if (idx >= 0) {
        const next = state.items.slice()
        next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        return { ...state, items: next }
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, qty }],
      }
    }
    case 'REMOVE':
      return {
        ...state,
        items: state.items.filter((i) => i.slug !== action.slug),
      }
    case 'SET_QTY': {
      if (action.qty <= 0) {
        return { ...state, items: state.items.filter((i) => i.slug !== action.slug) }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.slug === action.slug ? { ...i, qty: action.qty } : i
        ),
      }
    }
    case 'CLEAR':
      return { ...state, items: [] }
    default:
      return state
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                            */
/* ------------------------------------------------------------------ */

interface CartContextValue {
  items: CartItem[]
  hydrated: boolean
  itemCount: number
  subtotal: number
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  remove: (slug: string) => void
  setQty: (slug: string, qty: number) => void
  clear: () => void
  /** A short toast message, auto-cleared. */
  toast: string | null
  showToast: (m: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [toast, setToast] = useState<string | null>(null)

  // Hydrate from localStorage on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          dispatch({ type: 'HYDRATE', items: parsed.filter(isValidItem) })
          return
        }
      }
    } catch (e) {
      console.warn('Failed to hydrate cart:', e)
    }
    dispatch({ type: 'HYDRATE', items: [] })
  }, [])

  // Persist to localStorage on change (post-hydrate).
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!state.hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch (e) {
      console.warn('Failed to persist cart:', e)
    }
  }, [state.items, state.hydrated])

  const showToast = useCallback((m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(null), 2500)
  }, [])

  const add = useCallback(
    (item: Omit<CartItem, 'qty'>, qty = 1) => {
      dispatch({ type: 'ADD', item, qty })
      showToast(`Added "${item.title}" to cart`)
    },
    [showToast]
  )

  const remove = useCallback((slug: string) => {
    dispatch({ type: 'REMOVE', slug })
  }, [])

  const setQty = useCallback((slug: string, qty: number) => {
    dispatch({ type: 'SET_QTY', slug, qty })
  }, [])

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.items.reduce((s, i) => s + i.qty, 0)
    const subtotal = state.items.reduce((s, i) => s + i.qty * i.price, 0)
    return {
      items: state.items,
      hydrated: state.hydrated,
      itemCount,
      subtotal,
      add,
      remove,
      setQty,
      clear,
      toast,
      showToast,
    }
  }, [state, add, remove, setQty, clear, toast, showToast])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>')
  }
  return ctx
}

function isValidItem(x: any): x is CartItem {
  return (
    x &&
    typeof x.slug === 'string' &&
    typeof x.title === 'string' &&
    typeof x.price === 'number' &&
    typeof x.qty === 'number' &&
    x.qty > 0
  )
}
