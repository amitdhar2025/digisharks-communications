import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { connectMongoose } from '@/lib/mongoose'
import Category from '@/lib/models/Category'
import slugify from 'slugify'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectMongoose()
    const categories = await Category.find().sort({ name: 1 }).lean()
    const serialized = categories.map((c) => ({
      ...c,
      _id: String(c._id),
      createdAt: c.createdAt?.toISOString?.() ?? String(c.createdAt),
      updatedAt: c.updatedAt?.toISOString?.() ?? String(c.updatedAt),
    }))
    return NextResponse.json({ categories: serialized })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectMongoose()
    const body = await req.json()
    const { name, description, color } = body

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = slugify(name, { lower: true, strict: true })
    const existing = await Category.findOne({ slug })
    if (existing) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 })
    }

    const category = new Category({ name, slug, description: description || '', color: color || '#4F46E5' })
    await category.save()

    return NextResponse.json({ category: { ...category.toObject(), _id: String(category._id) } }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create category' }, { status: 500 })
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
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const { default: mongoose } = await import('mongoose')
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }

    // Remove category reference from all blog posts
    const { default: BlogPost } = await import('@/lib/models/BlogPost')
    await BlogPost.updateMany(
      { categories: id },
      { $pull: { categories: id } }
    )

    const deleted = await Category.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: `Category "${deleted.name}" deleted` })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete category' }, { status: 500 })
  }
}
