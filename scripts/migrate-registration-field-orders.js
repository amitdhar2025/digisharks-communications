/**
 * Migration script: ensure all registration form fields have proper `order` values,
 * and that all forms have the new `slug` and `name` fields.
 *
 * Run: node scripts/migrate-registration-field-orders.js
 */

const { MongoClient } = require('mongodb')
const path = require('path')
const fs = require('fs')

// Try to load .env.local from project root
const envPaths = [
  path.join(__dirname, '..', '.env.local'),
  path.join(__dirname, '..', '.env'),
]
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '')
        if (!process.env[key]) process.env[key] = val
      }
    }
    console.log(`Loaded env from ${p}`)
    break
  }
}

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI is not set. Create a .env.local file in the project root with MONGODB_URI=...')
  process.exit(1)
}

function generateSlug(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'form-' + Date.now()
}

async function main() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db()
    const configs = db.collection('registrationformconfigs')

    const allConfigs = await configs.find({}).toArray()
    console.log(`Found ${allConfigs.length} registration form(s).\n`)

    if (allConfigs.length === 0) {
      console.log('No registration form configs found. Nothing to migrate.')
      return
    }

    let totalFieldsFixed = 0
    let totalFormsUpdated = 0

    for (const config of allConfigs) {
      const formKey = config.key || 'unknown'
      const formName = config.name || config.formTitle || formKey
      console.log(`── Form: "${formName}" (key: ${formKey}, slug: ${config.slug || 'MISSING'}) ──`)

      let formNeedsUpdate = false
      const fields = config.fields || []

      // 1. Fix missing slug
      if (!config.slug) {
        const newSlug = config.key === 'registration-form' ? 'register' : generateSlug(formName)
        config.slug = newSlug
        formNeedsUpdate = true
        console.log(`  Added missing slug: "${newSlug}"`)
      }

      // 2. Fix missing name
      if (!config.name) {
        config.name = config.formTitle || config.key || 'Unnamed Form'
        formNeedsUpdate = true
        console.log(`  Added missing name: "${config.name}"`)
      }

      // 3. Fix field order values
      let maxOrder = 0
      for (const field of fields) {
        if (typeof field.order === 'number' && field.order > maxOrder) {
          maxOrder = field.order
        }
      }

      let fieldsFixed = 0
      for (let i = 0; i < fields.length; i++) {
        if (typeof fields[i].order !== 'number' || isNaN(fields[i].order)) {
          maxOrder++
          fields[i].order = maxOrder
          fieldsFixed++
          formNeedsUpdate = true
        }
      }

      if (fieldsFixed > 0) {
        console.log(`  Fixed ${fieldsFixed} field(s) with missing order values`)
        totalFieldsFixed += fieldsFixed
      }

      if (formNeedsUpdate) {
        await configs.updateOne(
          { _id: config._id },
          { $set: { slug: config.slug, name: config.name, fields, updatedAt: new Date() } }
        )
        totalFormsUpdated++
        console.log(`  ✅ Updated`)
      } else {
        console.log(`  No changes needed ✅`)
      }
    }

    // Ensure slug uniqueness
    const allAfter = await configs.find({}).toArray()
    const slugCounts = {}
    for (const c of allAfter) {
      if (c.slug) {
        slugCounts[c.slug] = (slugCounts[c.slug] || 0) + 1
      }
    }
    const dupeSlugs = Object.entries(slugCounts).filter(([, count]) => count > 1)
    if (dupeSlugs.length > 0) {
      console.log('\n⚠️  Duplicate slugs found (these need manual fixing):')
      for (const [slug, count] of dupeSlugs) {
        console.log(`   "${slug}" appears ${count} times`)
      }
    }

    console.log(`\n── Summary ──`)
    console.log(`  Total forms: ${allConfigs.length}`)
    console.log(`  Forms updated: ${totalFormsUpdated}`)
    console.log(`  Total fields fixed: ${totalFieldsFixed}`)
    console.log('\n✅ Migration complete.')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()
