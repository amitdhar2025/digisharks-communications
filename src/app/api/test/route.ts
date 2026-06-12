import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

/**
 * Diagnostic endpoint for the MongoDB Atlas connection.
 *
 * Atlas "SSL alert number 80" (TLS internal_error) is a SERVER-side
 * rejection during the TLS handshake. It is almost never caused by
 * the driver code — it means Atlas is refusing the connection. This
 * endpoint runs a few checks and reports the most likely cause so you
 * can fix it in the Atlas UI.
 */
function maskUri(uri: string): string {
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, '$1****$3')
}

function buildTroubleshooting(message: string): string[] {
  const tips: string[] = []

  if (/SSL alert number 80/i.test(message) || /internal error/i.test(message)) {
    tips.push(
      'TLS internal_error (alert 80) is sent by the ATLAS SERVER, not the driver.',
      'Most common causes (check in this order):',
      '  1) Your current IP is NOT in the Atlas Network Access list.',
      '     → Atlas → Security → Network Access → "Add IP Address".',
      '     → For local testing you can add 0.0.0.0/0 (allows all IPs).',
      '  2) The Atlas cluster is PAUSED (free M0 clusters pause after inactivity).',
      '     → Atlas → Database → click your cluster → "Resume".',
      '  3) The username or password in MONGODB_URI is wrong.',
      '     → Atlas → Security → Database Access → verify the user exists.',
      '  4) The cluster hostname is wrong or the cluster was deleted.'
    )
  } else if (/bad auth|authentication failed/i.test(message)) {
    tips.push(
      'Authentication failed. Verify the username/password in MONGODB_URI.',
      'If the password contains special characters like @, :, /, ?, #, [, ] or %,',
      'they must be percent-encoded in the URI.'
    )
  } else if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|getaddrinfo/i.test(message)) {
    tips.push(
      'Network/DNS error. Check your internet connection and that',
      'mongodb+srv DNS SRV records are reachable (corporate firewalls can block 27017).'
    )
  } else if (/self.signed certificate|certificate verify|TLS certificate/i.test(message)) {
    tips.push(
      'TLS certificate problem. The driver is configured with',
      '`tlsAllowInvalidCertificates: true` — if you still see this, the',
      'Node version is too old to trust the bundled CA. Update Node to >= 18.'
    )
  } else {
    tips.push('Unhandled error — see the `error` field above.')
  }

  return tips
}

export async function GET() {
  const uri = process.env.MONGODB_URI || ''
  const baseInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    maskedUri: maskUri(uri),
    uriHasTlsParam: uri.includes('tls=true'),
    uriIsSrv: uri.startsWith('mongodb+srv://'),
  }

  try {
    const client = await clientPromise
    const admin = client.db('admin')

    // Real handshake + auth round-trip
    const pingResult = await admin.command({ ping: 1 })

    // What databases can this user see?
    const dbs = await admin.command({ listDatabases: 1 })
    const databaseNames = dbs.databases.map((d: { name: string }) => d.name)

    return NextResponse.json({
      status: 'Connected ✅',
      ping: pingResult,
      databases: databaseNames,
      databaseCount: databaseNames.length,
      ...baseInfo,
    })
  } catch (error) {
    const err = error as Error & { code?: string | number; name?: string }

    return NextResponse.json(
      {
        status: 'Connection failed ❌',
        error: err.message,
        name: err.name,
        code: err.code,
        ...baseInfo,
        troubleshooting: buildTroubleshooting(err.message),
      },
      { status: 500 }
    )
  }
}
