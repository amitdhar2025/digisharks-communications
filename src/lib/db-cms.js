/**
 * CMS Database Connection
 *
 * Reuses the cached Mongoose connection from src/lib/mongoose.ts.
 * This avoids creating a new connection pool for the CMS — it shares
 * the same MongoDB Atlas connection as the rest of the app.
 */

import { connectMongoose } from '@/lib/mongoose'

/**
 * Ensures Mongoose is connected and returns the Mongoose instance.
 * Call this at the top of every API route and server component.
 */
export async function connectCMSDb() {
  try {
    const mongoose = await connectMongoose()
    return mongoose
  } catch (err) {
    console.error('[cms-db] Failed to connect:', err)
    throw new Error('Database connection failed')
  }
}
