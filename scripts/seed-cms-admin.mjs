/**
 * CMS Admin User Seed Script
 *
 * Creates the very first admin user in the CMS AdminUser collection.
 * Run this AFTER setting up your .env.local with MONGODB_URI.
 *
 * Usage:
 *   npx tsx scripts/seed-cms-admin.mjs
 *
 * If no username/password arguments are provided, it will prompt you.
 * You can also pass them as environment variables:
 *   CMS_ADMIN_USERNAME=admin CMS_ADMIN_PASSWORD=yourpassword npx tsx scripts/seed-cms-admin.mjs
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import * as readline from 'node:readline'
import { stdin as input, stdout as output } from 'node:process'

// ── Configuration ─────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local')
  console.error('   Make sure your .env.local file has:')
  console.error('   MONGODB_URI=mongodb+srv://...')
  process.exit(1)
}

// ── Helper: prompt for input ─────────────────────────────────────────
function ask(question) {
  const rl = readline.createInterface({ input, output })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  console.log('')
  console.log('╔══════════════════════════════════════════════╗')
  console.log('║     CMS Admin User Seed Script              ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log('')

  // Get username
  let username = process.env.CMS_ADMIN_USERNAME
  if (!username) {
    username = await ask('Enter admin username/email: ')
  }
  username = username.trim().toLowerCase()

  if (!username) {
    console.error('❌ Username is required.')
    process.exit(1)
  }

  // Get password
  let password = process.env.CMS_ADMIN_PASSWORD
  if (!password) {
    password = await ask('Enter admin password (min 6 chars): ')
  }
  password = password.trim()

  if (!password || password.length < 6) {
    console.error('❌ Password must be at least 6 characters.')
    process.exit(1)
  }

  console.log('')
  console.log(`📦 Connecting to MongoDB...`)

  // Connect to MongoDB
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message)
    process.exit(1)
  }

  // Get the AdminUser model (same schema as src/models/AdminUser.js)
  const AdminUserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  })

  const AdminUser =
    mongoose.models.CMSAdminUser ||
    mongoose.model('CMSAdminUser', AdminUserSchema)

  // Check if user already exists
  const existing = await AdminUser.findOne({ username })
  if (existing) {
    console.log(`⚠️  User "${username}" already exists.`)
    const overwrite = await ask('Do you want to reset the password? (y/N): ')
    if (overwrite.toLowerCase() !== 'y') {
      console.log('👋 No changes made.')
      await mongoose.disconnect()
      process.exit(0)
    }

    // Update password
    const passwordHash = await bcrypt.hash(password, 12)
    await AdminUser.updateOne(
      { username },
      { $set: { passwordHash } }
    )
    console.log(`✅ Password updated for "${username}"`)
  } else {
    // Create new user
    const passwordHash = await bcrypt.hash(password, 12)
    await AdminUser.create({ username, passwordHash })
    console.log(`✅ Admin user "${username}" created successfully!`)
  }

  console.log('')
  console.log('You can now log in at:')
  console.log('   http://localhost:3000/content/admin/login')
  console.log('')

  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
