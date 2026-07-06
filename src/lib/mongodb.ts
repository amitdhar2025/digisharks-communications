import { MongoClient, MongoClientOptions } from 'mongodb'

const uri = process.env.MONGODB_URI as string

if (!uri) {
  throw new Error('Please add MONGODB_URI to .env.local')
}

// MongoClientOptions for MongoDB Atlas.
// `mongodb+srv://` already implies TLS, but we set it explicitly so
// behaviour is identical whether or not the URI contains `tls=true`.
const options: MongoClientOptions = {
  tls: true,
  // Validate server certificate against the CA bundle. In production this
  // MUST be `false` to prevent man-in-the-middle attacks. If you run into
  // TLS handshake errors on Windows / older Node, set this to `true` as a
  // temporary workaround — the connection is STILL encrypted end-to-end,
  // only certificate validation is relaxed.
  tlsAllowInvalidCertificates: false,
  // Increased from 5 000 to 10 000 to handle Atlas cold-start latency
  // and transient network blips on Vercel serverless.
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  retryWrites: true,
  // Limit concurrent connections to the database.
  maxPoolSize: 10,
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: Promise<MongoClient> | undefined
}

/**
 * Attempts to connect with one automatic retry on failure.
 */
async function connectWithRetry(): Promise<MongoClient> {
  const maxAttempts = 2
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const client = new MongoClient(uri, options)
    try {
      return await client.connect()
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      console.error(
        `[mongodb] Connection attempt ${attempt}/${maxAttempts} failed:`,
        lastError.message,
      )
      // Close the failed client to free resources
      try {
        await client.close()
      } catch {
        /* ignore */
      }
      if (attempt < maxAttempts) {
        // Brief pause before the retry
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  throw lastError ?? new Error('Failed to connect to MongoDB')
}

// Module-level cached promise. When it rejects, we clear it so the next
// caller automatically retries with a fresh connection.
let clientPromise: Promise<MongoClient> | undefined

/**
 * Returns a connected MongoClient.
 *
 * On connection failure the cached promise is discarded so the next
 * caller retries with a fresh client. This prevents a single cold-start
 * glitch from permanently breaking the module for the lifetime of the
 * serverless instance.
 *
 * In development the connection is stored on `global` to survive hot
 * reloads without spawning a new client on every code change.
 */
function getClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClient) {
      global._mongoClient = connectWithRetry()
      // On failure, log and clear the global so we retry on next access
      global._mongoClient.catch((err) => {
        console.error(
          '[mongodb] Connection failed in dev, will retry on next access:',
          err instanceof Error ? err.message : String(err),
        )
        global._mongoClient = undefined
      })
    }
    return global._mongoClient
  }

  // Production / other environments
  if (!clientPromise) {
    clientPromise = connectWithRetry()
    // Prevent unhandled rejection AND auto-retry on next request
    clientPromise.catch((err) => {
      console.error(
        '[mongodb] Connection failed, will retry on next request:',
        err instanceof Error ? err.message : String(err),
      )
      clientPromise = undefined
    })
  }
  return clientPromise
}

export default getClient
