import { NextRequest, NextResponse } from 'next/server'
import { getAuditById } from '@/lib/seo-audit'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Audit ID is required.' }, { status: 400 })
    }

    const audit = await getAuditById(id)

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, audit })
  } catch (err: any) {
    console.error('Error fetching audit:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch audit result.' },
      { status: 500 }
    )
  }
}
