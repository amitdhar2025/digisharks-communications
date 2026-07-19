import DigitalProductsPageClient from '../digital-products-page-client'
import QuickEditButton from '@/components/QuickEditButton'
import { getPageContent } from '@/lib/cms-page-content'
import { DEFAULT_CONTENT } from '@/lib/digital-products-content'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Digital Products · Digisharks Communications',
  description:
    'Browse verified digital databases and assets from Digisharks Communications. Instant download after secure checkout.',
}

export default async function DigitalProductsPage() {
  // Fetch CMS content — if available, it overrides DEFAULT_CONTENT
  const cmsContent = await getPageContent('digital-products')
  const content = { ...DEFAULT_CONTENT, ...(cmsContent || {}) }
  return <>
    <DigitalProductsPageClient content={content} />
    <QuickEditButton slug="digital-products" />
  </>
}
