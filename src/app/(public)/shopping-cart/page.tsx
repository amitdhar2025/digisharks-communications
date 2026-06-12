import Link from 'next/link'
import CartView from './CartView'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Shopping cart · Digisharks Communications',
  description: 'Review the digital products in your cart and proceed to secure checkout.',
}

export default function ShoppingCartPage() {
  return (
    <div className="content">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="mesh-grid"></div>
      <main className="dp-cart">
        <nav className="dp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="sep">›</span>
          <Link href="/digital-products">Digital Products</Link>
          <span className="sep">›</span>
          <span className="current">Cart</span>
        </nav>
        <h1>Shopping cart</h1>
        <CartView />
      </main>
    </div>
  )
}
