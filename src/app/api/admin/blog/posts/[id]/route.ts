import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { connectMongoose } from '@/lib/mongoose'
import BlogPost from '@/lib/models/BlogPost'
import mongoose from 'mongoose'
import DOMPurify from 'isomorphic-dompurify'
import slugify from 'slugify'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
})

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

  try {
    await connectMongoose()
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    const body = await req.json()
    const updateData: any = {}

    // Basic Info
    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) {
      updateData.slug = slugify(body.slug, { lower: true, strict: true })
    }
    if (body.content !== undefined) {
      updateData.content = DOMPurify.sanitize(body.content || '')
    }
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription
    if (body.author !== undefined) updateData.author = body.author
    if (body.authorImage !== undefined) updateData.authorImage = body.authorImage
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
    if (body.seoAltTag !== undefined) updateData.seoAltTag = body.seoAltTag
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle
    if (body.seoKeywords !== undefined) updateData.seoKeywords = body.seoKeywords
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription
    if (body.metaRobots !== undefined) updateData.metaRobots = body.metaRobots
    if (body.metaFollow !== undefined) updateData.metaFollow = body.metaFollow
    if (body.canonicalUrl !== undefined) updateData.canonicalUrl = body.canonicalUrl
    if (body.ogTitle !== undefined) updateData.ogTitle = body.ogTitle
    if (body.ogDescription !== undefined) updateData.ogDescription = body.ogDescription
    if (body.ogImage !== undefined) updateData.ogImage = body.ogImage
    if (body.twitterTitle !== undefined) updateData.twitterTitle = body.twitterTitle
    if (body.twitterDescription !== undefined) updateData.twitterDescription = body.twitterDescription
    if (body.twitterImage !== undefined) updateData.twitterImage = body.twitterImage
    if (body.breadcrumbTitle !== undefined) updateData.breadcrumbTitle = body.breadcrumbTitle
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

  try {
    await connectMongoose()
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    // Find post to clean up Cloudinary resources
    const post = await BlogPost.findById(id).select('featuredImage bannerImage content').lean()
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Delete Cloudinary resources
    const deletePromises: Promise<any>[] = []
    if (post.featuredImage?.publicId) {
      deletePromises.push(cloudinary.uploader.destroy(post.featuredImage.publicId).catch(() => {}))
    }
    if (post.bannerImage?.publicId) {
      deletePromises.push(cloudinary.uploader.destroy(post.bannerImage.publicId).catch(() => {}))
    }

    await Promise.allSettled(deletePromises)
    await BlogPost.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/blog/posts/[id] error', err)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
