import { connectMongoose } from './mongoose'
import BlogPost from './models/BlogPost'

export interface BlogPostPublic {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  shortDescription?: string
  coverImage?: string
  featuredImage?: { url: string; publicId: string; alt: string; width: number; height: number } | null
  bannerImage?: { url: string; publicId: string; alt: string; width: number; height: number } | null
  videoUrl?: string
  author: string
  authorImage?: string
  authorBio?: string
  categories: { _id: string; name: string; slug: string; color: string }[]
  tags: { _id: string; name: string; slug: string }[]
  readingTime: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
  views: number
  comments: number
  isFeatured: boolean
  // SEO fields
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
}

function serializePost(p: any): BlogPostPublic {
  return {
    _id: String(p._id),
    title: p.title || '',
    slug: p.slug || '',
    content: p.content || '',
    excerpt: p.excerpt || p.shortDescription || '',
    shortDescription: p.shortDescription || '',
  coverImage: typeof p.featuredImage === 'object' && p.featuredImage?.url
    ? p.featuredImage.url
    : typeof p.featuredImage === 'string'
      ? p.featuredImage
      : p.coverImage || '',
  featuredImage: typeof p.featuredImage === 'object' ? p.featuredImage : null,
  bannerImage: typeof p.bannerImage === 'object' ? p.bannerImage : null,
    videoUrl: p.videoUrl || '',
    author: p.author || 'Digisharks Team',
    authorImage: p.authorImage || '',
    authorBio: p.authorBio || '',
    categories: (p.categories || []).map((c: any) => ({
      _id: String(c._id),
      name: c.name,
      slug: c.slug,
      color: c.color || '#4F46E5',
    })),
    tags: (p.tags || []).map((t: any) => ({
      _id: String(t._id),
      name: t.name,
      slug: t.slug,
    })),
    readingTime: p.readingTime || Math.max(1, Math.ceil((p.content?.split(/\s+/).filter(Boolean).length || 1) / 250)),
    publishedAt: p.publishedAt?.toISOString?.() ?? p.publishedAt ?? undefined,
    createdAt: p.createdAt?.toISOString?.() ?? String(p.createdAt || new Date().toISOString()),
    updatedAt: p.updatedAt?.toISOString?.() ?? String(p.updatedAt || new Date().toISOString()),
    views: p.views || 0,
    comments: p.comments || 0,
    isFeatured: !!p.isFeatured,
    // SEO
    seoTitle: p.seoTitle || '',
    seoDescription: p.seoDescription || '',
    seoKeywords: p.seoKeywords || [],
    canonicalUrl: p.canonicalUrl || '',
    ogTitle: p.ogTitle || '',
    ogDescription: p.ogDescription || '',
    ogImage: p.ogImage || '',
    twitterTitle: p.twitterTitle || '',
    twitterDescription: p.twitterDescription || '',
    twitterImage: p.twitterImage || '',
  }
}

export async function getPublishedPosts(
  page = 1,
  limit = 9,
  categorySlug?: string,
  tagSlug?: string,
  search?: string
): Promise<{ posts: BlogPostPublic[]; total: number; pages: number }> {
  await connectMongoose()

  const query: any = { status: { $in: ['published', 'active', 'featured'] }, isDeleted: { $ne: true } }

  if (categorySlug) {
    const { default: Category } = await import('./models/Category')
    const cat = await Category.findOne({ slug: categorySlug })
    if (cat) query.categories = cat._id
  }

  if (tagSlug) {
    const { default: Tag } = await import('./models/Tag')
    const t = await Tag.findOne({ slug: tagSlug })
    if (t) query.tags = t._id
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
    ]
  }

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    BlogPost.find(query)
      .populate('categories', 'name slug color')
      .populate('tags', 'name slug')
      .sort({ isFeatured: -1, publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BlogPost.countDocuments(query),
  ])

  const posts = items.map(serializePost)

  return { posts, total, pages: Math.ceil(total / limit) }
}

export async function getPostBySlug(slug: string): Promise<BlogPostPublic | null> {
  await connectMongoose()

  const post = await BlogPost.findOne({ slug, status: { $in: ['published', 'active', 'featured'] }, isDeleted: { $ne: true } })
    .populate('categories', 'name slug color')
    .populate('tags', 'name slug')
    .lean()

  if (!post) return null

  // Increment views
  await BlogPost.updateOne({ _id: post._id }, { $inc: { views: 1 } })

  return serializePost(post)
}

export async function getRelatedPosts(
  postId: string,
  categories: string[],
  limit = 3
): Promise<BlogPostPublic[]> {
  await connectMongoose()

  const items = await BlogPost.find({
    _id: { $ne: postId },
    status: { $in: ['published', 'active', 'featured'] },
    categories: { $in: categories },
    isDeleted: { $ne: true },
  })
    .populate('categories', 'name slug color')
    .populate('tags', 'name slug')
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean()

  return items.map(serializePost)
}

export async function getLatestPosts(limit = 5): Promise<BlogPostPublic[]> {
  await connectMongoose()

  const items = await BlogPost.find({ status: { $in: ['published', 'active', 'featured'] }, isDeleted: { $ne: true } })
    .populate('categories', 'name slug color')
    .populate('tags', 'name slug')
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean()

  return items.map(serializePost)
}

export async function getAllBlogSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  await connectMongoose()

  const posts = await BlogPost.find(
    { status: { $in: ['published', 'active', 'featured'] }, isDeleted: { $ne: true } },
    { slug: 1, updatedAt: 1 }
  )
    .sort({ publishedAt: -1 })
    .lean()

  return posts.map((p) => ({
    slug: p.slug,
    updatedAt: p.updatedAt || new Date(),
  }))
}

export async function getAllBlogPostsForSitemap(): Promise<
  { slug: string; updatedAt: Date; seoTitle?: string; seoDescription?: string }[]
> {
  await connectMongoose()

  const posts = await BlogPost.find(
    { status: { $in: ['published', 'active', 'featured'] }, isDeleted: { $ne: true } },
    { slug: 1, updatedAt: 1, seoTitle: 1, seoDescription: 1 }
  )
    .sort({ publishedAt: -1 })
    .lean()

  return posts.map((p) => ({
    slug: p.slug,
    updatedAt: p.updatedAt || new Date(),
    seoTitle: p.seoTitle || undefined,
    seoDescription: p.seoDescription || undefined,
  }))
}
