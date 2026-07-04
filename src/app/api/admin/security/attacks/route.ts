import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getAttacksList } from '@/lib/anti-spam'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))

    let dateRange: { start: Date; end: Date } | undefined
    const range = searchParams.get('range') || 'all'

    if (range !== 'all') {
      const now = new Date()
      const end = new Date(now)
      let start: Date

      switch (range) {
        case 'today':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'yesterday':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
          end.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case '7days':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30days':
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'custom': {
          const from = searchParams.get('from')
          const to = searchParams.get('to')
          if (from && to) {
            start = new Date(from)
            const toDate = new Date(to)
            end.setFullYear(toDate.getFullYear(), toDate.getMonth(), toDate.getDate())
            end.setHours(23, 59, 59, 999)
          } else {
            start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
          break
        }
        default:
          start = new Date(0)
      }

      dateRange = { start, end }
    }

    const result = await getAttacksList(page, limit, dateRange)
    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/admin/security/attacks error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
