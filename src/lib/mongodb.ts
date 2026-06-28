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
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 15000,
  retryWrites: true,
  // Limit concurrent connections to the database.
  maxPoolSize: 10,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === 'development') {
  // Reuse the connection across hot-reloads in dev to avoid spawning
  // a new client on every code change.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
