import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { connectMongoose } from '@/lib/mongoose'
import BlogPost from '@/lib/models/BlogPost'
import slugify from 'slugify'
import { v2 as cloudinary } from 'cloudinary'
import DOMPurify from 'isomorphic-dompurify'
import { sanitizePlainTextFields } from '@/lib/sanitize'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
})

export const dynamic = 'force-dynamic'

// GET /api/admin/blog/posts - List posts with filtering, sorting, search
export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectMongoose()
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const sortField = searchParams.get('sort') || 'updatedAt'
    const sortOrder = searchParams.get('order') === 'asc' ? 1 : -1

    const query: any = {}
    if (status && status !== 'all') query.status = status
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ]
    }
    if (category) {
      const { default: Category } = await import('@/lib/models/Category')
      const cat = await Category.findOne({ slug: category })
      if (cat) query.categories = cat._id
    }
    if (tag) {
      const { default: Tag } = await import('@/lib/models/Tag')
      const t = await Tag.findOne({ slug: tag })
      if (t) query.tags = t._id
    }

    const skip = (page - 1) * limit
    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .populate('categories', 'name slug color isActive')
        .populate('tags', 'name slug isActive')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(query),
    ])

    const serialized = posts.map((p) => ({
      ...p,
      _id: String(p._id),
      createdAt: p.createdAt?.toISOString?.() ?? String(p.createdAt),
      updatedAt: p.updatedAt?.toISOString?.() ?? String(p.updatedAt),
      publishedAt: p.publishedAt?.toISOString?.() ?? null,
      scheduledAt: p.scheduledAt?.toISOString?.() ?? null,
    }))

    return NextResponse.json({
      posts: serialized,
      total,
      pages: Math.ceil(total / limit),
      page,
    })
  } catch (err) {
    console.error('GET /api/admin/blog/posts error', err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/admin/blog/posts - Create a new post
export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectMongoose()
    const body = await req.json()

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Sanitize content (rich-text via DOMPurify)
    const sanitizedContent = DOMPurify.sanitize(body.content || '')

    // Sanitize plain-text fields (title, excerpt, etc.)
    const safeBody = sanitizePlainTextFields(
      body,
      ['title', 'excerpt', 'shortDescription', 'author', 'authorImage', 'seoAltTag', 'seoTitle', 'seoDescription', 'canonicalUrl', 'ogTitle', 'ogDescription', 'ogImage', 'twitterTitle', 'twitterDescription', 'twitterImage', 'breadcrumbTitle'],
    )

    // Generate slug from title or use provided slug
    let slug = body.slug
      ? slugify(body.slug, { lower: true, strict: true })
      : slugify(body.title, { lower: true, strict: true })

    // Ensure unique slug
    const existing = await BlogPost.findOne({ slug })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const readingTime = body.readingTime || Math.max(1, Math.ceil((sanitizedContent.split(/\\s+/).filter(Boolean).length || 1) / 250))

    const postData: any = {
      title: safeBody.title,
      slug,
      content: sanitizedContent,
      excerpt: safeBody.excerpt || safeBody.title.substring(0, 160),
      shortDescription: safeBody.shortDescription || '',
      featuredImage: body.featuredImage || null,
      bannerImage: body.bannerImage || null,
      author: safeBody.author || 'Digisharks Team',
      authorImage: safeBody.authorImage || '',
      categories: body.categories || [],
      tags: body.tags || [],
      status: body.status || 'draft',
      isFeatured: !!body.featured || body.status === 'featured',
      isActive: body.isActive !== undefined ? body.isActive : true,
      publishedAt: body.status === 'published' || body.status === 'featured' ? new Date() : body.publishedAt || undefined,
      scheduledAt: body.status === 'scheduled' && body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      readingTime,
      // SEO
      seoAltTag: safeBody.seoAltTag || '',
      seoTitle: safeBody.seoTitle || '',
      seoKeywords: body.seoKeywords || [],
      seoDescription: safeBody.seoDescription || '',
      metaRobots: body.metaRobots || 'index',
      metaFollow: body.metaFollow || 'follow',
      canonicalUrl: safeBody.canonicalUrl || '',
      ogTitle: safeBody.ogTitle || '',
      ogDescription: safeBody.ogDescription || '',
      ogImage: safeBody.ogImage || '',
      twitterTitle: safeBody.twitterTitle || '',
      twitterDescription: safeBody.twitterDescription || '',
      twitterImage: safeBody.twitterImage || '',
      breadcrumbTitle: safeBody.breadcrumbTitle || '',
      schemaType: body.schemaType || 'BlogPosting',
    }

    const post = new BlogPost(postData)
    await post.save()

    const populated = await BlogPost.findById(post._id)
      .populate('categories', 'name slug color')
      .populate('tags', 'name slug')
      .lean()

    return NextResponse.json({
      post: {
        ...populated,
        _id: String(populated!._id),
        createdAt: populated!.createdAt?.toISOString?.() ?? String(populated!.createdAt),
        updatedAt: populated!.updatedAt?.toISOString?.() ?? String(populated!.updatedAt),
        publishedAt: populated!.publishedAt?.toISOString?.() ?? null,
        scheduledAt: populated!.scheduledAt?.toISOString?.() ?? null,
      },
    }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/admin/blog/posts error', err)
    return NextResponse.json({ error: err.message || 'Failed to create post' }, { status: 500 })
  }
}

// DELETE /api/admin/blog/posts - Bulk delete posts
export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectMongoose()
    const { searchParams } = new URL(req.url)
    const ids = searchParams.get('ids')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query: any = {}

    if (ids) {
      const { default: mongoose } = await import('mongoose')
      const idArray = ids.split(',').filter((id) => mongoose.Types.ObjectId.isValid(id))
      query._id = { $in: idArray }
    }

    if (status && status !== 'all') query.status = status
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ]
    }

    // Find posts to get Cloudinary publicIds for cleanup
    const postsToDelete = await BlogPost.find(query).select('featuredImage bannerImage content').lean()

    // Delete Cloudinary resources
    const publicIds: string[] = []
    const videoPublicIds: string[] = []

    for (const post of postsToDelete) {
      if (post.featuredImage?.publicId) publicIds.push(post.featuredImage.publicId)
      if (post.bannerImage?.publicId) publicIds.push(post.bannerImage.publicId)
      // Extract video publicIds from content
      const videoMatches = post.content?.match(/cloudinary-video-id=["']([^"']+)/g) || []
      videoMatches.forEach((m: string) => {
        const id = m.replace(/cloudinary-video-id=["']([^"']+)/, '$1')
        if (id) videoPublicIds.push(id)
      })
      // Extract image publicIds from content
      const imgMatches = post.content?.match(/data-public-id=["']([^"']+)/g) || []
      imgMatches.forEach((m: string) => {
        const id = m.replace(/data-public-id=["']([^"']+)/, '$1')
        if (id && !publicIds.includes(id)) publicIds.push(id)
      })
    }

    // Delete from Cloudinary in parallel
    const deletePromises = [
      ...publicIds.map((pid) =>
        cloudinary.uploader.destroy(pid).catch(() => {})
      ),
      ...videoPublicIds.map((pid) =>
        cloudinary.uploader.destroy(pid, { resource_type: 'video' } as any).catch(() => {})
      ),
    ]
    await Promise.allSettled(deletePromises)

    const result = await BlogPost.deleteMany(query)
    const count = result.deletedCount || 0

    return NextResponse.json({
      success: true,
      deleted: count,
      message: `${count} post(s) deleted successfully`,
    })
  } catch (err) {
    console.error('DELETE /api/admin/blog/posts bulk error', err)
    return NextResponse.json({ error: 'Failed to delete posts' }, { status: 500 })
  }
}
