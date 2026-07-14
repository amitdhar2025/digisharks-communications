#!/usr/bin/env node

/**
 * Export CMS Data to JSON Files
 *
 * Connects to MongoDB, exports all CMS collections to structured JSON files
 * in the cms-data/ directory at the project root. These files are then
 * committed to GitHub to keep CMS content changes in sync with the repo.
 *
 * Usage:
 *   node scripts/export-cms-to-json.mjs              (normal run)
 *   node scripts/export-cms-to-json.mjs --dry-run    (no files written)
 *   node scripts/export-cms-to-json.mjs --pretty     (pretty-printed JSON)
 *
 * Environment variable required:
 *   MONGODB_URI  — MongoDB Atlas connection string
 *
 * Output directory: <project-root>/cms-data/
 *   ├── pagecontents.json       — Editable page content (CMS pages)
 *   ├── sitesettings.json       — Global site settings
 *   ├── menuitems.json          — Navigation menus
 *   ├── registrationformconfigs.json — Registration form configs
 *   ├── registrations.json      — Public registration entries
 *   ├── activitylogs.json       — Activity logs
 *   ├── blogposts.json          — Blog posts
 *   ├── chatbotqas.json         — Chatbot Q&A pairs
 *   └── ...                     — All other dynamic collections
 *
 * Collections SKIPPED (auth/internal/sensitive):
 *   backuprecords, admins, cmsadminusers, sub_admins,
 *   trash_items, trash_permanent_deletions, trash_settings,
 *   security_attacks, security_settings, carts, login_logs
 */

import { MongoClient } from 'mongodb'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Setup ────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')
const OUTPUT_DIR = resolve(ROOT, 'cms-data')

const DRY_RUN = process.argv.includes('--dry-run')
const PRETTY = process.argv.includes('--pretty')

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('[FATAL] Missing required env var: MONGODB_URI')
  process.exit(1)
}

// ── Helpers ──────────────────────────────────────────────────────────

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

function stripMongooseInternals(doc) {
  if (!doc || typeof doc !== 'object') return doc
  const cleaned = { ...doc }
  delete cleaned.__v
  // Preserve original _id as a string `id` field before removing the ObjectId
  if (doc._id) {
    cleaned.id = typeof doc._id === 'object' ? String(doc._id) : doc._id
  }
  delete cleaned._id
  return cleaned
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  log('========================================')
  log('CMS DATA EXPORT START')
  log('========================================')
  log(`Dry run: ${DRY_RUN}`)
  log(`Output:  ${OUTPUT_DIR}`)

  // Connect to MongoDB
  log('[DB] Connecting to MongoDB...')
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  })
  await client.connect()
  log('[DB] Connected successfully')

  const db = client.db()
  const collections = await db.listCollections().toArray()
  const collectionNames = collections.map((c) => c.name)
  log(`[DB] Found ${collectionNames.length} collections: ${collectionNames.join(', ')}`)

  // Collections to skip — auth credentials, internal system data, temp/cache
  const skipCollections = [
    'admins',                  // Admin password hashes
    'cmsadminusers',           // CMS admin password hashes
    'sub_admins',              // Sub-admin password hashes + permissions
    'trash_items',             // Internal deleted-item tracking
    'trash_permanent_deletions', // Internal permanent-deletion audit trail
    'trash_settings',          // Internal trash configuration
    'security_attacks',        // Security attack logs (can be large + sensitive)
    'security_settings',       // Security configuration
    'carts',                   // Temporary/session cart data
    'login_logs',              // Login audit logs with IPs + user agents (PII)
  ]

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  let exportedCount = 0
  let totalDocs = 0

  for (const name of collectionNames) {
    if (skipCollections.includes(name.toLowerCase())) {
      log(`[SKIP] Skipping collection: ${name}`)
      continue
    }

    log(`[EXPORT] Exporting collection: ${name}...`)
    const docs = await db.collection(name).find({}).toArray()
    const cleanedDocs = docs.map(stripMongooseInternals)

    const filePath = resolve(OUTPUT_DIR, `${name}.json`)
    const jsonContent = PRETTY
      ? JSON.stringify(cleanedDocs, null, 2)
      : JSON.stringify(cleanedDocs)

    if (!DRY_RUN) {
      writeFileSync(filePath, jsonContent, 'utf-8')
    }

    log(`[EXPORT] ${DRY_RUN ? '(dry-run) ' : ''}Exported ${docs.length} documents from "${name}" → ${name}.json`)
    exportedCount++
    totalDocs += docs.length
  }

  await client.close()
  log('[DB] MongoDB connection closed')

  log('========================================')
  log('EXPORT SUMMARY')
  log(`  Collections exported: ${exportedCount}`)
  log(`  Total documents:      ${totalDocs}`)
  log(`  Output directory:     ${OUTPUT_DIR}`)
  log(`  Dry run:              ${DRY_RUN}`)
  log('========================================')

  // Exit with non-zero if nothing was exported (signal that there's nothing to commit)
  if (exportedCount === 0) {
    console.log('No collections were exported — nothing to commit.')
    process.exit(0)
  }
}

main().catch((err) => {
  console.error('[FATAL] Export failed:', err)
  process.exit(1)
})
