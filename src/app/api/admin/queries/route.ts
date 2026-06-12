import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getQueriesCollection, ContactQuery } from '@/lib/db'

export const dynamic = 'force-dynamic'

function toClient(q: any) {
  if (!q) return q
  const { _id, ...rest } = q
  const comments = (rest.comments || []).map((c: any) => ({
    _id: c._id?.toString(),
    text: c.text,
    author: c.author,
    createdAt: c.createdAt,
  }))
  return { id: _id?.toString(), ...rest, comments }
}

function buildFilter(searchParams: URLSearchParams) {
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const filter: any = {}
  if (status && status !== 'all') {
    filter.status = status
  }
  if (search) {
    const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [
      { fullName: re },
      { email: re },
      { phone: re },
      { service: re },
      { message: re },
    ]
  }
  return filter
}

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))

  const collection = await getQueriesCollection()
  const filter = buildFilter(searchParams)

  const total = await collection.countDocuments(filter)
  const items = await collection
    .find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray()

  return NextResponse.json({
    items: items.map(toClient),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  })
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { fullName, email, phone, service, message, status } = body || {}

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'fullName, email and message are required' },
        { status: 400 }
      )
    }

    const now = new Date()
    const doc: ContactQuery = {
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      service: service ? String(service).trim() : 'Other',
      message: String(message).trim(),
      status: status || 'pending',
      comments: [],
      createdAt: now,
      updatedAt: now,
    }

    const collection = await getQueriesCollection()
    const result = await collection.insertOne(doc)
    return NextResponse.json({ success: true, id: result.insertedId.toString() }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/queries error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    const filter = buildFilter(searchParams)
    const collection = await getQueriesCollection()

    // Count how many will be deleted for reporting
    const matched = await collection.countDocuments(filter)

    // Only perform the delete if there is at least one matching document
    if (matched === 0) {
      return NextResponse.json({ success: true, deleted: 0, message: 'No queries matched the filter.' })
    }

    const result = await collection.deleteMany(filter)

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} ${result.deletedCount === 1 ? 'query' : 'queries'}.`,
    })
  } catch (err) {
    console.error('DELETE /api/admin/queries error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
