'use client'

import NewsCard from './NewsCard'

interface NewsItem {
  title: string
  link: string
  description: string
  pubDate: string
  source: string
  category: string
  feedId: string
}

interface NewsGridProps {
  items: NewsItem[]
}

export default function NewsGrid({ items }: NewsGridProps) {
  if (items.length === 0) return null

  // First load shows up to 9 items in layout: featured row + 3-col grid
  // On subsequent loads (load more), just render as 3-col grid
  const featuredItems = items.slice(0, 3)
  const remainingItems = items.slice(3)

  return (
    <div>
      {/* Featured row — only on first 3 items */}
      {featuredItems.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: featuredItems.length >= 3 ? '1.5fr 1fr' : '1fr',
            gap: 20,
            marginBottom: 24,
          }}
        >
          {/* Large featured card (first item) */}
          {featuredItems[0] && (
            <NewsCard item={featuredItems[0]} variant="large" />
          )}

          {/* Stacked medium cards (items 2 and 3) */}
          {featuredItems.length >= 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {featuredItems.slice(1, 3).map((item, i) => (
                <NewsCard key={i} item={item} variant="medium" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Remaining items as 3-column grid */}
      {remainingItems.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}
        >
          {remainingItems.map((item, i) => (
            <NewsCard key={i} item={item} variant="small" />
          ))}
        </div>
      )}
    </div>
  )
}
