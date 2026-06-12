import Link from 'next/link'
import CheckoutView from './CheckoutView'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Checkout · Digisharks Communications',
  description: 'Securely complete your purchase of digital products from Digisharks Communications.',
}

export default function CheckoutPage() {
  return (
    <div className="content">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="mesh-grid"></div>
      <main className="dp-checkout">
        <nav className="dp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="sep">›</span>
          <Link href="/digital-products">Digital Products</Link>
          <span className="sep">›</span>
          <Link href="/shopping-cart">Cart</Link>
          <span className="sep">›</span>
          <span className="current">Checkout</span>
        </nav>
        <h1>Checkout</h1>
        <CheckoutView />
      </main>
    </div>
  )
}
