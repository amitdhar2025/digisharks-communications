/**
 * Seed script — creates categories, tags, and 6 sample blog articles.
 *
 * Usage:
 *   1. Set environment variables:
 *      MONGODB_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *   2. Run: node scripts/seed-blog.mjs
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required')
  process.exit(1)
}

// ─── Schemas (minimal inline schemas so we don't need to import from src) ───

const ImageInfoSchema = new mongoose.Schema(
  { url: String, publicId: String, alt: String, width: Number, height: Number },
  { _id: false }
)

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#E0436F' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const TagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  content: { type: String, required: true },
  excerpt: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  featuredImage: { type: ImageInfoSchema, default: null },
  bannerImage: { type: ImageInfoSchema, default: null },
  videoUrl: { type: String, default: '' },
  author: { type: String, default: 'Digisharks Team' },
  authorImage: { type: String, default: '' },
  authorBio: { type: String, default: '' },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  status: { type: String, default: 'published' },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  publishedAt: { type: Date },
  views: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  readingTime: { type: Number, default: 0 },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  seoKeywords: [{ type: String }],
}, { timestamps: true })

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)
const Tag = mongoose.models.Tag || mongoose.model('Tag', TagSchema)
const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema)

// ─── Helpers ───

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function readingTime(content) {
  return Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 250))
}

function wrapContent(headings, paragraphs) {
  let html = ''
  for (const h of headings) {
    html += `<h2>${h}</h2>\n`
    const para = paragraphs[Math.floor(Math.random() * paragraphs.length)]
    html += `<p>${para}</p>\n`
    // Add a random image
    const imgSeed = Math.floor(Math.random() * 100)
    html += `<img src="https://picsum.photos/seed/${imgSeed}/800/400" alt="${h}" loading="lazy" />\n`
    html += `<p>${para.slice(0, 100)}... Continued analysis shows that this trend has significant implications for the Indian economy and global markets alike. Experts suggest that stakeholders should closely monitor these developments and adapt their strategies accordingly.</p>\n`
  }
  // Add a blockquote
  html += `<blockquote>"The data clearly indicates a paradigm shift in how industries operate. Those who adapt will thrive; those who don't will be left behind." — Industry Expert</blockquote>\n`
  html += `<p>${paragraphs[0]}</p>\n`
  html += `<ul><li>Key insight: This trend is reshaping the landscape</li><li>Actionable strategy: Stay informed and diversify</li><li>Future outlook: Continued growth expected through 2027</li></ul>\n`
  html += `<p>In conclusion, this is just the beginning of a larger transformation. Stakeholders across all sectors need to prepare for the changes ahead and embrace innovation at every level of their operations.</p>\n`
  return html
}

// ─── Seed Data ───

const categories = [
  { name: 'Finance', color: '#059669' },
  { name: 'Health', color: '#DC2626' },
  { name: 'Technology', color: '#2563EB' },
  { name: 'Career', color: '#7C3AED' },
  { name: 'Education', color: '#D97706' },
  { name: 'Business', color: '#0891B2' },
]

const tags = [
  'gst', 'gold-investment', 'tax', 'savings', 'mutual-funds',
  'health-tips', 'monsoon', 'immunity', 'wellness', 'fitness',
  'career-advice', 'job-search', 'interview', 'resume', 'skills',
  'technology', 'ai', 'cybersecurity', 'blockchain', '5g',
  'education', 'online-learning', 'digital-india', 'skilling', 'edtech',
]

const articles = [
  {
    title: 'GST Changes in India 2026: What Every Business Owner Must Know',
    excerpt: 'The Goods and Services Tax (GST) regime in India has undergone significant changes in 2026. From revised tax slabs to streamlined compliance, here\'s everything you need to know.',
    shortDescription: 'Major GST reforms in 2026 bring new tax slabs, simplified returns, and enhanced compliance measures for Indian businesses.',
    category: 'Finance',
    tags: ['gst', 'tax', 'business'],
    author: 'Rahul Sharma',
    authorBio: 'Rahul Sharma is a financial analyst with over 15 years of experience in Indian tax law and business finance. He regularly contributes to leading business publications.',
    readingTime: 7,
    publishedAt: new Date('2026-06-15'),
    views: 2847,
    comments: 23,
    headings: [
      'Understanding the New GST Slabs for 2026',
      'Simplified Return Filing Process',
      'Impact on Small and Medium Enterprises',
      'Key Compliance Deadlines You Cannot Miss',
      'How to Prepare Your Business for the Changes',
    ],
  },
  {
    title: 'Gold Investment Guide 2026: Smart Ways to Build Your Portfolio',
    excerpt: 'Gold remains one of the most reliable investment options in India. Discover the best strategies for investing in gold in 2026, from digital gold to sovereign bonds.',
    shortDescription: 'A comprehensive guide to gold investment in 2026 covering digital gold, sovereign bonds, ETFs, and physical gold strategies.',
    category: 'Finance',
    tags: ['gold-investment', 'savings', 'mutual-funds'],
    author: 'Priya Patel',
    authorBio: 'Priya Patel is a certified financial planner and investment advisor based in Mumbai. She specializes in precious metals and alternative investments.',
    readingTime: 6,
    publishedAt: new Date('2026-06-01'),
    views: 3120,
    comments: 18,
    headings: [
      'Why Gold Still Matters in 2026',
      'Digital Gold vs Sovereign Gold Bonds',
      'Gold ETFs: The Smart Investor\'s Choice',
      'Physical Gold: Jewellery vs Coins vs Bars',
      'Building a Balanced Gold Portfolio',
    ],
  },
  {
    title: 'Essential Health Tips for Monsoon Season: Stay Fit and Protected',
    excerpt: 'The monsoon season brings joy but also health challenges. Learn how to boost your immunity and stay healthy during the rainy months with these expert tips.',
    shortDescription: 'Expert health advice for the monsoon season including immunity-boosting foods, hygiene practices, and fitness routines.',
    category: 'Health',
    tags: ['health-tips', 'monsoon', 'immunity', 'wellness'],
    author: 'Dr. Neha Gupta',
    authorBio: 'Dr. Neha Gupta is a practicing physician and public health advocate with expertise in seasonal wellness and preventive medicine.',
    readingTime: 5,
    publishedAt: new Date('2026-05-20'),
    views: 4561,
    comments: 31,
    headings: [
      'Common Monsoon Illnesses and Prevention',
      'Boost Your Immunity with These Foods',
      'Safe Exercise During the Rainy Season',
      'Skin and Hair Care in Humid Weather',
      'When to See a Doctor',
    ],
  },
  {
    title: 'Career Advice for Fresh Graduates: Landing Your Dream Job in 2026',
    excerpt: 'The job market in 2026 is competitive but full of opportunities. Here\'s practical career advice for fresh graduates to navigate the job search and build a successful career.',
    shortDescription: 'Practical career guidance for fresh graduates covering resume tips, interview strategies, and navigating the 2026 job market.',
    category: 'Career',
    tags: ['career-advice', 'job-search', 'interview', 'resume'],
    author: 'Arjun Mehta',
    authorBio: 'Arjun Mehta is a career coach and HR professional with experience at top Fortune 500 companies. He has helped over 10,000 professionals advance their careers.',
    readingTime: 8,
    publishedAt: new Date('2026-05-05'),
    views: 5230,
    comments: 45,
    headings: [
      'Understanding the 2026 Job Market Landscape',
      'Crafting a Resume That Gets Noticed',
      'Mastering the Modern Interview Process',
      'Building Skills That Employers Value',
      'Networking Strategies for the Digital Age',
    ],
  },
  {
    title: 'Technology Trends 2026: AI, Cybersecurity, and the Future of Work',
    excerpt: 'From artificial intelligence to quantum computing, the technology landscape is evolving rapidly. Explore the top tech trends that will shape 2026 and beyond.',
    shortDescription: 'Deep dive into the biggest technology trends of 2026 including AI advancements, cybersecurity threats, and the changing nature of work.',
    category: 'Technology',
    tags: ['technology', 'ai', 'cybersecurity', '5g'],
    author: 'Vikram Singh',
    authorBio: 'Vikram Singh is a technology journalist and analyst covering emerging tech trends for over a decade. He has written for leading tech publications worldwide.',
    readingTime: 9,
    publishedAt: new Date('2026-04-20'),
    views: 6789,
    comments: 52,
    headings: [
      'The AI Revolution: Beyond ChatGPT',
      'Cybersecurity in the Age of Digital Transformation',
      'The Rise of Quantum Computing',
      '5G and the Internet of Things',
      'Remote Work Technology: What\'s Next?',
    ],
  },
  {
    title: 'Digital Education Revolution: How Online Learning is Transforming India',
    excerpt: 'Online education in India has grown exponentially. Discover how digital learning platforms are making quality education accessible to millions across the country.',
    shortDescription: 'An in-depth look at how online education platforms are revolutionizing learning in India, from remote villages to urban centers.',
    category: 'Education',
    tags: ['education', 'online-learning', 'digital-india', 'edtech'],
    author: 'Sneha Reddy',
    authorBio: 'Sneha Reddy is an education researcher and edtech consultant working to bridge the digital divide in Indian education. She has advised multiple state governments on digital learning initiatives.',
    readingTime: 7,
    publishedAt: new Date('2026-04-10'),
    views: 3890,
    comments: 29,
    headings: [
      'The Growth of Edtech in India',
      'Bridging the Urban-Rural Digital Divide',
      'Government Initiatives Driving Digital Education',
      'The Role of AI in Personalized Learning',
      'Challenges and Opportunities Ahead',
    ],
  },
]

// ─── Paragraph pool ───

const paragraphPool = [
  'This development marks a significant shift in the industry landscape, with far-reaching implications for stakeholders across the ecosystem. Experts have been closely monitoring these changes and their potential impact on various sectors of the economy.',
  'According to recent studies and market analyses, the adoption rate has surged by over 40% in the past year alone. This trend is expected to continue as more organizations recognize the benefits and competitive advantages offered by these innovations.',
  'Government initiatives and policy reforms have played a crucial role in accelerating this transformation. The regulatory framework has been carefully designed to balance innovation with consumer protection and market stability.',
  'Industry leaders have welcomed these developments, noting that they create new opportunities for growth and collaboration. However, they also emphasize the need for careful planning and strategic implementation.',
  'Consumer response has been overwhelmingly positive, with satisfaction rates exceeding 85% in most surveys. This reflects the growing awareness and acceptance of these changes among the general population.',
  'The economic implications of this shift are substantial, with analysts projecting a market size of over ₹50,000 crore by 2028. This represents a significant opportunity for investors and entrepreneurs alike.',
  'Educational institutions and training centers have begun incorporating these topics into their curricula, ensuring that the next generation of professionals is well-prepared for the evolving landscape.',
  'International comparisons reveal that India is well-positioned to lead in this domain, thanks to its large young population, growing digital infrastructure, and supportive policy environment.',
]

// ─── Main Seed Function ───

async function seed() {
  try {
    console.log('📦 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await Promise.all([
      Category.deleteMany({}),
      Tag.deleteMany({}),
      BlogPost.deleteMany({}),
    ])
    console.log('✅ Existing data cleared')

    // Create categories
    console.log('📁 Creating categories...')
    const createdCategories = await Category.insertMany(
      categories.map((c) => ({
        name: c.name,
        slug: slugify(c.name),
        description: `Articles about ${c.name.toLowerCase()}`,
        color: c.color,
        isActive: true,
      }))
    )
    const categoryMap = {}
    createdCategories.forEach((c) => { categoryMap[c.name] = c._id })
    console.log(`✅ Created ${createdCategories.length} categories`)

    // Create tags
    console.log('🏷️ Creating tags...')
    const createdTags = await Tag.insertMany(
      tags.map((t) => ({
        name: t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug: t,
        isActive: true,
      }))
    )
    const tagMap = {}
    createdTags.forEach((t) => { tagMap[t.slug] = t._id })
    console.log(`✅ Created ${createdTags.length} tags`)

    // Create articles
    console.log('📝 Creating sample articles...')
    const posts = articles.map((article) => {
      const content = wrapContent(article.headings, paragraphPool)
      return {
        title: article.title,
        slug: slugify(article.title),
        content,
        excerpt: article.excerpt,
        shortDescription: article.shortDescription,
        featuredImage: {
          url: `https://picsum.photos/seed/${slugify(article.title)}/1200/630`,
          publicId: `seed/${slugify(article.title)}`,
          alt: article.title,
          width: 1200,
          height: 630,
        },
        author: article.author,
        authorBio: article.authorBio,
        categories: [categoryMap[article.category]],
        tags: article.tags.map((t) => tagMap[t]).filter(Boolean),
        status: 'published',
        isFeatured: article.title === articles[0].title,
        isActive: true,
        publishedAt: article.publishedAt,
        views: article.views,
        comments: article.comments,
        readingTime: article.readingTime,
        seoTitle: article.title,
        seoDescription: article.excerpt,
        seoKeywords: article.tags,
      }
    })

    await BlogPost.insertMany(posts)
    console.log(`✅ Created ${posts.length} sample articles`)
    console.log('\n🎉 Seed complete!')
    console.log('\n--- Categories ---')
    createdCategories.forEach((c) => console.log(`  • ${c.name} (${c.slug})`))
    console.log('\n--- Articles ---')
    posts.forEach((p) => console.log(`  • ${p.title}`))

    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  } catch (err) {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  }
}

seed()
