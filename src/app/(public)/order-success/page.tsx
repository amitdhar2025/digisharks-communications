import Link from 'next/link'
import OrderSuccessView from './OrderSuccessView'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Order confirmed · Digisharks Communications',
}

interface PageProps {
  searchParams: { order?: string }
}

export default function OrderSuccessPage({ searchParams }: PageProps) {
  const orderNumber = searchParams?.order || ''
  return (
    <div className="content">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="mesh-grid"></div>
      <main className="dp-success">
        <OrderSuccessView orderNumber={orderNumber} />
        <p style={{ marginTop: '2rem' }}>
          <Link href="/digital-products" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
            ← Continue shopping
          </Link>
        </p>
      </main>
    </div>
  )
}
