import mongoose from 'mongoose'
import clientPromise from './mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

/**
 * Reuses the existing MongoClient from mongodb.ts so we don't open
 * duplicate connections. Mongoose's default connection shares the
 * same underlying driver as the native MongoClient.
 */
let cached = global._mongooseConn as mongoose.Connection | null

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: mongoose.Connection | undefined
}

export async function connectMongoose(): Promise<typeof mongoose> {
  if (cached) return mongoose

  // Ensure the native client is connected first
  await clientPromise

  await mongoose.connect(MONGODB_URI)

  cached = mongoose.connection

  cached.on('error', (err) => {
    console.error('Mongoose connection error:', err)
  })

  global._mongooseConn = cached
  return mongoose
}

export default connectMongoose
