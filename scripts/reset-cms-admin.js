require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const AdminUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true })

const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema)

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)

  const username = 'admin'
  const password = 'admin123'
  const passwordHash = await bcrypt.hash(password, 10)

  const existing = await AdminUser.findOne({ username })

  if (existing) {
    existing.passwordHash = passwordHash
    await existing.save()
    console.log(`Updated existing admin "${username}" with new password.`)
  } else {
    await AdminUser.create({ username, passwordHash })
    console.log(`Created new admin "${username}".`)
  }

  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
