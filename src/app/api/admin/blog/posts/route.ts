import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { connectMongoose } from '@/lib/mongoose'
import BlogPost from '@/lib/models/BlogPost'
import { softDeleteFromMongoose } from '@/lib/trash'
import { sanitizePlainTextFields } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'

// GET /api/admin/blog/posts - List posts with filtering, sorting, search
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check permission for sub-admins
    let subPerms = null
    if (!isSuperAdmin(admin) && admin.subAdminId) {
      subPerms = await getSubAdminPermissions(admin.subAdminId)
      const denied = await requirePermission(admin, 'blog', 'view', subPerms)
      if (denied) return denied
    }

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
    // Keep isDeleted filter as safety net for any legacy posts from before
    // the migration to trash_items collection.
    query.isDeleted = { $ne: true }
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
  } catch (err: any) {
    console.error('GET /api/admin/blog/posts error', err)
    return NextResponse.json({ error: err?.message || 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/admin/blog/posts - Create a new post
export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check create permission for sub-admins
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'blog', 'create', subPerms)
    if (denied) return denied
  }

  try {
    await connectMongoose()
    const body = await req.json()

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Lazy-import heavy packages so the GET handler (and module init) never loads them
    const [{ default: DOMPurify }, { default: slugifyFn }] = await Promise.all([
      import('isomorphic-dompurify'),
      import('slugify'),
    ])

    // Sanitize content (rich-text via DOMPurify)
    const sanitizedContent = DOMPurify.sanitize(body.content || '')

    // Sanitize plain-text fields (title, excerpt, etc.)
    const safeBody = sanitizePlainTextFields(
      body,
      ['title', 'excerpt', 'shortDescription', 'author', 'authorImage', 'seoAltTag', 'seoTitle', 'seoDescription', 'canonicalUrl', 'ogTitle', 'ogDescription', 'ogImage', 'twitterTitle', 'twitterDescription', 'twitterImage', 'breadcrumbTitle'],
    )

    // Generate slug from title or use provided slug
    let slug = body.slug
      ? slugifyFn(body.slug, { lower: true, strict: true })
      : slugifyFn(body.title, { lower: true, strict: true })

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

// DELETE /api/admin/blog/posts - Bulk soft-delete posts (set isDeleted=true)
export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check delete permission for sub-admins
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'blog', 'delete', subPerms)
    if (denied) return denied
  }

  try {
    await connectMongoose()

    // Find all non-deleted posts and move each to trash_items individually.
    const posts = await BlogPost.find({ isDeleted: { $ne: true } }).select('_id title').lean()
    let successCount = 0
    for (const post of posts) {
      try {
        await softDeleteFromMongoose(
          'blogposts',
          BlogPost,
          String(post._id),
          { username: admin.username, role: admin.role },
          (doc) => String(doc.title || 'Untitled Post'),
        )
        successCount++
      } catch {
        // Continue with remaining posts
      }
    }

    return NextResponse.json({
      success: true,
      deleted: successCount,
      message: `${successCount} post(s) moved to trash.`,
    })
  } catch (err) {
    console.error('DELETE /api/admin/blog/posts bulk error', err)
    return NextResponse.json({ error: 'Failed to delete posts' }, { status: 500 })
  }
}
