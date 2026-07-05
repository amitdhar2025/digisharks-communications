import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { connectMongoose } from '@/lib/mongoose'
import BlogPost from '@/lib/models/BlogPost'

export const dynamic = 'force-dynamic'

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

    const [{ default: slugifyFn }] = await Promise.all([
      import('slugify'),
    ])

    const body = await req.json()
    const originalId = body.postId
    if (!originalId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 })
    }

    // Find the original post (include deleted ones too so duplicate works on trashed posts)
    const original = await BlogPost.findById(originalId)
      .populate('categories', '_id')
      .populate('tags', '_id')
      .lean()

    if (!original) {
      return NextResponse.json({ error: 'Original post not found' }, { status: 404 })
    }

    // Generate slug: original-slug-copy, make unique if needed
    const baseSlug = original.slug || 'post'
    let newSlug = `${baseSlug}-copy`
    let slugSuffix = 2
    while (await BlogPost.findOne({ slug: newSlug })) {
      newSlug = `${baseSlug}-copy-${slugSuffix}`
      slugSuffix++
    }

    // Build duplicate document — copy everything except timestamps, status, slug
    const postData: Record<string, unknown> = {
      title: `Copy of ${original.title}`,
      slug: newSlug,
      content: original.content || '',
      excerpt: original.excerpt || '',
      shortDescription: original.shortDescription || '',
      featuredImage: original.featuredImage || null,
      bannerImage: original.bannerImage || null,
      videoUrl: original.videoUrl || '',
      author: original.author || 'Digisharks Team',
      authorImage: original.authorImage || '',
      authorBio: original.authorBio || '',
      categories: (original.categories || []).map((c: any) => c._id || c),
      tags: (original.tags || []).map((t: any) => t._id || t),
      status: 'draft',
      isFeatured: false,
      isActive: true,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      autoDeleteAt: null,
      publishedAt: undefined,
      scheduledAt: undefined,
      views: 0,
      comments: 0,

      // SEO
      seoAltTag: original.seoAltTag || '',
      seoTitle: original.seoTitle || '',
      seoKeywords: original.seoKeywords || [],
      seoDescription: original.seoDescription || '',
      metaRobots: original.metaRobots || 'index',
      metaFollow: original.metaFollow || 'follow',
      canonicalUrl: original.canonicalUrl || '',
      ogTitle: original.ogTitle || '',
      ogDescription: original.ogDescription || '',
      ogImage: original.ogImage || '',
      twitterTitle: original.twitterTitle || '',
      twitterDescription: original.twitterDescription || '',
      twitterImage: original.twitterImage || '',
      breadcrumbTitle: original.breadcrumbTitle || '',
      schemaType: original.schemaType || 'BlogPosting',

      // Recalculate reading time from content
      readingTime: Math.max(1, Math.ceil(((original.content || '').split(/\s+/).filter(Boolean).length || 1) / 250)),
    }

    const post = new BlogPost(postData)
    await post.save()

    // Populate for response
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
        publishedAt: null,
        scheduledAt: null,
      },
      message: 'Post duplicated successfully.',
    }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/admin/blog/posts/duplicate error', err)
    return NextResponse.json({ error: err.message || 'Failed to duplicate post' }, { status: 500 })
  }
}
