import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getAuditHistory, getAuditStats, deleteAllAudits } from '@/lib/seo-audit'

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const search = searchParams.get('search') || ''

    const history = await getAuditHistory(page, limit, search)
    const stats = await getAuditStats()

    return NextResponse.json({ ...history, stats })
  } catch (err: any) {
    console.error('Admin audit history error:', err)
    return NextResponse.json({ error: 'Failed to load audit history.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const confirm = searchParams.get('confirm')

    if (confirm !== 'yes') {
      return NextResponse.json(
        { error: 'Confirmation required. Pass ?confirm=yes to delete.' },
        { status: 400 }
      )
    }

    const result = await deleteAllAudits()
    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      message: `Successfully deleted ${result.deleted} ${result.deleted === 1 ? 'audit' : 'audits'}.`,
    })
  } catch (err: any) {
    console.error('DELETE /api/admin/seo-audit error:', err)
    return NextResponse.json({ error: 'Failed to delete audits' }, { status: 500 })
  }
}
