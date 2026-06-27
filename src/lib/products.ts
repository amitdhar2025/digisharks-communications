/**
 * Digital product catalogue & seed data.
 *
 * Products are stored in MongoDB. On first run (or whenever the
 * `products` collection is empty), we seed the single launch product
 * (the PAN India Database) so the storefront is never empty.
 *
 * Adding more products later: insert another document into the
 * `products` collection with the same shape. The store reads from the
 * DB at request time, no code change required.
 */
import { ObjectId } from 'mongodb'
import { getDb } from './db'

export const PRODUCT_SLUG = 'pan-india-updated-database-2020-2025'

export interface Product {
  _id?: ObjectId
  slug: string
  title: string
  category: string
  price: number
  compareAtPrice: number
  currency: 'INR'
  shortPitch: string
  images: string[]
  /** Public demo video (mp4 or youtube embed). Optional. */
  demoVideo?: string
  /** "How to use" demo video link — used in the email. */
  howToUseVideo?: string
  /** Star rating, integer 0–5. */
  rating: number
  isActive: boolean
  /** Download URL for the deliverable (PDF/database). */
  downloadUrl?: string
  /** Optional local file path on the server for emailing as attachment. */
  downloadPath?: string
  createdAt: Date
}

export interface OrderItem {
  slug: string
  title: string
  price: number
  qty: number
}

export interface OrderDoc {
  _id?: ObjectId
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
    company?: string
    gst?: string
  }
  items: OrderItem[]
  amount: number
  currency: 'INR'
  payment: {
    provider: 'razorpay'
    razorpayOrderId?: string
    razorpayPaymentId?: string
    razorpaySignature?: string
    status: 'created' | 'paid' | 'failed'
  }
  deliveryStatus: 'not_yet' | 'received'
  emailSent: boolean
  emailSentAt?: Date
  emailError?: string
  createdAt: Date
  updatedAt: Date
}

/* ------------------------------------------------------------------ */
/* Seed data                                                          */
/* ------------------------------------------------------------------ */

const SEED_PRODUCT: Omit<Product, '_id' | 'createdAt'> = {
  slug: PRODUCT_SLUG,
  title: 'PAN INDIA UPDATED DATABASE 2020-2025',
  category: 'Digital',
  price: 299,
  compareAtPrice: 3999,
  currency: 'INR',
  shortPitch:
    'Boost your marketing success with our powerful, extensively curated PAN INDIA UPDATED DATABASE. Ideal for B2B, B2C, and niche targeting — unmatched accuracy and coverage.',
  images: [
    'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/DB2.jpeg',
    'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/DB1.jpeg',
    'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/DB.jpeg',
  ],
  demoVideo:
    'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/database_demo-video-audio-1080p.mp4',
  howToUseVideo:
    process.env.HOW_TO_USE_VIDEO_URL ||
    'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/database_demo-video-audio-1080p.mp4',
  rating: 5,
  isActive: true,
  downloadUrl:
    process.env.DATABASE_DOWNLOAD_URL ||
    'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/Database-pqv5hy-bw-iv1bgt-1.pdf',
  downloadPath: process.env.DATABASE_FILE_PATH || '',
}

/* ------------------------------------------------------------------ */
/* Collection helpers                                                 */
/* ------------------------------------------------------------------ */

export async function getProductsCollection() {
  const db = await getDb()
  return db.collection<Product>('products')
}

export async function getOrdersCollection() {
  const db = await getDb()
  return db.collection<OrderDoc>('orders')
}

/**
 * Idempotent seed: if there are no products in the DB, insert the
 * launch product. Safe to call on every page render.
 */
/** Once seeded successfully, skip the DB count check on subsequent calls */
let _seeded = false

export async function ensureProductsSeeded(): Promise<void> {
  if (_seeded) return
  try {
    const products = await getProductsCollection()
    const count = await products.estimatedDocumentCount()
    if (count > 0) {
      _seeded = true
      return
    }

    await products.insertOne({
      ...SEED_PRODUCT,
      createdAt: new Date(),
    } as Product)
    _seeded = true
  } catch (err) {
    // DB unreachable — callers will fall back to the static seed product.
    console.warn('[products] ensureProductsSeeded skipped (DB unavailable):', (err as Error)?.message)
  }
}

function staticSeedProduct(): Product {
  return { ...(SEED_PRODUCT as Product), createdAt: new Date() }
}

export async function listActiveProducts(): Promise<Product[]> {
  try {
    await ensureProductsSeeded()
    const products = await getProductsCollection()
    return await products.find({ isActive: true }).sort({ createdAt: 1 }).toArray()
  } catch (err) {
    // DB unreachable — fall back to the in-code seed product so the storefront
    // is never empty (matches the live WordPress launch product).
    console.warn('[products] listActiveProducts using static fallback:', (err as Error)?.message)
    return [staticSeedProduct()]
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    await ensureProductsSeeded()
    const products = await getProductsCollection()
    return await products.findOne({ slug, isActive: true })
  } catch (err) {
    // DB unreachable — fall back to the static seed product if it matches.
    console.warn('[products] getProductBySlug using static fallback:', (err as Error)?.message)
    if (slug === SEED_PRODUCT.slug) return staticSeedProduct()
    return null
  }
}

/* ------------------------------------------------------------------ */
/* Static content (long-form copy used by the product detail page)    */
/* ------------------------------------------------------------------ */

export interface ProductContent {
  whyChoose: string[]
  keyFeatures: string[]
  categoriesCovered: string[]
  dataFormat: string
  deliveryFormat: string
  useCases: string[]
  whoBenefits: string[]
  whatsIncluded: string[]
  testimonials: { name: string; stars: number; text: string }[]
  faq: { q: string; a: string }[]
  supportEmail: string
  contactPhone: string
}

export const PAN_INDIA_CONTENT: ProductContent = {
  whyChoose: [
    'Verified Information: dependable, accurate data across all categories',
    'Flexible Use: customize the database to your business goals',
    'Cost-Effective & All-Inclusive: higher ROI with an affordable, all-round solution',
  ],
  keyFeatures: [
    'Thousands of verified active contacts: Entrepreneurs & Business Owners; CEOs, CMOs, CFOs, Directors; Government Officials; Students, Job Seekers, Working Professionals',
    'Coverage of 40+ industries',
    'Nationwide reach across PAN India',
    'Highly accurate & regularly updated',
    'Available in CSV, Excel, and PDF formats',
    'Suitable for Email, SMS, WhatsApp, and Direct Marketing campaigns',
  ],
  categoriesCovered: [
    'Startups',
    'SMEs',
    'MSMEs',
    'Retailers',
    'Importers',
    'Exporters',
    'Event Planners',
    'Marketing Firms',
    'CA/CS',
    'Doctors',
    'Architects',
    'Builders',
    'Real Estate Agents',
    'Educators',
    'Pharma Companies',
    'Freelancers',
    'Consultants',
    'E-commerce Sellers',
  ],
  dataFormat: 'CSV, PDF, XLS — compatible with your CRM or email tools',
  deliveryFormat:
    'Delivered in CSV or Excel for seamless CRM/marketing integration; sent securely via email or cloud download link. Instant access after payment.',
  useCases: [
    'Email Marketing',
    'SMS/WhatsApp Campaigns',
    'Lead Generation',
    'Cold Outreach',
    'B2B Sales',
    'Freelancing',
    'Direct Business Engagements',
  ],
  whoBenefits: [
    'Startups',
    'Entrepreneurs',
    'Freelancers',
    'Sales Professionals',
    'Marketing Agencies',
    'Business Development Teams',
  ],
  whatsIncluded: [
    'Business Contacts: Name, Company, Role, Industry, Email, Phone, City',
    'Consumer Data: Name, Age, Gender, Email, Phone, City',
    'Professional Segments: CA, Doctors, Architects, Builders, etc.',
    'Student Leads: Exam Aspirants, Course Enquiries',
    'Geographic Details: Region-wise segmentation',
  ],
  testimonials: [
    {
      name: 'Amit Khurana',
      stars: 5,
      text: 'Incredible results! I received over 100 quality B2B leads in just 48 hours. Truly worth the investment.',
    },
    {
      name: 'Neha Verma',
      stars: 5,
      text: 'The data is super clean and 100% verified. It helped me triple my ROI on Instagram ad campaigns.',
    },
    {
      name: 'Sachin Mehta',
      stars: 5,
      text: 'Kudos to the team! They delivered exactly what they promised. Having 145+ categories is a huge advantage.',
    },
    {
      name: 'Kavita Iyer',
      stars: 5,
      text: 'Perfect tool for nationwide outreach. Got access to both student and business data, neatly organized and easy to use.',
    },
  ],
  faq: [
    {
      q: 'When will I receive my product?',
      a: 'Instant download right after payment; a copy is also emailed to you.',
    },
    {
      q: 'What if I need help or have questions?',
      a: 'Our support team is available via email.',
    },
    {
      q: 'How long do I have access?',
      a: 'Lifetime access, including free future updates.',
    },
    {
      q: 'Any hidden charges or subscriptions?',
      a: 'No. Pay once, get full access — no recurring fees.',
    },
  ],
  supportEmail: 'marketing@digisharkscommunications.com',
  contactPhone: '+91 96273 32332',
}

export function getProductContent(slug: string): ProductContent | null {
  if (slug === PRODUCT_SLUG) return PAN_INDIA_CONTENT
  return null
}
