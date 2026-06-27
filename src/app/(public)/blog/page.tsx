import { Suspense } from 'react'
import BlogListingClient from './BlogListingClient'
import './blog.css'

export const metadata = {
  title: 'Blog - Digisharks Communications | Digital PR & Marketing Insights',
  description: 'Explore the Digisharks blog for expert insights on digital PR, social media marketing, SEO, web development, and brand strategy.',
  openGraph: {
    title: 'Blog - Digisharks Communications',
    description: 'Expert insights on digital PR and marketing.',
  },
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="blog-page">
        <div className="blog-hero">
          <h1>Digisharks Blog</h1>
          <p>Loading articles...</p>
        </div>
      </div>
    }>
      <BlogListingClient />
    </Suspense>
  )
}
