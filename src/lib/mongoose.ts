import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

let cached = global._mongooseConn as mongoose.Connection | null

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: mongoose.Connection | undefined
}

export async function connectMongoose(): Promise<typeof mongoose> {
  if (cached) return mongoose

  try {
    await mongoose.connect(MONGODB_URI)
  } catch (err) {
    console.error(
      '[mongoose] Connection failed:',
      err instanceof Error ? err.message : String(err),
    )
    throw err
  }

  cached = mongoose.connection

  cached.on('error', (err) => {
    console.error('[mongoose] Runtime connection error:', err)
  })

  global._mongooseConn = cached
  return mongoose
}

export default connectMongoose
