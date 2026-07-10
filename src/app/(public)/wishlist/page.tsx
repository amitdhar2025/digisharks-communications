import Link from 'next/link'
import WishlistView from './WishlistView'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Wishlist · Digisharks Communications',
  description: 'View and manage products you have saved to your wishlist.',
}

export default function WishlistPage() {
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
          <span className="current">Wishlist</span>
        </nav>
        <h1>My Wishlist</h1>
        <WishlistView />
      </main>
    </div>
  )
}
