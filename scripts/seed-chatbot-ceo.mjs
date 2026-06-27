/**
 * Seed the chatbot Q&A database with CEO / leadership related entries.
 *
 * Usage: node scripts/seed-chatbot-ceo.mjs
 *
 * This adds entries for common phrasings about who the CEO/founder/owner is,
 * so the chatbot returns the correct answer instead of a false positive match.
 */

const CEO_ENTRIES = [
  {
    question: 'Who is the CEO of DigiSharks?',
    answer: 'Vansh Mehra is the Founder & Managing Director of DigiSharks Communications. He has been recognized among India\'s Top 10 CEOs and Top 10 Dynamic Entrepreneurs for his work in digital marketing and political campaign management. Want to connect with him or our team? Contact us at +91 96273 32332 or email marketing@digisharkscommunications.com.',
    category: 'about',
  },
  {
    question: 'Who is the CEO?',
    answer: 'Vansh Mehra is the Founder & Managing Director of DigiSharks Communications. He has been recognized among India\'s Top 10 CEOs and Top 10 Dynamic Entrepreneurs. To connect with our team, call us at +91 96273 32332 or email marketing@digisharkscommunications.com.',
    category: 'about',
  },
  {
    question: 'Who is your CEO?',
    answer: 'Our CEO is Vansh Mehra, Founder & Managing Director of DigiSharks Communications. He has been recognized among India\'s Top 10 CEOs and leads our team with a vision for innovation and measurable results. Get in touch at +91 96273 32332 or marketing@digisharkscommunications.com.',
    category: 'about',
  },
  {
    question: 'who is ceo',
    answer: 'Vansh Mehra is the Founder & Managing Director of DigiSharks Communications. He has been recognized among India\'s Top 10 CEOs (2021-2022) and Top 10 Dynamic Entrepreneurs. For more details or to connect with our team, call +91 96273 32332 or email marketing@digisharkscommunications.com.',
    category: 'about',
  },
  {
    question: 'Who is the owner of DigiSharks?',
    answer: 'Vansh Mehra is the Founder & Managing Director of DigiSharks Communications. He started the company in 2017 and has built it into a full-service PR and digital marketing agency. Contact us at +91 96273 32332 or marketing@digisharkscommunications.com to learn more.',
    category: 'about',
  },
  {
    question: 'Who is the managing director?',
    answer: 'Vansh Mehra is the Founder & Managing Director of DigiSharks Communications. He has been recognized among India\'s Top 10 CEOs and brings extensive experience in digital marketing and political campaign management. To connect with our team, call us at +91 96273 32332.',
    category: 'about',
  },
  {
    question: 'Tell me about your leadership team',
    answer: 'Our leadership team is headed by Vansh Mehra, Founder & Managing Director. Vansh has been recognized among India\'s Top 10 CEOs and Top 10 Dynamic Entrepreneurs. Under his leadership, DigiSharks has grown to serve 500+ clients with a 98% retention rate. Want to speak with our team? Call +91 96273 32332 or email marketing@digisharkscommunications.com.',
    category: 'about',
  },
  {
    question: 'Who runs DigiSharks?',
    answer: 'DigiSharks Communications is led by Vansh Mehra, Founder & Managing Director. He founded the company in 2017 and has grown it into a top AI-powered Digital PR and Digital Marketing Agency. Contact us at +91 96273 32332 or marketing@digisharkscommunications.com.',
    category: 'about',
  },
  {
    question: 'Who is the founder and CEO?',
    answer: 'Vansh Mehra is the Founder & Managing Director of DigiSharks Communications. He is a young and dynamic entrepreneur recognized among India\'s Top 10 CEOs and Top 10 Dynamic Entrepreneurs. To connect with us, call +91 96273 32332 or email marketing@digisharkscommunications.com.',
    category: 'about',
  },
  {
    question: 'Vansh Mehra CEO',
    answer: 'Yes! Vansh Mehra is the Founder & Managing Director of DigiSharks Communications. He has been recognized among India\'s Top 10 CEOs 2021-2022 and Top 10 Dynamic Entrepreneurs. For any inquiries, contact us at +91 96273 32332 or marketing@digisharkscommunications.com.',
    category: 'about',
  },
]

async function seedCEO() {
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
    console.error('❌ MONGODB_URI environment variable is not set.')
    console.error('   Make sure you have a .env.local file with MONGODB_URI defined.')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

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

    for (const entry of CEO_ENTRIES) {
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

    console.log(`\n📊 Summary: ${inserted} inserted, ${skipped} skipped, ${CEO_ENTRIES.length} total`)
    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  } catch (err) {
    console.error('❌ Error seeding CEO Q&A:', err)
    process.exit(1)
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

seedCEO()
