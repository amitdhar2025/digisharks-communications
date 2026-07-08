/**
 * Seed CMS Page Content — Home
 *
 * Populates the Home page with its current hardcoded content
 * so it's ready to edit from the CMS editor.
 *
 * Usage:
 *   npx tsx scripts/seed-cms-home.mjs
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local')
  process.exit(1)
}

// ── Home DEFAULT_CONTENT (mirrors src/app/page.tsx) ──
const HOME_CONTENT = {
  heroEyebrow: 'AI-Powered Digital Growth',
  heroHeading: '<span class=\"orange-text\">AI-Driven</span><br />for Your Digital Brand',
  heroDescription: 'Digisharks Communications is a next-gen digital PR, marketing, and AI-powered web development agency. We fuse data, design, and AI to help brands achieve measurable growth, top-tier media presence, and 10x ROI across 50+ publications.',
  heroPrimaryCta: { text: 'Get Free Consultation →', href: '#' },
  heroSecondaryCta: { text: 'Our Services', href: '#' },
  heroStats: [
    { number: '500+', suffix: '', label: 'Projects Delivered' },
    { number: '10+', suffix: '', label: 'Years of Experience' },
    { number: '50+', suffix: '', label: 'Media Partners' },
    { number: '98%', suffix: '', label: 'Client Satisfaction' },
  ],
  brandLogosHeading: 'Check Out <span class="orange-text-num">Our Work</span>',
  metricsLabel: 'AI-Powered Insights',
  metricsHeading: 'Real-Time <span class="orange-text">AI Growth Metrics</span>',
  metricsDescription: 'We track everything—visibility, engagement, conversions, AI-driven insights—and show you the numbers that matter in real time.',
  metrics: [
    { icon: '🤖', title: 'AI-Optimised ROI', desc: 'Our AI engine optimises campaigns in real time to deliver ten times the return on your marketing spend.', number: '10x', suffix: '' },
    { icon: '📰', title: 'Brand Stories Published', desc: 'Media features across top-tier publications including Forbes, Inc42, YourStory, and 50+ outlets.', number: '500+', suffix: '' },
    { icon: '🚀', title: 'Average Traffic Growth', desc: 'Websites we manage see a 320% average traffic uplift within the first 6 months of partnership.', number: '320%', suffix: '' },
    { icon: '💎', title: 'Client Retention Rate', desc: 'Our clients stick with us because we consistently deliver measurable, compounding growth.', number: '98%', suffix: '' },
  ],
  awardsLabel: 'Awards and Recognition',
  awardsHeading: 'Awards That Recognise <span class="orange-text">Digital Excellence</span>',
  awardsDescription: 'Our work has been recognised by the worlds most respected platforms — a testament to the results we deliver for our clients.',
  servicesLabel: 'Our Services',
  servicesHeading: 'What We Do <span class="orange-text">Best</span>',
  servicesSubtitle: 'From AI-powered digital PR to full-stack marketing, we deliver end-to-end brand growth solutions that combine creativity, technology, and data-driven insights.',
  services: [
    { icon: '🤖', title: 'AI-Driven Digital PR', desc: 'Strategic media coverage across 50+ top publications in India.' },
    { icon: '📺', title: 'Media Management', desc: 'Brand visibility campaigns with high-impact media collaborations.' },
    { icon: '📈', title: 'AI Digital Marketing', desc: 'Full-stack campaigns from SEO to PPC with measurable ROI.' },
    { icon: '🎯', title: 'Smart Lead Generation', desc: 'High-intent pipelines powered by AI performance marketing.' },
    { icon: '✍️', title: 'AI Content Strategy', desc: 'SEO-optimized blogs, scripts, and brand narratives that convert.' },
    { icon: '🏆', title: 'Political Campaign Mgmt', desc: 'Strategic voter outreach with measurable on-ground impact.' },
  ],
  whyChooseLabel: 'Why Choose Us',
  whyChooseHeading: 'We Deliver <span class="orange-text">Measurable Results</span>',
  whyChooseSubtitle: '10+ years of experience, 500+ successful campaigns, and a team dedicated to your brand growth.',
  whyChooseItems: [
    '100% Transparency in Reporting and Pricing',
    'AI-Powered Campaign Optimization',
    'Dedicated Account Manager for Every Client',
    '50+ Media House Partnerships Across India',
    'Proven 10x ROI Track Record',
    'Free AI Strategy Audit to Get You Started',
  ],
  whyChooseIcons: [
    { icon: '🤖', title: 'AI Strategy' },
    { icon: '📰', title: 'Digital PR' },
    { icon: '📈', title: 'SEO and PPC' },
    { icon: '📱', title: 'Social Media' },
    { icon: '💻', title: 'Web Dev' },
    { icon: '🏆', title: 'Branding' },
  ],
  testimonialsLabel: 'Client Testimonials',
  testimonialsHeading: 'What Our <span class="orange-text">Clients Say</span>',
  testimonialsSubtitle: 'Real reviews from real clients. We measure our success by the growth and satisfaction of the brands we partner with.',
  ctaBadge: '🚀 Let us Build Something Great',
  ctaHeading: 'Start Your <span class="orange-text">AI Growth</span> Journey Today',
  ctaDescription: 'Your customers are online right now. Let us help you reach them with the right message, on the right platform, at the right moment. Do not let competitors take what is yours.',
  ctaFeatures: ['Free Growth Audit', 'AI-Powered Insights', 'Dedicated Manager', 'Transparent Reporting'],
  ctaButton: { text: 'Get Free Consultation →', href: '#' },
  footerTagline: 'Top AI-Powered Digital PR and Digital Marketing Agency helping businesses achieve measurable growth through innovative, data-driven strategies. Established 2017, New Delhi.',
  footerPhone: '+91 96273 32332',
  footerEmail: 'marketing@digisharkscommunications.com',
  footerAddress: 'B-2, C-87, C Block, Sector 63<br />Noida, Uttar Pradesh 201301',
}

async function main() {
  console.log('')
  console.log('╔══════════════════════════════════════════════╗')
  console.log('║      Seed CMS Page Content — Home          ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log('')

  // Connect to MongoDB
  console.log('📦 Connecting to MongoDB...')
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
  } catch (err) {
    console.error('❌ Failed to connect:', err.message)
    process.exit(1)
  }

  // Define PageContent schema (same as src/models/PageContent.js)
  const PageContentSchema = new mongoose.Schema({
    pageSlug: { type: String, required: true, unique: true },
    pageName: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now },
  }, { timestamps: true })

  const PageContent = mongoose.models.PageContent || mongoose.model('PageContent', PageContentSchema)

  // Upsert: update if exists, create if not
  const result = await PageContent.findOneAndUpdate(
    { pageSlug: 'home' },
    {
      $set: {
        pageSlug: 'home',
        pageName: 'Home',
        content: HOME_CONTENT,
        updatedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  )

  console.log(`✅ Home page content seeded successfully!`)
  console.log(`   Page: ${result.pageName} (${result.pageSlug})`)
  console.log(`   ID: ${result._id}`)
  console.log('')
  console.log('You can now edit this content at:')
  console.log('   http://localhost:3000/content/admin/pages/home/edit')
  console.log('')

  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
