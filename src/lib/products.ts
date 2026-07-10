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

/**
 * A product variation — e.g. "North India Database", "CSV Format".
 * Each variation has its own name and independent pricing.
 */
export interface ProductVariation {
  name: string
  price: number
  compareAtPrice?: number
  isActive: boolean
}

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
  /** URL of the featured/cover image. Falls back to images[0] if not set. */
  featuredImage?: string
  /** Full description / rich HTML content shown on the product detail page. */
  description?: string
  /** Custom SEO title for search engines. Falls back to product title if not set. */
  seoTitle?: string
  /** Custom SEO meta description for search engines. */
  seoDescription?: string
  /** Public demo video (mp4 or youtube embed). Optional. */
  demoVideo?: string
  /** Custom label for the "Watch Demo" button text. */
  demoVideoLabel?: string
  /** Custom font-size for the product title H1 on the detail page (e.g. "22px", "28px"). */
  titleFontSize?: string
  /** "How to use" demo video link — used in the email. */
  howToUseVideo?: string
  /** Star rating, integer 0–5. */
  rating: number
  isActive: boolean
  /** Download URL for the deliverable (PDF/database). */
  downloadUrl?: string
  /** Optional local file path on the server for emailing as attachment. */
  downloadPath?: string
  /** Product variations with independent pricing. Optional. */
  variations?: ProductVariation[]
  /** Custom button text for "Add to Cart" button on product detail page. */
  buttonText?: string
  /** Custom button text for "Buy Now" button on product detail page. */
  buyButtonText?: string
  /** Custom button color (hex) for product detail page buttons. */
  buttonColor?: string
  /** Add to Cart button background color (hex). */
  cartButtonBg?: string
  /** Add to Cart button text color (hex). */
  cartButtonTextColor?: string
  /** Add to Cart button border color (hex). */
  cartButtonBorderColor?: string
  /** Add to Cart button hover background color (hex). */
  cartButtonHoverBg?: string
  /** Add to Cart button hover text color (hex). */
  cartButtonHoverTextColor?: string
  /** Buy Now button background color (hex). */
  buyButtonBg?: string
  /** Buy Now button text color (hex). */
  buyButtonTextColor?: string
  /** Buy Now button border color (hex). */
  buyButtonBorderColor?: string
  /** Buy Now button hover background color (hex). */
  buyButtonHoverBg?: string
  /** Buy Now button hover text color (hex). */
  buyButtonHoverTextColor?: string
  /** Dynamic tabs for product detail page (label + rich HTML content). */
  tabs?: ProductTab[]
  /** Customer reviews / testimonials shown on the product detail page. */
  testimonials?: { name: string; stars: number; text: string }[]
  /** FAQ items for the product detail page accordion. */
  faq?: { q: string; a: string; order: number }[]
  /** Delivery trust cards shown below the gallery. */
  trustCards?: { icon: string; title: string; description: string }[]
  createdAt: Date
}

export interface ProductTab {
  label: string
  content: string
  order: number
  /** Optional help banner shown inside the tab content */
  helpBanner?: {
    text: string
    textColor: string
    bgColor: string
  }
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
  deliveryStatus: 'pending' | 'processing' | 'shipped' | 'delivered'
  deliveryDate?: string
  trackingNotes?: string
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
  demoVideoLabel: 'Watch Demo',
  howToUseVideo:
    process.env.HOW_TO_USE_VIDEO_URL ||
    'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/database_demo-video-audio-1080p.mp4',
  rating: 5,
  description:
    '<h2 class="desc-title">PAN INDIA UPDATED DATABASE 2.0</h2>\n' +
    '<h3>Product Description</h3>\n' +
    '<p>Boost your marketing success with our powerful and extensively curated PAN INDIA UPDATED DATABASE. Ideal for B2B, B2C, and niche targeting, this resource empowers your sales and outreach campaigns with unmatched accuracy and coverage.</p>\n' +
    '<h3>Key Features:</h3>\n' +
    '<ul>\n' +
    '<li>Access to thousands of verified, active contacts, including:\n' +
    '<ul>\n' +
    '<li>Entrepreneurs &amp; Business Owners</li>\n' +
    '<li>CEOs, CMOs, CFOs, Directors</li>\n' +
    '<li>Government Officials</li>\n' +
    '<li>Students, Job Seekers, and Working Professionals</li>\n' +
    '</ul>\n' +
    '</li>\n' +
    '<li>Coverage of 40+ Industries</li>\n' +
    '<li>Nationwide Reach Across PAN India</li>\n' +
    '<li>Highly Accurate &amp; Regularly Updated</li>\n' +
    '<li>Available in CSV, Excel, and PDF formats</li>\n' +
    '<li>Suitable for Email, SMS, WhatsApp, and Direct Marketing Campaigns</li>\n' +
    '</ul>\n' +
    '<h3>Categories Covered:</h3>\n' +
    '<p>Startups, SMEs, MSMEs, Retailers, Importers, Exporters, Event Planners, Marketing Firms, CA/CS, Doctors, Architects, Builders, Real Estate Agents, Educators, Pharma Companies, Freelancers, Consultants, E-commerce Sellers, and more.</p>\n' +
    '<h3>Data Format:</h3>\n' +
    '<p>CSV, PDF, XLS - Easily compatible with your CRM or email tools</p>\n' +
    '<h3>Use Case:</h3>\n' +
    '<p>Ideal for Email Marketing, SMS/WhatsApp Campaigns, Lead Generation, Cold Outreach, B2B Sales, Freelancing, and Direct Business Engagements</p>\n' +
    '<h3>Why Choose Us?</h3>\n' +
    '<ul>\n' +
    '<li>Reliable Data: Verified and up-to-date contacts</li>\n' +
    '<li>Instant Delivery: Download immediately after purchase</li>\n' +
    '<li>Cost-Effective</li>\n' +
    '<li>24x7 Customer Support</li>\n' +
    '</ul>\n' +
    '<h3>Who Can Benefit?</h3>\n' +
    '<p>Perfect for Startups, Entrepreneurs, Freelancers, Sales Professionals, Marketing Agencies, and Business Development Teams</p>\n' +
    '<h3>What\'s Included:</h3>\n' +
    '<ul>\n' +
    '<li><strong>Business Contacts:</strong> Name, Company, Role, Industry, Email, Phone, City</li>\n' +
    '<li><strong>Consumer Data:</strong> Name, Age, Gender, Email, Phone, City</li>\n' +
    '<li><strong>Professional Segments:</strong> CA, Doctors, Architects, Builders, etc.</li>\n' +
    '<li><strong>Student Leads:</strong> Exam Aspirants, Course Enquiries</li>\n' +
    '<li><strong>Geographic Details:</strong> Region-wise segmentation</li>\n' +
    '</ul>\n' +
    '<div class="sale-banner" style="background:rgba(79,70,229,0.1);color:#312E81;padding:10px;text-align:center;font-size:20px;font-weight:bold;border-radius:4px;margin-top:1.5rem;">LIMITED TIME OFFER - SALE ENDS TODAY \u23f3</div>\n' +
    '<div style="text-align:center;margin-top:20px;">\n' +
    '<a href="/digital-products/pan-india-updated-database-2020-2025" style="display:inline-block;background:#4F46E5;color:#fff;font-size:20px;font-weight:bold;text-decoration:none;padding:14px 28px;border-radius:6px;box-shadow:0 4px 10px rgba(0,0,0,0.2);">\u2b07\ufe0f Get Instant Access To Database at \u20b9299</a>\n' +
    '</div>\n' +
    '<h3>Testimonials</h3>\n' +
    '<div style="display:flex;flex-direction:column;gap:20px;max-width:600px;margin:1rem auto 0;">\n' +
    '<div style="display:flex;gap:15px;border:1px solid #eee;border-radius:10px;padding:15px;align-items:center;background:#fff;">\n' +
    '<img src="https://www.digisharkscommunications.com/wp-content/uploads/2025/07/69.jpg" alt="" style="width:60px;height:60px;border-radius:50%;object-fit:cover;flex-shrink:0;" />\n' +
    '<div><div style="color:#fbc02d;font-size:20px;line-height:1;">\u2605\u2605\u2605\u2605\u2605</div>\n' +
    '<p style="margin:5px 0;color:#2b2b2b;">Incredible results! I received over 100 quality B2B leads in just 48 hours. Truly worth the investment.</p>\n' +
    '<strong>Amit Khurana</strong></div></div>\n' +
    '<div style="display:flex;gap:15px;border:1px solid #eee;border-radius:10px;padding:15px;align-items:center;background:#fff;">\n' +
    '<img src="https://www.digisharkscommunications.com/wp-content/uploads/2025/07/15.jpg" alt="" style="width:60px;height:60px;border-radius:50%;object-fit:cover;flex-shrink:0;" />\n' +
    '<div><div style="color:#fbc02d;font-size:20px;line-height:1;">\u2605\u2605\u2605\u2605\u2605</div>\n' +
    '<p style="margin:5px 0;color:#2b2b2b;">The data is super clean and 100% verified. It helped me triple my ROI on Instagram ad campaigns.</p>\n' +
    '<strong>Neha Verma</strong></div></div>\n' +
    '<div style="display:flex;gap:15px;border:1px solid #eee;border-radius:10px;padding:15px;align-items:center;background:#fff;">\n' +
    '<img src="https://randomuser.me/api/portraits/men/65.jpg" alt="" style="width:60px;height:60px;border-radius:50%;object-fit:cover;flex-shrink:0;" />\n' +
    '<div><div style="color:#fbc02d;font-size:20px;line-height:1;">\u2605\u2605\u2605\u2605\u2605</div>\n' +
    '<p style="margin:5px 0;color:#2b2b2b;">Kudos to the team! They delivered exactly what they promised. Having 145+ categories is a huge advantage.</p>\n' +
    '<strong>Sachin Mehta</strong></div></div>\n' +
    '<div style="display:flex;gap:15px;border:1px solid #eee;border-radius:10px;padding:15px;align-items:center;background:#fff;">\n' +
    '<img src="https://randomuser.me/api/portraits/women/12.jpg" alt="" style="width:60px;height:60px;border-radius:50%;object-fit:cover;flex-shrink:0;" />\n' +
    '<div><div style="color:#fbc02d;font-size:20px;line-height:1;">\u2605\u2605\u2605\u2605\u2605</div>\n' +
    '<p style="margin:5px 0;color:#2b2b2b;">Perfect tool for nationwide outreach. Got access to both student and business data, neatly organized and easy to use.</p>\n' +
    '<strong>Kavita Iyer</strong></div></div>\n' +
    '</div>\n' +
    '<h3>Frequently Asked Questions:</h3>\n' +
    '<div style="background:#f6f6f6;padding:1.25rem;border-radius:8px;margin-top:1rem;">\n' +
    '<p style="margin:0 0 0.9rem;"><strong>When will I receive my product?</strong><br/>You\'ll get instant access to download the database right after your payment. A copy will also be sent to your email.</p>\n' +
    '<p style="margin:0 0 0.9rem;"><strong>What if I need help or have questions?</strong><br/>Our support team is always available via email to assist you.</p>\n' +
    '<p style="margin:0 0 0.9rem;"><strong>How long do I have access to the database?</strong><br/>Lifetime access, including free future updates.</p>\n' +
    '<p style="margin:0 0 0;"><strong>Are there any hidden charges or subscriptions?</strong><br/>No. You pay once and get full access - no recurring fees.</p>\n' +
    '</div>\n' +
    '<div style="text-align:center;margin-top:1rem;font-size:16px;background:#ffeb3b;color:#000;padding:10px;border-radius:4px;">\n' +
    'If you have any query regarding our product, please mail us at <a href="mailto:marketing@digisharkscommunications.com" style="color:#000;font-weight:bold;text-decoration:underline;">marketing@digisharkscommunications.com</a>\n' +
    '</div>',
  isActive: true,
  downloadUrl:
    process.env.DATABASE_DOWNLOAD_URL ||
    'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/Database-pqv5hy-bw-iv1bgt-1.pdf',
  downloadPath: process.env.DATABASE_FILE_PATH || '',
  trustCards: [
    { icon: '⚡', title: 'Instant Download', description: 'Access immediately after payment' },
    { icon: '📧', title: 'Email Delivery', description: 'Copy sent to your inbox' },
    { icon: '🔄', title: 'Lifetime Updates', description: 'Free future updates included' },
  ],
  tabs: [
    {
      label: 'Return Policy',
      content:
        '<h3>7-Day Refund Guarantee</h3>\n' +
        '<p>We stand behind the quality of our products. If the database is defective or doesn\'t match the description, you are eligible for a full refund within <strong>7 days</strong> of purchase.</p>\n' +
        '<h3>Conditions</h3>\n' +
        '<ul>\n' +
        '<li>Refund requests must be submitted within 7 days of the purchase date.</li>\n' +
        '<li>The product must not have been downloaded in full (limited preview use only).</li>\n' +
        '<li>Refunds are not issued for change of mind — only for genuine defects or mismatches vs. the product description.</li>\n' +
        '</ul>\n' +
        '<h3>How to Request a Refund</h3>\n' +
        '<p>Email us at <a href="mailto:marketing@digisharkscommunications.com">marketing@digisharkscommunications.com</a> with your order number and a brief description of the issue. Our team will review and process your request within 48 business hours.</p>\n' +
        '<p style="margin-top:1rem;padding:0.75rem;background:#fef3c7;border-radius:6px;border-left:4px solid #f59e0b;"><strong>Note:</strong> Since this is a digital product, all sales are final after the 7-day refund window. Please review the product description carefully before purchasing.</p>',
      order: 0,
    },
    {
      label: 'Delivery Info',
      content:
        '<h3>Instant Digital Delivery</h3>\n' +
        '<p>This is a <strong>digital product</strong> — no physical shipping required. Here\'s how delivery works:</p>\n' +
        '<ul>\n' +
        '<li><strong>Instant Download:</strong> Immediately after your payment is confirmed, you\'ll be redirected to the download page where you can access the database right away.</li>\n' +
        '<li><strong>Email Delivery:</strong> A copy of the download link and instructions will also be sent to your registered email address within minutes of purchase.</li>\n' +
        '<li><strong>Lifetime Updates:</strong> All future updates and revisions to the database are included at no extra cost. We\'ll notify you when new data is available.</li>\n' +
        '</ul>\n' +
        '<h3>Supported Formats</h3>\n' +
        '<p>The database is delivered in <strong>CSV, Excel (XLS), and PDF</strong> formats — compatible with all major CRM, email marketing, and spreadsheet tools.</p>\n' +
        '<h3>What You\'ll Receive</h3>\n' +
        '<ul>\n' +
        '<li>Download link (valid for 30 days)</li>\n' +
        '<li>Email with full instructions</li>\n' +
        '<li>Free lifetime updates</li>\n' +
        '<li>24x7 customer support</li>\n' +
        '</ul>\n' +
        '<p style="margin-top:1rem;padding:0.75rem;background:#dbeafe;border-radius:6px;border-left:4px solid #3b82f6;"><strong>Need help?</strong> Contact us at <a href="mailto:marketing@digisharkscommunications.com">marketing@digisharkscommunications.com</a> — we\'re here 24x7 to assist.</p>',
      order: 1,
    },
  ],
  faq: [
    { q: 'When will I receive my product?', a: 'You\'ll get instant access to download your product right after your payment. A confirmation email with download instructions is also sent to your registered email within minutes.', order: 0 },
    { q: 'How long do I have access to the product?', a: 'Lifetime access — including all future updates and revisions at no extra cost. The download link remains active for 30 days.', order: 1 },
    { q: 'What if I need help using the product?', a: 'Our support team is available via email at marketing@digisharkscommunications.com. We typically respond within 24 hours on business days.', order: 2 },
    { q: 'Are there any hidden charges or subscriptions?', a: 'No. You pay once and get full access — no recurring fees, no hidden charges. All taxes are included in the displayed price.', order: 3 },
    { q: 'Can I get a refund if I\'m not satisfied?', a: 'Yes! We offer a 7-day refund guarantee if the product is defective or doesn\'t match the description. See our Refund Policy for full details.', order: 4 },
  ],
  testimonials: [
    { name: 'Amit Khurana', stars: 5, text: 'Incredible results! I received over 100 quality B2B leads in just 48 hours. Truly worth the investment.' },
    { name: 'Neha Verma', stars: 5, text: 'The data is super clean and 100% verified. It helped me triple my ROI on Instagram ad campaigns.' },
    { name: 'Sachin Mehta', stars: 5, text: 'Kudos to the team! They delivered exactly what they promised. Having 145+ categories is a huge advantage.' },
    { name: 'Kavita Iyer', stars: 5, text: 'Perfect tool for nationwide outreach. Got access to both student and business data, neatly organized and easy to use.' },
  ],
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

