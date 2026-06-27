// Seed greetings: hi, hello, hey, hii — common ways visitors start a chat
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digisharks'

const greetings = [
  { question: 'hi', answer: 'Hello! 👋 Welcome to DigiSharks Communications. How can we help you today? For assistance, you can call us at +91 96273 32332 or email marketing@digisharkscommunications.com.', category: 'greeting' },
  { question: 'hello', answer: 'Hi there! 👋 Thanks for reaching out to DigiSharks. How can we assist you today? Feel free to call us at +91 96273 32332 or visit our Contact page for more details.', category: 'greeting' },
  { question: 'hey', answer: 'Hey! 👋 Welcome to DigiSharks Communications. Looking for PR, digital marketing, or web development services? Let us know how we can help!', category: 'greeting' },
  { question: 'hii', answer: 'Hello! 👋 Great to have you here at DigiSharks. How can we assist you today? You can also call us directly at +91 96273 32332.', category: 'greeting' },
  { question: 'hi, how are you?', answer: 'We are doing great, thank you! 😊 At DigiSharks Communications, we are excited to help you with your PR and Digital Marketing needs. How can we assist you today?', category: 'greeting' },
  { question: 'good morning', answer: 'Good Morning! 🌅 Welcome to DigiSharks Communications. How can we brighten your day? Whether it is PR, SEO, or web development — we are here to help!', category: 'greeting' },
  { question: 'good evening', answer: 'Good Evening! 🌇 Thanks for stopping by DigiSharks Communications. How can we help you with your brand growth journey?', category: 'greeting' },
  { question: 'hey there', answer: 'Hey there! 👋 Welcome to DigiSharks Communications. What can we help you with today? Feel free to explore our services or ask us anything!', category: 'greeting' },
  { question: 'are you there?', answer: 'Yes, we are here! 👋 DigiSharks Communications support is ready to help you. How can we assist you with your PR, marketing, or digital needs today?', category: 'greeting' },
  { question: 'hello DigiSharks', answer: 'Hello! 👋 Welcome to DigiSharks Communications. We are a top AI-powered Digital PR and Digital Marketing Agency. How can we help you grow your brand today?', category: 'greeting' },
]

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const collection = mongoose.connection.db.collection('chatbotqas')
    let inserted = 0
    let skipped = 0

    for (const g of greetings) {
      const existing = await collection.findOne({ question: { $regex: `^${g.question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } })
      if (existing) {
        console.log(`  SKIP — "${g.question}" already exists (id: ${existing._id})`)
        skipped++
        continue
      }
      await collection.insertOne({
        question: g.question,
        answer: g.answer,
        category: g.category,
        isActive: true,
        hitCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log(`  INSERT — "${g.question}"`)
      inserted++
    }

    console.log(`\nDone! ${inserted} inserted, ${skipped} skipped.`)
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  }
}

seed()
