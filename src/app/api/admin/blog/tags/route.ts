import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { connectMongoose } from '@/lib/mongoose'
import Tag from '@/lib/models/Tag'
import slugify from 'slugify'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectMongoose()
    const tags = await Tag.find().sort({ name: 1 }).lean()
    const serialized = tags.map((t) => ({
      ...t,
      _id: String(t._id),
      createdAt: t.createdAt?.toISOString?.() ?? String(t.createdAt),
      updatedAt: t.updatedAt?.toISOString?.() ?? String(t.updatedAt),
    }))
    return NextResponse.json({ tags: serialized })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectMongoose()
    const body = await req.json()
    const { name } = body

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = slugify(name, { lower: true, strict: true })
    const existing = await Tag.findOne({ slug })
    if (existing) {
      return NextResponse.json({ error: 'Tag with this name already exists' }, { status: 409 })
    }

    const tag = new Tag({ name, slug })
    await tag.save()

    return NextResponse.json({ tag: { ...tag.toObject(), _id: String(tag._id) } }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create tag' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectMongoose()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 })
    }

    const { default: mongoose } = await import('mongoose')
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid tag ID' }, { status: 400 })
    }

    // Remove tag reference from all blog posts
    const { default: BlogPost } = await import('@/lib/models/BlogPost')
    await BlogPost.updateMany(
      { tags: id },
      { $pull: { tags: id } }
    )

    const deleted = await Tag.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: `Tag "${deleted.name}" deleted` })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete tag' }, { status: 500 })
  }
}
