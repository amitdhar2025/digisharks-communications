import bcrypt from 'bcryptjs'
import { getAdminsCollection, AdminUser } from './db'

/**
 * Ensures that at least one admin account exists in the database and
 * that its password hash matches the current `ADMIN_PASSWORD` env
 * var. This way the user can always log in with the credentials
 * configured in `.env.local` even if the DB was seeded earlier
 * with a different password.
 */
export async function ensureAdminExists(): Promise<AdminUser | null> {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password) {
    return null
  }

  const admins = await getAdminsCollection()
  const existing = await admins.findOne({ username })

  // Always (re)hash to match the current env password so the user
  // can always log in with the credentials they have in .env.local.
  const passwordHash = await bcrypt.hash(password, 10)

  if (existing) {
    // Keep the existing createdAt, refresh the hash so the
    // configured password always works.
    await admins.updateOne(
      { _id: existing._id },
      { $set: { passwordHash } }
    )
    return { ...existing, passwordHash }
  }

  const newAdmin: AdminUser = {
    username,
    passwordHash,
    createdAt: new Date(),
  }

  await admins.insertOne(newAdmin)
  return newAdmin
}
