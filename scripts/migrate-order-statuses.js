/**
 * Migration script: migrate old binary deliveryStatus values to new 4-stage pipeline.
 *
 * Old values → New values:
 *   'not_yet'  → 'pending'
 *   'received' → 'delivered'
 *
 * Run: node scripts/migrate-order-statuses.js
 */

const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI is not set. Set it or create a .env.local file.')
  process.exit(1)
}

async function main() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db()
    const orders = db.collection('orders')

    // Count old statuses
    const notYetCount = await orders.countDocuments({ deliveryStatus: 'not_yet' })
    const receivedCount = await orders.countDocuments({ deliveryStatus: 'received' })
    console.log(`Found ${notYetCount} orders with 'not_yet' status`)
    console.log(`Found ${receivedCount} orders with 'received' status`)

    if (notYetCount === 0 && receivedCount === 0) {
      console.log('No orders to migrate. All statuses are already up-to-date.')
      return
    }

    // Migrate 'not_yet' → 'pending'
    if (notYetCount > 0) {
      const r1 = await orders.updateMany(
        { deliveryStatus: 'not_yet' },
        { $set: { deliveryStatus: 'pending', updatedAt: new Date() } }
      )
      console.log(`Migrated 'not_yet' → 'pending': ${r1.modifiedCount} orders`)
    }

    // Migrate 'received' → 'delivered'
    if (receivedCount > 0) {
      const r2 = await orders.updateMany(
        { deliveryStatus: 'received' },
        { $set: { deliveryStatus: 'delivered', updatedAt: new Date() } }
      )
      console.log(`Migrated 'received' → 'delivered': ${r2.modifiedCount} orders`)
    }

    // Verify
    const remainingNotYet = await orders.countDocuments({ deliveryStatus: 'not_yet' })
    const remainingReceived = await orders.countDocuments({ deliveryStatus: 'received' })
    const pending = await orders.countDocuments({ deliveryStatus: 'pending' })
    const delivered = await orders.countDocuments({ deliveryStatus: 'delivered' })
    console.log('\nPost-migration status counts:')
    console.log(`  pending:   ${pending}`)
    console.log(`  delivered: ${delivered}`)
    if (remainingNotYet > 0) console.log(`  ⚠️  still 'not_yet': ${remainingNotYet}`)
    if (remainingReceived > 0) console.log(`  ⚠️  still 'received': ${remainingReceived}`)

    console.log('\n✅ Migration complete.')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()
