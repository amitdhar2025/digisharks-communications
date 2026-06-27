'use client'

interface LoadMoreButtonProps {
  showing: number
  total: number
  loading: boolean
  onLoadMore: () => void
}

export default function LoadMoreButton({ showing, total, loading, onLoadMore }: LoadMoreButtonProps) {
  const hasMore = showing < total

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        marginTop: 32,
        marginBottom: 48,
      }}
    >
      <div style={{ fontSize: 13, color: '#6c757d' }}>
        Showing {showing} of {total} total articles
      </div>

      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 32px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            background: loading ? '#e55f00' : '#ff6b00',
            color: '#ffffff',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
            opacity: loading ? 0.8 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#e55f00'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#ff6b00'
            }
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }}
              />
              Loading...
            </>
          ) : (
            <>
              Load More
              <span style={{ fontSize: 16 }}>↓</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
