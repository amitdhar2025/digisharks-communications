'use client'

import { CartProvider, useCart } from '@/lib/cart-context'
import { useEffect, useState, type ReactNode } from 'react'

/**
 * Wraps the public site with the cart context and renders a small
 * floating toast for "added to cart" confirmations.
 */
export default function CartProviderShell({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <CartToast />
      {children}
    </CartProvider>
  )
}

function CartToast() {
  const { toast } = useCart()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (toast) {
      setVisible(true)
    } else {
      const t = setTimeout(() => setVisible(false), 250)
      return () => clearTimeout(t)
    }
  }, [toast])

  if (!toast) return null
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '110px',
        right: '24px',
        zIndex: 200,
        background: 'linear-gradient(135deg, #00e5ff, #8b5cf6)',
        color: '#05060d',
        padding: '12px 20px',
        borderRadius: '12px',
        fontWeight: 700,
        fontSize: '14px',
        boxShadow: '0 12px 40px rgba(0,229,255,.35), 0 0 0 1px rgba(255,255,255,.15) inset',
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform .25s ease, opacity .25s ease',
        maxWidth: '320px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span aria-hidden="true">✓</span>
      <span>{toast}</span>
    </div>
  )
}
