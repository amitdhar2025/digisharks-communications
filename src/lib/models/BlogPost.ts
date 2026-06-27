import mongoose, { Schema, Document, Model } from 'mongoose'

// Register related models so Mongoose can resolve populate refs
import './Category'
import './Tag'

export interface IImageInfo {
  url: string
  publicId: string
  alt: string
  width: number
  height: number
}

export interface IBlogPost extends Document {
  title: string
  slug: string
  content: string
  excerpt: string
  shortDescription: string
  featuredImage: IImageInfo | null
  bannerImage: IImageInfo | null
  videoUrl: string
  author: string
  authorImage: string
  authorBio: string
  categories: mongoose.Types.ObjectId[]
  tags: mongoose.Types.ObjectId[]
  status: 'draft' | 'published' | 'active' | 'inactive' | 'featured' | 'scheduled'
  isFeatured: boolean
  isActive: boolean
  publishedAt?: Date
  scheduledAt?: Date
  views: number
  comments: number

  // SEO
  seoAltTag: string
  seoTitle: string
  seoKeywords: string[]
  seoDescription: string
  metaRobots: 'index' | 'noindex'
  metaFollow: 'follow' | 'nofollow'
  canonicalUrl: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  breadcrumbTitle: string
  schemaType: string

  readingTime: number
  createdAt: Date
  updatedAt: Date
}

const ImageInfoSchema = new Schema<IImageInfo>(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  { _id: false }
)

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    featuredImage: { type: ImageInfoSchema, default: null },
    bannerImage: { type: ImageInfoSchema, default: null },
    videoUrl: { type: String, default: '' },
    author: { type: String, default: 'Digisharks Team' },
    authorImage: { type: String, default: '' },
    authorBio: { type: String, default: '' },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    status: {
      type: String,
      enum: ['draft', 'published', 'active', 'inactive', 'featured', 'scheduled'],
      default: 'draft',
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    publishedAt: { type: Date },
    scheduledAt: { type: Date },
    views: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },

    // SEO
    seoAltTag: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoKeywords: [{ type: String }],
    seoDescription: { type: String, default: '' },
    metaRobots: { type: String, enum: ['index', 'noindex'], default: 'index' },
    metaFollow: { type: String, enum: ['follow', 'nofollow'], default: 'follow' },
    canonicalUrl: { type: String, default: '' },
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    twitterTitle: { type: String, default: '' },
    twitterDescription: { type: String, default: '' },
    twitterImage: { type: String, default: '' },
    breadcrumbTitle: { type: String, default: '' },
    schemaType: { type: String, default: 'BlogPosting' },

    readingTime: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Compound indexes for common queries
BlogPostSchema.index({ status: 1, publishedAt: -1 })
BlogPostSchema.index({ status: 1, isFeatured: -1, publishedAt: -1 })
BlogPostSchema.index({ categories: 1 })
BlogPostSchema.index({ tags: 1 })
BlogPostSchema.index({ slug: 1, status: 1 })

const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema)

export default BlogPost
