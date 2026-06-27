/**
 * Fix outdated/wrong contact info in the chatbot Q&A database.
 *
 * The natural-phrasings seed contained wrong contact details:
 *   ❌ Phone: +91 9999447827 → +91 96273 32332
 *   ❌ Email: info@digisharks.com → marketing@digisharkscommunications.com
 *   ❌ Address: Dwarka → Noida
 *
 * This script updates any existing entries with the wrong info.
 *
 * Usage: node scripts/fix-chatbot-contact.mjs
 */

import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'

async function main() {
  // Read MONGODB_URI from .env.local
  const envPath = path.resolve('.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const uriLine = envContent.split('\n').find(l => l.startsWith('MONGODB_URI='))
  if (!uriLine) {
    console.error('MONGODB_URI not found in .env.local')
    process.exit(1)
  }
  const MONGODB_URI = uriLine.split('=').slice(1).join('=').trim()

  await mongoose.connect(MONGODB_URI)

  const collection = mongoose.connection.db.collection('chatbotqas')

  // Find entries with wrong phone number, wrong email, or wrong address
  const wrongPhone = await collection.find({ answer: /9999447827/ }).toArray()
  const wrongEmail = await collection.find({ answer: /info@digisharks\.com/ }).toArray()
  const wrongAddress = await collection.find({ answer: /403 CL House.*Dwarka/ }).toArray()

  const allWrong = new Map()
  for (const doc of [...wrongPhone, ...wrongEmail, ...wrongAddress]) {
    allWrong.set(doc._id.toString(), doc)
  }

  console.log(`\nFound ${allWrong.size} entries with wrong contact info:\n`)

  for (const [id, doc] of allWrong) {
    console.log(`  - ${doc.question}`)
    console.log(`    Answer snippet: ${doc.answer.substring(0, 100)}...`)
  }

  if (allWrong.size === 0) {
    console.log('✅ No wrong entries found. Database is clean!')
    await mongoose.disconnect()
    process.exit(0)
  }

  // Update: replace wrong phone, email, and address with correct values
  let updated = 0
  for (const [id, doc] of allWrong) {
    let newAnswer = doc.answer
      .replace(/\+91\s*9999447827/g, '+91 96273 32332')
      .replace(/info@digisharks\.com/gi, 'marketing@digisharkscommunications.com')
      .replace(/403 CL House, Plot No 10, Sector 11, Dwarka, New Delhi - 110075/g, 'B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301')
      .replace(/403 CL House, Plot No 10, Sector 11, Dwarka, New Delhi \u2013 110075/g, 'B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301')
      .replace(/Dwarka, New Delhi/g, 'Noida, Uttar Pradesh')

    if (newAnswer !== doc.answer) {
      await collection.updateOne({ _id: doc._id }, { $set: { answer: newAnswer } })
      updated++
      console.log(`  ✅ Updated: ${doc.question}`)
    }
  }

  console.log(`\n✅ Done! Updated ${updated} of ${allWrong.size} entries.`)

  // Verify by re-reading updated entries
  const verify = await collection.find({ answer: /9999447827/ }).toArray()
  const verifyEmail = await collection.find({ answer: /info@digisharks\.com/ }).toArray()
  if (verify.length > 0 || verifyEmail.length > 0) {
    console.log(`⚠️  Warning: ${verify.length + verifyEmail.length} entries still have outdated info after update.`)
  } else {
    console.log('✅ Verification passed: no remaining outdated entries.')
  }

  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('Fix script failed:', err)
  process.exit(1)
})
