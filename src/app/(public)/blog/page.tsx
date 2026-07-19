import { Suspense } from 'react'
import BlogListingClient from './BlogListingClient'
import './blog.css'
import QuickEditButton from '@/components/QuickEditButton'
import { getPageContent } from '@/lib/cms-page-content'
import { DEFAULT_CONTENT } from '@/lib/blog-content'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Blog - Digisharks Communications | Digital PR & Marketing Insights',
  description: 'Explore the Digisharks blog for expert insights on digital PR, social media marketing, SEO, web development, and brand strategy.',
  openGraph: {
    title: 'Blog - Digisharks Communications',
    description: 'Expert insights on digital PR and marketing.',
  },
}

export default async function BlogPage() {
  // Fetch CMS content — if available, it overrides DEFAULT_CONTENT
  const cmsContent = await getPageContent('blog')
  const content = { ...DEFAULT_CONTENT, ...(cmsContent || {}) }
  return (
    <Suspense fallback={
      <div className="blog-page">
        <div className="blog-hero">
          <h1>Digisharks Blog</h1>
          <p>Loading articles...</p>
        </div>
      </div>
    }>
      <BlogListingClient content={content} />
      <QuickEditButton slug="blog" />
    </Suspense>
  )
}
