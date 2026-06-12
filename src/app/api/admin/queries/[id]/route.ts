import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest } from '@/lib/auth'
import { getQueriesCollection } from '@/lib/db'

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

function parseId(id: string) {
  try {
    return new ObjectId(id)
  } catch {
    return null
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const objectId = parseId(id)
  if (!objectId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const collection = await getQueriesCollection()
  const doc = await collection.findOne({ _id: objectId })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ item: toClient(doc) })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const objectId = parseId(id)
  if (!objectId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const body = await req.json()
    const update: any = { updatedAt: new Date() }

    if (body.fullName !== undefined) update.fullName = String(body.fullName).trim()
    if (body.email !== undefined) update.email = String(body.email).trim().toLowerCase()
    if (body.phone !== undefined) update.phone = String(body.phone).trim()
    if (body.service !== undefined) update.service = String(body.service).trim()
    if (body.message !== undefined) update.message = String(body.message).trim()
    if (body.status !== undefined) {
      const allowed = ['pending', 'completed', 'follow-up']
      if (!allowed.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      update.status = body.status
    }

    const collection = await getQueriesCollection()
    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: update },
      { returnDocument: 'after' }
    )
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, item: toClient(result) })
  } catch (err) {
    console.error('PUT /api/admin/queries/[id] error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const objectId = parseId(id)
  if (!objectId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const collection = await getQueriesCollection()
  const result = await collection.deleteOne({ _id: objectId })
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
