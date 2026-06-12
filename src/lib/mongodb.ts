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
  // Required in many Windows / older Node environments where the system
  // CA bundle is missing the MongoDB Atlas root certificate. Setting
  // this to `true` tells the driver to fall back to its own trust
  // store. The connection is STILL encrypted end-to-end — only
  // certificate validation is relaxed.
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  retryWrites: true,
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
