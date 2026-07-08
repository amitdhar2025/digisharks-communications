import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { connectMongoose } from '@/lib/mongoose'
import BlogPost from '@/lib/models/BlogPost'
import mongoose from 'mongoose'
import { stripHtml } from '@/lib/sanitize'
import { softDeleteFromMongoose } from '@/lib/trash'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check view permission for sub-admins
  if (!isSuperAdmin(admin) && admin.subAdminId) {
    const subPerms = await getSubAdminPermissions(admin.subAdminId)
    const denied = await requirePermission(admin, 'blog', 'view', subPerms)
    if (denied) return denied
  }

  try {
    await connectMongoose()
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    const post = await BlogPost.findById(id)
      .populate('categories', 'name slug color')
      .populate('tags', 'name slug')
      .lean()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({
      post: {
        ...post,
        _id: String(post._id),
        createdAt: post.createdAt?.toISOString?.() ?? String(post.createdAt),
        updatedAt: post.updatedAt?.toISOString?.() ?? String(post.updatedAt),
        publishedAt: post.publishedAt?.toISOString?.() ?? null,
        scheduledAt: post.scheduledAt?.toISOString?.() ?? null,
      },
    })
  } catch (err) {
    console.error('GET /api/admin/blog/posts/[id] error', err)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check edit permission for sub-admins
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'blog', 'edit', subPerms)
    if (denied) return denied
  }

  try {
    await connectMongoose()
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    const body = await req.json()
    const updateData: any = {}

    // Basic Info
    // Lazy-load heavy packages so the GET/DELETE handlers never trigger these imports
    const [{ default: DOMPurify }, { default: slugifyFn }] = await Promise.all([
      import('isomorphic-dompurify'),
      import('slugify'),
    ])

    if (body.title !== undefined) updateData.title = stripHtml(body.title)
    if (body.slug !== undefined) {
      updateData.slug = slugifyFn(body.slug, { lower: true, strict: true })
    }
    if (body.content !== undefined) {
      updateData.content = DOMPurify.sanitize(body.content || '')
    }
    if (body.excerpt !== undefined) updateData.excerpt = stripHtml(body.excerpt)
    if (body.shortDescription !== undefined) updateData.shortDescription = stripHtml(body.shortDescription)
    if (body.author !== undefined) updateData.author = stripHtml(body.author)
    if (body.authorImage !== undefined) updateData.authorImage = stripHtml(body.authorImage)
    if (body.publishedAt !== undefined) updateData.publishedAt = body.publishedAt ? new Date(body.publishedAt) : undefined
    if (body.readingTime !== undefined) updateData.readingTime = body.readingTime

    // Status
    if (body.status !== undefined) updateData.status = body.status
    if (body.featured !== undefined) updateData.isFeatured = !!body.featured || body.status === 'featured'
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.scheduledAt !== undefined) updateData.scheduledAt = body.status === 'scheduled' && body.scheduledAt ? new Date(body.scheduledAt) : undefined

    // Categories & Tags
    if (body.categories !== undefined) updateData.categories = body.categories
    if (body.tags !== undefined) updateData.tags = body.tags

    // Images
    if (body.featuredImage !== undefined) updateData.featuredImage = body.featuredImage
    if (body.bannerImage !== undefined) updateData.bannerImage = body.bannerImage

    // SEO
    if (body.seoAltTag !== undefined) updateData.seoAltTag = stripHtml(body.seoAltTag)
    if (body.seoTitle !== undefined) updateData.seoTitle = stripHtml(body.seoTitle)
    if (body.seoKeywords !== undefined) updateData.seoKeywords = body.seoKeywords
    if (body.seoDescription !== undefined) updateData.seoDescription = stripHtml(body.seoDescription)
    if (body.metaRobots !== undefined) updateData.metaRobots = body.metaRobots
    if (body.metaFollow !== undefined) updateData.metaFollow = body.metaFollow
    if (body.canonicalUrl !== undefined) updateData.canonicalUrl = stripHtml(body.canonicalUrl)
    if (body.ogTitle !== undefined) updateData.ogTitle = stripHtml(body.ogTitle)
    if (body.ogDescription !== undefined) updateData.ogDescription = stripHtml(body.ogDescription)
    if (body.ogImage !== undefined) updateData.ogImage = stripHtml(body.ogImage)
    if (body.twitterTitle !== undefined) updateData.twitterTitle = stripHtml(body.twitterTitle)
    if (body.twitterDescription !== undefined) updateData.twitterDescription = stripHtml(body.twitterDescription)
    if (body.twitterImage !== undefined) updateData.twitterImage = stripHtml(body.twitterImage)
    if (body.breadcrumbTitle !== undefined) updateData.breadcrumbTitle = stripHtml(body.breadcrumbTitle)
    if (body.schemaType !== undefined) updateData.schemaType = body.schemaType

    // If publishing for the first time, set publishedAt
    if (body.status === 'published' || body.status === 'featured') {
      const existing = await BlogPost.findById(id).select('publishedAt')
      if (existing && !existing.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    // If transitioning away from scheduled, clear scheduledAt
    if (body.status && body.status !== 'scheduled') {
      updateData.scheduledAt = null
    }

    const post = await BlogPost.findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('categories', 'name slug color')
      .populate('tags', 'name slug')
      .lean()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({
      post: {
        ...post,
        _id: String(post._id),
        createdAt: post.createdAt?.toISOString?.() ?? String(post.createdAt),
        updatedAt: post.updatedAt?.toISOString?.() ?? String(post.updatedAt),
        publishedAt: post.publishedAt?.toISOString?.() ?? null,
        scheduledAt: post.scheduledAt?.toISOString?.() ?? null,
      },
    })
  } catch (err: any) {
    console.error('PUT /api/admin/blog/posts/[id] error', err)
    return NextResponse.json({ error: err.message || 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    // Move the post to trash_items using the standard trash system.
    // The post is deleted from the blogposts collection and a full data
    // snapshot is stored in trash_items for proper restore and Cloudinary cleanup.
    // Cloudinary files are NOT deleted here — they stay in Cloudinary so the post
    // can be restored with its images. They will be cleaned up when the user
    // clicks "Delete Forever" from the trash section.
    await softDeleteFromMongoose(
      'blogposts',
      BlogPost,
      id,
      { username: admin.username, role: admin.role },
      (doc) => String(doc.title || 'Untitled Post'),
    )

    return NextResponse.json({ success: true, message: 'Post moved to trash.' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('DELETE /api/admin/blog/posts/[id] error:', msg, err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
