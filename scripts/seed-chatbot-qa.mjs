/**
 * Seed the chatbot Q&A database with common FAQ entries.
 *
 * Usage: node scripts/seed-chatbot-qa.mjs
 *
 * This will populate the ChatbotQA collection with essential
 * questions and answers about DigiSharks Communications.
 */

// This can also be imported as an API route for on-demand seeding
const FAQ_ENTRIES = [
  // Business Hours
  {
    question: 'What are your business hours?',
    answer: 'We are open Monday to Saturday, 10:00 AM – 7:00 PM IST. We remain closed on Sundays and public holidays.',
    category: 'general',
  },
  {
    question: 'Are you open on weekends?',
    answer: 'We are open on Saturdays from 10:00 AM to 7:00 PM IST. Sundays are closed.',
    category: 'general',
  },
  {
    question: 'What is your holiday schedule?',
    answer: 'We are closed on all major public holidays. Our regular hours are Monday to Saturday, 10:00 AM – 7:00 PM IST.',
    category: 'general',
  },

  // Contact Information
  {
    question: 'How can I contact DigiSharks?',
    answer: 'You can call us at +91 96273 32332 or email us at marketing@digisharkscommunications.com. You can also fill out the contact form on our website and we will get back to you promptly.',
    category: 'contact',
  },
  {
    question: 'What is your phone number?',
    answer: 'You can reach us at +91 96273 32332. We are available during business hours: Monday to Saturday, 10:00 AM – 7:00 PM IST.',
    category: 'contact',
  },
  {
    question: 'What is your email address?',
    answer: 'You can email us at marketing@digisharkscommunications.com. We typically respond within 24 hours during business days.',
    category: 'contact',
  },
  {
    question: 'Where are you located?',
    answer: 'Our office is located at B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301, India.',
    category: 'contact',
  },
  {
    question: 'What is your office address?',
    answer: 'DigiSharks Communications, B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301, India.',
    category: 'contact',
  },

  // About
  {
    question: 'When was DigiSharks established?',
    answer: 'DigiSharks Communications was established in 2017 in New Delhi, India. We are a top AI-powered Digital PR and Digital Marketing Agency.',
    category: 'about',
  },
  {
    question: 'What does DigiSharks do?',
    answer: 'We are a top AI-powered Digital PR and Digital Marketing Agency helping businesses achieve measurable growth through innovative, data-driven strategies. We offer Press Release distribution, Digital Marketing, SEO & PPC, Social Media Management, Web Development, Brand Promotion, and Political Campaign services.',
    category: 'about',
  },
  {
    question: 'Who is the founder of DigiSharks?',
    answer: 'DigiSharks Communications was founded by Vansh. Visit our About Us page for more details about our team and leadership.',
    category: 'about',
  },

  // Services
  {
    question: 'What services do you offer?',
    answer: 'We offer a comprehensive range of services including: Digital PR & Media, SEO & PPC, AI SEO/AEO/GEO, Social Media Management, Web Development, Brand Promotion, Political Campaigns, and more. Visit our Services page for full details.',
    category: 'services',
  },
  {
    question: 'Do you offer SEO services?',
    answer: 'Yes, we offer SEO, PPC, AI SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization) services. Visit our Digital Marketing page for more details.',
    category: 'services',
  },
  {
    question: 'Do you build websites?',
    answer: 'Yes, we offer full-stack Web Development services including e-commerce stores, landing pages, business websites, and custom web applications. Visit our Web Development page for more details.',
    category: 'services',
  },
  {
    question: 'Do you handle social media marketing?',
    answer: 'Yes, we offer Social Media Marketing and management services for Instagram, Facebook, LinkedIn, Twitter, and YouTube. Visit our Social Media page for more details.',
    category: 'services',
  },
  {
    question: 'What is Digital PR?',
    answer: 'Digital PR blends the credibility of traditional public relations with the measurability of online marketing. It involves strategic content placement across high-authority publications to generate brand awareness, stronger search visibility, and lasting reputation.',
    category: 'services',
  },
  {
    question: 'Do you offer press release distribution?',
    answer: 'Yes, we specialize in Press Release distribution across top media publications in India and internationally. Visit our Press Release page for more details.',
    category: 'services',
  },

  // Pricing & Products
  {
    question: 'How much do your services cost?',
    answer: 'Our pricing varies depending on the scope of work and specific requirements. Please contact us at +91 96273 32332 or email marketing@digisharkscommunications.com for a customized quote.',
    category: 'pricing',
  },
  {
    question: 'Do you sell digital products?',
    answer: 'Yes, we offer digital products like the PAN India Updated Database 2020-2025, which includes verified business and consumer contacts across 40+ industries. Visit our Digital Products page for more details.',
    category: 'products',
  },
  {
    question: 'What is the PAN India Database?',
    answer: 'The PAN India Updated Database is a comprehensive collection of verified active contacts including entrepreneurs, business owners, CEOs, government officials, and professionals across 40+ industries. It is available in CSV, Excel, and PDF formats. Price: ₹299 only.',
    category: 'products',
  },

  // General
  {
    question: 'How do I get a quote?',
    answer: 'You can request a quote by calling us at +91 96273 32332, emailing marketing@digisharkscommunications.com, or filling out the contact form on our website. We will get back to you within 24 hours.',
    category: 'general',
  },
  {
    question: 'Which industries do you serve?',
    answer: 'We serve startups, SMEs, MSMEs, e-commerce businesses, political campaigns, educational institutions, healthcare, real estate, and many more industries across India.',
    category: 'general',
  },
  {
    question: 'Do you work with international clients?',
    answer: 'Yes, we work with clients both in India and internationally. Our team has experience serving clients across various geographies and industries.',
    category: 'general',
  },
  {
    question: 'How can I start working with DigiSharks?',
    answer: 'Getting started is easy! Just call us at +91 96273 32332, email marketing@digisharkscommunications.com, or fill out the contact form on our website. We will discuss your requirements and provide a customized solution.',
    category: 'general',
  },
]

async function seedQA() {
  let mongoose
  try {
    // Try loading from project root
    mongoose = (await import('mongoose')).default
  } catch {
    // Try relative path for when script is run from project root
    const path = await import('path')
    const module = await import(path.resolve('node_modules/mongoose'))
    mongoose = module.default
  }

  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set.')
    console.error('   Make sure you have a .env.local file with MONGODB_URI defined.')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Define the schema inline (same as ChatbotQA model)
    const qaSchema = new mongoose.Schema({
      question: { type: String, required: true, trim: true },
      answer: { type: String, required: true, trim: true },
      category: { type: String, default: '', trim: true },
      isActive: { type: Boolean, default: true },
      hitCount: { type: Number, default: 0 },
    }, { timestamps: true })

    const ChatbotQA = mongoose.models.ChatbotQA || mongoose.model('ChatbotQA', qaSchema)

    let inserted = 0
    let skipped = 0

    for (const entry of FAQ_ENTRIES) {
      // Check if a similar question already exists (case-insensitive)
      const existing = await ChatbotQA.findOne({
        question: { $regex: `^${escapeRegex(entry.question)}$`, $options: 'i' },
      })

      if (existing) {
        console.log(`  ⏭  Skipped (exists): "${entry.question}"`)
        skipped++
      } else {
        await ChatbotQA.create({
          question: entry.question,
          answer: entry.answer,
          category: entry.category,
        })
        console.log(`  ✅ Inserted: "${entry.question}"`)
        inserted++
      }
    }

    console.log(`\n📊 Summary: ${inserted} inserted, ${skipped} skipped, ${FAQ_ENTRIES.length} total`)
    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  } catch (err) {
    console.error('❌ Error seeding Q&A:', err)
    process.exit(1)
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

seedQA()
