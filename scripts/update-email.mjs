// Update chatbot Q&A entries: replace old email with new email
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digisharks'

async function run() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  const collection = mongoose.connection.db.collection('chatbotqas')

  // Find all entries with old email
  const candidates = await collection.find({ answer: /info@digisharkscommunications\.com/i }).toArray()
  console.log(`Found ${candidates.length} entries with old email`)

  let updated = 0
  for (const doc of candidates) {
    const newAnswer = doc.answer.replace(/info@digisharkscommunications\.com/gi, 'marketing@digisharkscommunications.com')
    if (newAnswer !== doc.answer) {
      await collection.updateOne({ _id: doc._id }, { $set: { answer: newAnswer } })
      updated++
    }
  }

  console.log(`Updated ${updated} entries`)
  await mongoose.disconnect()
  process.exit(0)
}

run().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
