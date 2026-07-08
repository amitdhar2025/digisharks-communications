/**
 * Final batch to push over 1000 entries.
 * Usage: node scripts/seed-chatbot-qa-last.mjs
 */

const FAQ_ENTRIES = [
  { question: 'What is retargeting in digital marketing?', answer: 'Retargeting shows ads to people who have previously visited your website but did not convert. It keeps your brand top-of-mind and significantly improves conversion rates from your existing traffic.', category: 'digital-marketing' },
  { question: 'What is the difference between retargeting and remarketing?', answer: 'Retargeting typically refers to display ads shown to website visitors as they browse other sites. Remarketing usually refers to re-engaging past customers through email. The terms are often used interchangeably.', category: 'digital-marketing' },
  { question: 'How does cookie tracking work?', answer: 'Cookies are small text files stored on users browsers that track their browsing activity. They enable personalized content, shopping carts, analytics, and targeted advertising.', category: 'technology' },
  { question: 'What is first-party vs third-party data?', answer: 'First-party data is collected directly from your customers (purchases, website behavior). Third-party data is purchased from external sources. First-party data is more accurate and privacy-compliant.', category: 'data-driven' },
  { question: 'What is zero-party data?', answer: 'Zero-party data is information customers intentionally and proactively share with a brand - preferences, purchase intentions, personal context. It is the most valuable data type for personalization.', category: 'data-driven' },
  { question: 'What is cookieless tracking?', answer: 'Cookieless tracking uses alternative methods like server-side tracking, fingerprinting, and first-party data to measure marketing performance as browsers phase out third-party cookies.', category: 'technology' },
  { question: 'What is Google Privacy Sandbox?', answer: 'Google Privacy Sandbox is an initiative to develop privacy-preserving alternatives to third-party cookies while still enabling effective digital advertising and measurement.', category: 'technology' },
  { question: 'What is server-side tracking?', answer: 'Server-side tracking sends data from your server directly to analytics platforms, bypassing browser limitations. It is more accurate and reliable than client-side tracking.', category: 'technology' },
  { question: 'What is Google Consent Mode?', answer: 'Google Consent Mode adjusts how Google tags behave based on user consent choices. It ensures compliance with privacy regulations like GDPR while still collecting aggregate data.', category: 'technology' },
  { question: 'What is a subdomain?', answer: 'A subdomain is a prefix added to your domain name (like blog.yourwebsite.com). It can host separate sections of your site and is treated as a separate entity by search engines.', category: 'web-development' },
  { question: 'What is a subdirectory?', answer: 'A subdirectory (or subfolder) organizes content under folders on your main domain (like yourwebsite.com/blog). Unlike subdomains, subdirectories share domain authority with the main site.', category: 'web-development' },
  { question: 'Should I use subdomain or subdirectory for my blog?', answer: 'For SEO purposes, subdirectories are generally recommended because they inherit the main domain authority. Subdomains are treated as separate sites by search engines.', category: 'web-development' },

  // CATEGORY: political (gap filler — "election campaign service" was wrongly matching "pause my campaign")
  { question: 'election campaign service', answer: 'We offer comprehensive political campaign services including campaign strategy, booth management, voter outreach, digital communication, and IT cell operations. Our team has managed 500+ booths across multiple election campaigns. Contact us at +91 96273 32332 for a customized consultation.', category: 'political' },
  { question: 'I need election campaign service', answer: 'We offer comprehensive political campaign services including campaign strategy, booth management, voter outreach, digital communication, and IT cell operations. Our team has managed 500+ booths across multiple election campaigns. Contact us at +91 96273 32332 for a customized consultation.', category: 'political' },
]

async function seedQA() {
  let mongoose
  try {
    mongoose = (await import('mongoose')).default
  } catch {
    const path = await import('path')
    const module = await import(path.resolve('node_modules/mongoose'))
    mongoose = module.default
  }

  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const qaSchema = new mongoose.Schema({
      question: String, answer: String, category: String,
      isActive: { type: Boolean, default: true },
      hitCount: { type: Number, default: 0 },
    }, { timestamps: true })
    const ChatbotQA = mongoose.models.ChatbotQA || mongoose.model('ChatbotQA', qaSchema)

    let ins = 0, skip = 0
    for (const entry of FAQ_ENTRIES) {
      const existing = await ChatbotQA.findOne({
        question: { $regex: `^${escapeRegex(entry.question)}$`, $options: 'i' }
      })
      if (existing) { skip++ }
      else { await ChatbotQA.create(entry); ins++ }
    }

    const total = await ChatbotQA.countDocuments({})
    console.log(`This batch: ${ins} inserted, ${skip} skipped`)
    console.log(`FINAL TOTAL in database: ${total}`)
    await mongoose.disconnect()
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

seedQA()
