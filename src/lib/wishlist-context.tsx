'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface WishlistItem {
  slug: string
  title: string
  price: number
  compareAtPrice?: number
  image?: string
}

interface WishlistState {
  items: WishlistItem[]
  /** Whether the wishlist has been hydrated from localStorage. */
  hydrated: boolean
}

type WishlistAction =
  | { type: 'HYDRATE'; items: WishlistItem[] }
  | { type: 'TOGGLE'; item: WishlistItem }
  | { type: 'REMOVE'; slug: string }
  | { type: 'CLEAR' }

const STORAGE_KEY = 'digisharks_wishlist_v1'

const initialState: WishlistState = { items: [], hydrated: false }

function reducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items, hydrated: true }
    case 'TOGGLE': {
      const idx = state.items.findIndex((i) => i.slug === action.item.slug)
      if (idx >= 0) {
        return { ...state, items: state.items.filter((i) => i.slug !== action.item.slug) }
      }
      return { ...state, items: [...state.items, action.item] }
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.slug !== action.slug) }
    case 'CLEAR':
      return { ...state, items: [] }
    default:
      return state
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                            */
/* ------------------------------------------------------------------ */

interface WishlistContextValue {
  items: WishlistItem[]
  hydrated: boolean
  count: number
  isWishlisted: (slug: string) => boolean
  toggle: (item: WishlistItem) => void
  remove: (slug: string) => void
  clear: () => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

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
      console.warn('Failed to hydrate wishlist:', e)
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
      console.warn('Failed to persist wishlist:', e)
    }
  }, [state.items, state.hydrated])

  const toggle = useCallback((item: WishlistItem) => {
    dispatch({ type: 'TOGGLE', item })
  }, [])

  const remove = useCallback((slug: string) => {
    dispatch({ type: 'REMOVE', slug })
  }, [])

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const isWishlisted = useCallback(
    (slug: string) => state.items.some((i) => i.slug === slug),
    [state.items]
  )

  const value = useMemo<WishlistContextValue>(() => {
    const count = state.items.length
    return {
      items: state.items,
      hydrated: state.hydrated,
      count,
      isWishlisted,
      toggle,
      remove,
      clear,
    }
  }, [state, isWishlisted, toggle, remove, clear])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (!ctx) {
    throw new Error('useWishlist must be used inside <WishlistProvider>')
  }
  return ctx
}

function isValidItem(x: any): x is WishlistItem {
  return (
    x &&
    typeof x.slug === 'string' &&
    typeof x.title === 'string' &&
    typeof x.price === 'number'
  )
}
