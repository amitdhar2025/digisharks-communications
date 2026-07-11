import Link from 'next/link'
import CartView from './CartView'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Your cart · Digisharks Communications',
}

export default function CartPage() {
  return (
    <div className="content">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="mesh-grid"></div>
      <main className="dp-cart">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              'itemListElement': [
                { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://digisharkscommunications.com'}/` },
                { '@type': 'ListItem', 'position': 2, 'name': 'Digital Products', 'item': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://digisharkscommunications.com'}/digital-products` },
                { '@type': 'ListItem', 'position': 3, 'name': 'Cart', 'item': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://digisharkscommunications.com'}/cart` },
              ],
            }),
          }}
        />
        <nav className="dp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="sep" aria-hidden="true">›</span>
          <Link href="/digital-products">Digital Products</Link>
          <span className="sep" aria-hidden="true">›</span>
          <span className="current" aria-current="page">Cart</span>
        </nav>
        <h1>Your cart</h1>
        <CartView />
      </main>
    </div>
  )
}
