import CareerPageClient from './CareerPageClient'
import QuickEditButton from '@/components/QuickEditButton'
import { getPageContent } from '@/lib/cms-page-content'
import { DEFAULT_CONTENT } from '@/lib/career-content'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Careers · Digisharks Communications',
  description:
    'Join the Digisharks Communications team. Explore open positions and build your career in digital PR, marketing, and communications.',
}

export default async function CareerPage() {
  // Fetch CMS content — if available, it overrides DEFAULT_CONTENT
  const cmsContent = await getPageContent('career')
  const content = { ...DEFAULT_CONTENT, ...(cmsContent || {}) }
  return (
    <>
      <CareerPageClient content={content} />
      <QuickEditButton slug="career" />
    </>
  )
}
