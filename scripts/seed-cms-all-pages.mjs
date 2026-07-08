/**
 * Seed CMS Page Content — All Remaining Pages
 *
 * Populates all website pages with their current hardcoded content
 * so they're ready to edit from the CMS editor.
 *
 * Pages seeded: Services & Pricing, Brand Promotion, Contact Us,
 * Digital Marketing Agency, Social Media, Web Development,
 * Press Release, Portfolio, Digital Products
 *
 * Usage:
 *   npx tsx scripts/seed-cms-all-pages.mjs
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local')
  process.exit(1)
}

// ═══════════════════════════════════════════════════════════════════════
// SERVICES & PRICING PAGE
// ═══════════════════════════════════════════════════════════════════════
const SERVICES_CONTENT = {
  heroEyebrow: '✦ Top PR Agency in India',
  heroHeading: 'Our <span class="orange-text">Services & Pricing</span>',
  heroDescription: 'Digisharks Communications provides top PR and digital marketing services. We firmly believe in transparency and high-quality standards through contemporary and creative Digital Press Release and digital marketing tactics. We offer a wide range of digital marketing and conventional marketing services including social media services, SEO, Website Design, Political Campaigns, Digital PR, Corporate Events, Road Shows, Award Shows, and Pricing.',
  heroPrimaryCta: { text: 'Get Free Consultation →', href: '/contact-us/' },
  heroSecondaryCta: { text: 'View Pricing', href: '#pricing' },
  pricingLabel: 'Transparent Pricing',
  pricingHeading: 'Choose the Right <span class="orange-text">Growth Package</span>',
  pricingSubtitle: 'Pick a service that aligns with your brand goals. Every plan is built for measurable outcomes, transparent deliverables, and dedicated support.',
  aiToolsLabel: 'AI-Powered Market Edge',
  aiToolsHeading: 'New <span class="orange-text">AI Launch Tools</span> for 2026',
  aiToolsSubtitle: 'Digisharks has launched a suite of AI-powered marketing tools designed to give your brand a competitive edge. From AI content generation to predictive audience targeting — get ahead of the market.',
  aiTools: [
    { icon: '🤖', title: 'AI Content Studio', desc: 'Generate SEO-optimised blogs, press releases, and social media copy in seconds with our proprietary AI engine — trained on 500+ successful campaigns.' },
    { icon: '🎯', title: 'Predictive Audience Targeting', desc: 'Our AI analyses demographic, psychographic, and behavioral data to predict which audience segments will convert — before you spend a rupee on ads.' },
    { icon: '📊', title: 'Real-Time Campaign Dashboard', desc: 'Track every campaign metric in real time with AI-powered insights, anomaly detection, and automated optimization suggestions delivered to your inbox daily.' },
    { icon: '🔍', title: 'AI SEO Auditor', desc: 'Get instant SEO health scores, competitor backlink analysis, and content gap recommendations — all powered by machine learning models updated weekly.' },
    { icon: '📰', title: 'Smart Media Matchmaker', desc: 'Our AI automatically matches your brand story with the right journalists and publications — increasing pitch acceptance rates by up to 3x versus traditional outreach.' },
    { icon: '📈', title: 'AI Performance Optimizer', desc: 'Continuous A/B testing and creative iteration powered by AI — your campaigns improve automatically based on real-time performance data and market trends.' },
  ],
  capabilitiesHeading: 'End-to-End <span class="orange-text">Digital Services</span>',
  capabilitiesSubtitle: 'From strategic PR to performance marketing, design to development — explore the full range of services we offer to help your brand grow with measurable results.',
  ctaHeading: 'Would You Like to <span class="orange-text">Start?</span>',
  ctaDescription: 'Digisharks Communications is known for its high-quality brand promotions. Representing your brand communicates with the world. Our demographic approach is used by Digisharks Communications to help you understand the characteristics of the people who buy your products and services. By leads, you can see who buys your products and services — also you can see who your brand appeals to the most by age, location, gender, job title, income, and hundreds of other variables. With the right PR agency by your side, growth becomes measurable and consistent.',
  ctaPrimaryCta: { text: 'Apply for PR →', href: '/contact-us/' },
  ctaSecondaryCta: { text: 'Talk to an Expert', href: '#' },
}

// ═══════════════════════════════════════════════════════════════════════
// BRAND PROMOTION PAGE
// ═══════════════════════════════════════════════════════════════════════
const BRAND_PROMOTION_CONTENT = {
  heroEyebrow: '✦ Build a Brand Customers Trust',
  heroHeading: 'Strategic <span class="orange-text">Brand Promotion</span> That Stands Out',
  heroDescription: 'In today\'s competitive market, brand recognition is everything. We help you cut through the noise with brand promotion strategies that combine creativity, market research, digital marketing, and public relations.',
  heroPrimaryCta: { text: 'Promote Your Brand Today →', href: '/contact-us/' },
  heroSecondaryCta: { text: 'Our Process', href: '#process' },
  approachLabel: 'Brand Promotion Experts',
  approachHeading: 'A <span class="orange-text">360-Degree Approach</span>',
  approachSubtitle: 'Great brands are built at the intersection of creativity, data, and storytelling. We bring all three together for every client engagement.',
  approachCards: [
    { icon: '🎨', title: 'Creativity', desc: 'Award-winning creative work that captures attention and stays in memory.' },
    { icon: '📊', title: 'Market Research', desc: 'Deep audience, competitor, and category research that informs every move.' },
    { icon: '💻', title: 'Digital Marketing', desc: 'Performance media, content, and SEO to amplify your brand across every channel.' },
    { icon: '📰', title: 'Public Relations', desc: 'Strategic media outreach that earns third-party validation and trust.' },
  ],
  servicesHeading: 'Our Brand Promotion Services',
  servicesSubtitle: 'Whether you\'re launching a new brand or reinvigorating an established one, our services scale to fit.',
  benefitsHeading: 'Why <span class="orange-text">Brand Promotion</span> Matters',
  benefits: [
    { icon: '🌟', title: 'Increase Brand Awareness', desc: 'Get your brand in front of more of the right people, more often.' },
    { icon: '❤️', title: 'Build Customer Trust', desc: 'Consistent, authentic promotion earns long-term customer loyalty.' },
    { icon: '📈', title: 'Improve Market Position', desc: 'Stand out from competitors and own your category narrative.' },
    { icon: '📥', title: 'Generate More Leads', desc: 'Strong brands convert more visitors into qualified leads and sales.' },
    { icon: '🔁', title: 'Strengthen Customer Loyalty', desc: 'Promoted brands earn repeat business and word-of-mouth referrals.' },
    { icon: '⚡', title: 'Boost Brand Recognition', desc: 'Stand out in crowded markets with a distinctive, memorable brand identity.' },
  ],
  processHeading: 'Our <span class="orange-text">Brand Promotion Process</span>',
  processSubtitle: 'A proven five-step framework for building, executing, and optimizing brand promotion campaigns that deliver.',
  processSteps: [
    { icon: '1', title: 'Brand Analysis', desc: 'Deep research into your brand, audience, competitors, and market positioning.' },
    { icon: '2', title: 'Strategy Development', desc: 'Custom strategy built around your goals, audience, and budget.' },
    { icon: '3', title: 'Campaign Execution', desc: 'Creative production, media buying, and campaign launch across channels.' },
    { icon: '4', title: 'Performance Monitoring', desc: 'Real-time tracking of every metric that matters to your goals.' },
    { icon: '5', title: 'Optimization', desc: 'Continuous testing and refinement to maximize return on investment.' },
    { icon: '6', title: 'Reporting & Insights', desc: 'Detailed reports with actionable insights to guide your next campaign decisions.' },
  ],
  ctaHeading: 'Get Your <span class="orange-text">Free Brand Promotion</span> Consultation',
  ctaDescription: 'Book a complimentary consultation with our brand promotion experts. We\'ll analyze your brand, identify growth opportunities, and recommend a custom strategy — at zero cost.',
  ctaPrimaryCta: { text: 'Get Free Brand Promotion Consultation →', href: '/contact-us/' },
}

// ═══════════════════════════════════════════════════════════════════════
// CONTACT US PAGE
// ═══════════════════════════════════════════════════════════════════════
const CONTACT_US_CONTENT = {
  heroEyebrow: '📞 Get In Touch',
  heroHeading: 'Let\'s Build Your <span class="orange-text">Next Big Win</span>',
  heroDescription: 'Have a project in mind? Want to scale your brand with data-driven digital PR and marketing? Our team is ready to craft a custom strategy that delivers measurable, compounding growth.',
  heroPrimaryCta: { text: 'Send Us a Message →', href: '#contact-form' },
  heroSecondaryCta: { text: '📞 +91 96273 32332', href: 'tel:+919627332332' },
  contactHeading: 'Three Ways to <span class="orange-text">Connect</span>',
  contactAddress: 'B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301',
  contactPhone: '+91 96273 32332',
  contactEmail: 'marketing@digisharkscommunications.com',
  contactHours: 'Mon–Sat: 10:00 AM – 7:00 PM IST',
  ctaEyebrow: '💼 Let\'s Start a Conversation',
  ctaHeading: 'Ready to <span class="orange-text">Grow With Us</span>?',
  ctaDescription: 'Whether you\'re a startup looking to launch, a growing brand aiming to scale, or an established company seeking fresh digital momentum — we have the expertise, team, and proven strategies to make it happen.',
}

// ═══════════════════════════════════════════════════════════════════════
// DIGITAL MARKETING PAGE
// ═══════════════════════════════════════════════════════════════════════
const DIGITAL_MARKETING_CONTENT = {
  heroEyebrow: '✦ Get Instant Growth Results for Your Business',
  heroHeading: 'India\'s Leading <span class="orange-text">Digital Marketing Agency</span>',
  heroDescription: 'We are a leading digital marketing agency helping brands grow through data-driven strategies, performance media, and high-quality content. Our campaigns are designed to deliver measurable ROI and long-term business outcomes.',
  heroPrimaryCta: { text: 'Start Now →', href: '/contact-us/' },
  heroSecondaryCta: { text: 'Explore Services', href: '#services' },
  heroStats: [
    { number: '500+', suffix: '', label: 'Projects Delivered' },
    { number: '50+', suffix: '', label: 'Media Partners' },
    { number: '98%', suffix: '', label: 'Client Satisfaction' },
    { number: '10+', suffix: '', label: 'Years of Experience' },
  ],
}

// ═══════════════════════════════════════════════════════════════════════
// SOCIAL MEDIA PAGE
// ═══════════════════════════════════════════════════════════════════════
const SOCIAL_MEDIA_CONTENT = {
  heroEyebrow: '✦ Get Instant Growth Results for Your Business',
  heroHeading: 'Social Media Marketing <span class="orange-text">That Scales Brands</span>',
  heroDescription: 'Our Social Media Experts build engaged communities, scroll-stopping content, and performance-driven campaigns that turn followers into customers — across every platform that matters.',
  heroPrimaryCta: { text: 'Start Now →', href: '/contact-us/' },
  heroSecondaryCta: { text: 'Explore Services', href: '#services' },
}

// ═══════════════════════════════════════════════════════════════════════
// WEB DEVELOPMENT PAGE
// ═══════════════════════════════════════════════════════════════════════
const WEB_DEV_CONTENT = {
  heroEyebrow: '✦ Web Development Company in India',
  heroHeading: 'Build a Powerful <span class="orange-text">Digital Presence</span> for Your Business',
  heroDescription: 'We design and develop modern, responsive, conversion-focused websites that look great, load fast, and turn visitors into customers. From business sites to complex e-commerce platforms — we build for performance.',
  heroPrimaryCta: { text: 'Get Started Today →', href: '/contact-us/' },
  heroSecondaryCta: { text: 'Explore Services', href: '#services' },
}

// ═══════════════════════════════════════════════════════════════════════
// PRESS RELEASE PAGE
// ═══════════════════════════════════════════════════════════════════════
const PRESS_RELEASE_CONTENT = {
  heroEyebrow: '✦ One of India\'s Most Trusted PR Agencies',
  heroHeading: 'Digital PR & <span class="orange-text">Press Release</span> Services',
  heroDescription: 'Build a powerful digital presence through strategic media house partnerships. We craft compelling brand stories, distribute them across India\'s leading publications, and amplify your message to the audiences that matter most.',
  heroPrimaryCta: { text: 'Apply for PR →', href: '/contact-us/' },
  heroSecondaryCta: { text: 'View Pricing', href: '/services-top-pr-digital-marketing/' },
}

// ═══════════════════════════════════════════════════════════════════════
// PORTFOLIO PAGE
// ═══════════════════════════════════════════════════════════════════════
const PORTFOLIO_CONTENT = {
  heroEyebrow: '#1 Rated PR & Digital Marketing Agency',
  heroHeading: 'Top PR Agency <span style="color: var(--color-orange)">in India</span>',
  heroSubtitle: 'Get instant growth results for your business.',
  heroDescription: 'Digisharks Communications is one of the top PR agencies in India — we provide the best quality services through creative and innovative ideas.',
  heroPrimaryCta: { text: 'Start Now →', href: '/contact-us' },
  heroSecondaryCta: { text: '📞 Get a Free Consultation', href: '/contact-us' },
  aboutLabel: 'About Us',
  aboutHeading: 'Why <span class="orange-text">Digisharks Communications</span>',
  aboutDescription: 'Digisharks Communications is known for high-quality brand promotions and representing your brand to the world. We help you understand who buys your products and services — by age, location, gender, job title, income, and more — so you spend your marketing on your most enthusiastic customers.',
  aboutCta: { text: 'Apply for PR →', href: '/contact-us' },
  teamLabel: 'Our Team',
  teamHeading: 'Meet Our <span class="orange-text">Professionals</span>',
  teamIntro: 'Our team is highly professional and experienced. A skilled digital marketing and PR team that drives brand visibility, engagement, and conversions through compelling storytelling, media relations, SEO, and strategic campaigns that deliver measurable results.',
  portfolioLabel: 'Our Portfolio',
  portfolioHeading: 'Work That <span class="orange-text">Speaks Volumes</span>',
  portfolioDescription: 'A showcase of our award-winning projects and campaigns that have made an impact.',
  portfolioCta: { text: 'Start Your Project →', href: '/contact-us' },
  clientsLabel: 'Our Clients',
  clientsHeading: 'Trusted by <span class="orange-text">Industry Leaders</span>',
  clients: ['Patanjali', 'Fitlivs', 'PTC Punjab Network', 'Shivanshi Tarot', 'Ascleplus', 'Digisharks'],
  ctaEyebrow: '🚀 Would you like to start?',
  ctaHeading: 'Ready to <span class="orange-text">Transform</span> Your Brand?',
  ctaDescription: 'Let\'s create something extraordinary together. Our team of experts is ready to help you achieve measurable growth and build a brand that stands out.',
  ctaPrimaryCta: { text: 'Contact Us Today →', href: '/contact-us' },
  ctaSecondaryCta: { text: '📞 +91 96273 32332', href: 'tel:+919627332332' },
  mapLabel: 'Find Us',
  mapAddress: 'B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301',
}

// ═══════════════════════════════════════════════════════════════════════
// DIGITAL PRODUCTS PAGE
// ═══════════════════════════════════════════════════════════════════════
const DIGITAL_PRODUCTS_CONTENT = {
  heroEyebrow: '✦ Browse Our Digital Assets',
  heroHeading: 'Digital <span class="orange-text">Products</span>',
  heroDescription: 'Browse verified digital databases and assets from Digisharks Communications. Instant download after secure checkout.',
  heroPrimaryCta: { text: 'Browse Products →', href: '#products' },
  heroSecondaryCta: { text: 'Contact Us', href: '/contact-us' },
}

// ═══════════════════════════════════════════════════════════════════════
// Page definitions
// ═══════════════════════════════════════════════════════════════════════
const PAGES = [
  { slug: 'services-top-pr-digital-marketing', name: 'Services & Pricing', content: SERVICES_CONTENT },
  { slug: 'brand-promotion', name: 'Brand Promotion', content: BRAND_PROMOTION_CONTENT },
  { slug: 'contact-us', name: 'Contact Us', content: CONTACT_US_CONTENT },
  { slug: 'digital-marketing-agency', name: 'Digital Marketing Agency', content: DIGITAL_MARKETING_CONTENT },
  { slug: 'social-media', name: 'Social Media Marketing', content: SOCIAL_MEDIA_CONTENT },
  { slug: 'web-development', name: 'Web Development', content: WEB_DEV_CONTENT },
  { slug: 'press-release', name: 'Press Release', content: PRESS_RELEASE_CONTENT },
  { slug: 'portfolio', name: 'Portfolio', content: PORTFOLIO_CONTENT },
  { slug: 'digital-products', name: 'Digital Products', content: DIGITAL_PRODUCTS_CONTENT },
]

async function main() {
  console.log('')
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║   Seed CMS Page Content — All Remaining Pages     ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log('')

  // Connect to MongoDB
  console.log('📦 Connecting to MongoDB...')
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')
  } catch (err) {
    console.error('❌ Failed to connect:', err.message)
    process.exit(1)
  }

  // Define PageContent schema
  const PageContentSchema = new mongoose.Schema({
    pageSlug: { type: String, required: true, unique: true },
    pageName: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now },
  }, { timestamps: true })

  const PageContent = mongoose.models.PageContent || mongoose.model('PageContent', PageContentSchema)

  let successCount = 0
  let skipCount = 0

  for (const page of PAGES) {
    // Check if content already exists
    const existing = await PageContent.findOne({ pageSlug: page.slug })
    if (existing && existing.content && Object.keys(existing.content).length > 0) {
      console.log(`⏭️  ${page.name} (${page.slug}) — already seeded, skipping`)
      skipCount++
      continue
    }

    const result = await PageContent.findOneAndUpdate(
      { pageSlug: page.slug },
      {
        $set: {
          pageSlug: page.slug,
          pageName: page.name,
          content: page.content,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    )

    console.log(`✅ ${page.name} (${page.slug}) — seeded successfully`)
    successCount++
  }

  console.log('')
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log(`║   ✅ ${successCount} pages seeded  |  ⏭️  ${skipCount} skipped`)
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log('')
  console.log('You can now edit these pages from the CMS:')
  for (const page of PAGES) {
    console.log(`   http://localhost:3000/content/admin/pages/${page.slug}/edit`)
  }
  console.log('')

  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
