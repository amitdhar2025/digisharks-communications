import bcrypt from 'bcryptjs'
import { getAdminsCollection, AdminUser } from './db'

/**
 * Ensures that at least one admin account exists in the database,
 * seeded from `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars.
 *
 * **Does NOT re-hash existing admins** — once seeded, the DB password
 * is authoritative. This allows the forgot-password flow to set a new
 * password that won't be overwritten on the next login.
 */
export async function ensureAdminExists(): Promise<AdminUser | null> {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password) {
    return null
  }

  const admins = await getAdminsCollection()

  // Only seed if NO admin user exists in the database at all.
  // If an admin already exists, respect its password (which may
  // have been set by the forgot-password flow).
  const count = await admins.countDocuments()
  if (count > 0) {
    return null
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const newAdmin: AdminUser = {
    username,
    passwordHash,
    createdAt: new Date(),
  }

  await admins.insertOne(newAdmin)
  return newAdmin
}
