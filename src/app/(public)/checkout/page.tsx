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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              'itemListElement': [
                { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://digisharkscommunications.com'}/` },
                { '@type': 'ListItem', 'position': 2, 'name': 'Digital Products', 'item': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://digisharkscommunications.com'}/digital-products` },
                { '@type': 'ListItem', 'position': 3, 'name': 'Cart', 'item': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://digisharkscommunications.com'}/shopping-cart` },
                { '@type': 'ListItem', 'position': 4, 'name': 'Checkout', 'item': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://digisharkscommunications.com'}/checkout` },
              ],
            }),
          }}
        />
        <nav className="dp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="sep" aria-hidden="true">›</span>
          <Link href="/digital-products">Digital Products</Link>
          <span className="sep" aria-hidden="true">›</span>
          <Link href="/shopping-cart">Cart</Link>
          <span className="sep" aria-hidden="true">›</span>
          <span className="current" aria-current="page" aria-label="Checkout">✓</span>
        </nav>
        {/* H1 is rendered inside CheckoutView */}
        <CheckoutView />
      </main>
    </div>
  )
}
