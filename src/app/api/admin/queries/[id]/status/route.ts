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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  try {
    const { status } = await req.json()
    const allowed = ['pending', 'completed', 'follow-up']
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const collection = await getQueriesCollection()
    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, item: toClient(result) })
  } catch (err) {
    console.error('PATCH /api/admin/queries/[id]/status error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
