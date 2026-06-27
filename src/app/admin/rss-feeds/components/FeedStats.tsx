'use client'

interface FeedStatsProps {
  totalFeeds: number
  activeFeeds: number
  totalArticles: number
  categoryCount: number
}

export default function FeedStats({ totalFeeds, activeFeeds, totalArticles, categoryCount }: FeedStatsProps) {
  return (
    <div className="stat-grid">
      <div className="stat-card total">
        <div className="label">Total Feeds</div>
        <div className="value">{totalFeeds}</div>
      </div>
      <div className="stat-card completed">
        <div className="label">Active Feeds</div>
        <div className="value">{activeFeeds}</div>
      </div>
      <div className="stat-card pending">
        <div className="label">Categories</div>
        <div className="value">{categoryCount}</div>
      </div>
      <div className="stat-card followup">
        <div className="label">Articles</div>
        <div className="value">{totalArticles}</div>
      </div>
    </div>
  )
}
