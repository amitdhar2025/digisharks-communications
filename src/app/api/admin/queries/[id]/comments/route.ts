import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest } from '@/lib/auth'
import { getQueriesCollection, QueryComment } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { text } = await req.json()
    if (!text || !String(text).trim()) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 })
    }

    // Pre-assign an ObjectId so the comment can be deleted later
    const comment: QueryComment = {
      _id: new ObjectId(),
      text: String(text).trim(),
      author: admin.username,
      createdAt: new Date(),
    }

    const collection = await getQueriesCollection()
    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $push: { comments: comment }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { _id, ...rest } = result
    // Serialize ObjectIds to strings for JSON response
    const serializedComments = (rest.comments || []).map((c: any) => ({
      _id: c._id?.toString(),
      text: c.text,
      author: c.author,
      createdAt: c.createdAt,
    }))
    return NextResponse.json({
      success: true,
      item: { id: _id.toString(), ...rest, comments: serializedComments },
      comment: {
        _id: comment._id!.toString(),
        text: comment.text,
        author: comment.author,
        createdAt: comment.createdAt,
      },
    })
  } catch (err) {
    console.error('POST /api/admin/queries/[id]/comments error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { commentId } = await req.json()
    if (!commentId) {
      return NextResponse.json({ error: 'commentId is required' }, { status: 400 })
    }

    let cid: ObjectId
    try {
      cid = new ObjectId(commentId)
    } catch {
      return NextResponse.json({ error: 'Invalid commentId' }, { status: 400 })
    }

    const collection = await getQueriesCollection()
    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      {
        $pull: { comments: { _id: cid } } as any,
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    )
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { _id, ...rest } = result
    const serializedComments = (rest.comments || []).map((c: any) => ({
      _id: c._id?.toString(),
      text: c.text,
      author: c.author,
      createdAt: c.createdAt,
    }))
    return NextResponse.json({
      success: true,
      item: { id: _id.toString(), ...rest, comments: serializedComments },
    })
  } catch (err) {
    console.error('DELETE /api/admin/queries/[id]/comments error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
