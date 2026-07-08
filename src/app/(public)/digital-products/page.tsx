import DigitalProductsPageClient from '../digital-products-page-client'
import QuickEditButton from '@/components/QuickEditButton'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Digital Products · Digisharks Communications',
  description:
    'Browse verified digital databases and assets from Digisharks Communications. Instant download after secure checkout.',
}

export default function DigitalProductsPage() {
  return <>
    <DigitalProductsPageClient />
    <QuickEditButton slug="digital-products" />
  </>
}
