'use client'

import { categoryColor } from '@/lib/news-categorizer'

interface FilterBarProps {
  categories: string[]
  categoryCounts: Record<string, number>
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export default function FilterBar({ categories, categoryCounts, activeCategory, onCategoryChange }: FilterBarProps) {
  // Compute total of all auto-categorized articles (excluding "all" pseudo-bucket)
  const totalCount = Object.values(categoryCounts).reduce((sum, c) => sum + (c || 0), 0)

  return (
    <div
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        padding: '12px 0 14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: 8,
          alignItems: 'center',
          overflowX: 'auto',
          padding: '4px 4px 6px',
          // Hide scrollbar visually but keep functionality
          scrollbarWidth: 'thin',
        }}
        className="news-filter-scroll"
      >
        {/* All chip */}
        <FilterChip
          label="All"
          count={totalCount}
          active={activeCategory === 'all'}
          color="#ff6b00"
          onClick={() => onCategoryChange('all')}
        />

        {categories.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            count={categoryCounts[cat] || 0}
            active={activeCategory === cat}
            color={categoryColor(cat)}
            onClick={() => onCategoryChange(cat)}
          />
        ))}
      </div>

      <style jsx>{`
        .news-filter-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .news-filter-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .news-filter-scroll::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 999px;
        }
        .news-filter-scroll::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  )
}

interface FilterChipProps {
  label: string
  count: number
  active: boolean
  color: string
  onClick: () => void
}

function FilterChip({ label, count, active, color, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '8px 16px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        border: active ? `1px solid ${color}` : '1px solid #e5e7eb',
        background: active ? color : '#ffffff',
        color: active ? '#ffffff' : '#475569',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = color
          e.currentTarget.style.color = color
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = '#e5e7eb'
          e.currentTarget.style.color = '#475569'
        }
      }}
    >
      <span>{label}</span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: 999,
          background: active ? 'rgba(255,255,255,0.22)' : '#f1f5f9',
          color: active ? '#ffffff' : '#64748b',
        }}
      >
        {count}
      </span>
    </button>
  )
}
