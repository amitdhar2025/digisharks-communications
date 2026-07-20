/**
 * Compress AVIF/WebP images in public/ at lower quality
 * AND rename files to remove spaces/special chars for better CDN compat
 *
 * Usage:
 *   node scripts/compress-public-avif.mjs
 *
 * The .htaccess FilesMatch/Cache-Control rules only work when filenames
 * don't have URL-encoded characters (spaces, parens, etc). The CDN (hcdn)
 * bypasses Apache for files with special characters.
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const PUBLIC = new URL('../public', import.meta.url).pathname.replace(/^\//, '').replace(/^([A-Z]):/, '$1:')

const QUALITY = 60 // Balance of size vs quality

// ── Mapping of old filenames → new filenames (space/paren removal) ──
const RENAME_MAP = {
  // Portfolio images
  'Digital PR.avif': 'digital-pr.avif',
  'Web Development.avif': 'web-development.avif',
  'Social Media.avif': 'social-media.avif',
  'Political PR.avif': 'political-pr.avif',
  'SEO & PPC.avif': 'seo-ppc.avif',
  'AI Tools.avif': 'ai-tools.avif',
  // Award images
  'google partner.avif': 'google-partner.avif',
  'meta partner.avif': 'meta-partner.avif',
  'clutch award.avif': 'clutch-award.avif',
  // Career images
  'career hero image.avif': 'career-hero-image.avif',
  'career hero mobile image.avif': 'career-hero-mobile-image.avif',
  // Brand slider "one card (N)" images
  'one card (1).avif': 'one-card-1.avif',
  'one card (2).avif': 'one-card-2.avif',
  'one card (3).avif': 'one-card-3.avif',
  'one card (4).avif': 'one-card-4.avif',
  'one card (5).avif': 'one-card-5.avif',
  'one card (6).avif': 'one-card-6.avif',
  'one card (7).avif': 'one-card-7.avif',
  'one card (8).avif': 'one-card-8.avif',
  // Other webp files that need renaming
  'Team Member.avif': 'team-member.avif',
  'The Indian Alert.avif': 'the-indian-alert.avif',
  'Uday Kumar.avif': 'uday-kumar.avif',
  'Vansh Mehra.avif': 'vansh-mehra.avif',
  'ChatGPT Image Jun 4, 2026, 12_16_30 AM.avif': 'chatgpt-image.avif',
  'Top 10 CEOs 2021–2022.avif': 'top-10-ceos.avif',
  'Top 10 Dynamic Entrepreneurs 2021–2022.avif': 'top-10-dynamic-entrepreneurs.avif',
  'Top 10 Influential Businesses of the Year 2022.avif': 'top-influential-businesses.avif',
  'Top 30 Women Entrepreneurs of the Year 2023.avif': 'top-women-entrepreneurs.avif',
  'Top 50 Entrepreneurs 2022.avif': 'top-50-entrepreneurs.avif',
}

function log(msg) {
  console.log(`  ${msg}`)
}

function formatBytes(n) {
  if (n === 0) return '0 B'
  const units = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(Math.abs(n)) / Math.log(1024))
  const v = (n / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)
  return `${v} ${units[i]}`
}

async function main() {
  console.log('\n🔧 Image Compressor + File Renamer\n')

  let totalOriginal = 0
  let totalNew = 0
  let count = 0

  for (const [oldName, newName] of Object.entries(RENAME_MAP)) {
    const oldPath = path.join(PUBLIC, oldName)
    const newPath = path.join(PUBLIC, newName)

    // Skip if old file doesn't exist
    if (!fs.existsSync(oldPath)) {
      log(`⚠  Skipping: ${oldName} (not found)`)
      continue
    }

    const ext = path.extname(oldName).toLowerCase()
    const origSize = fs.statSync(oldPath).size
    totalOriginal += origSize

    try {
      const sharp = (await import('sharp')).default
      let pipeline = sharp(oldPath)

      if (ext === '.avif') {
        pipeline = pipeline.avif({ quality: QUALITY })
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: QUALITY })
      } else {
        throw new Error(`Unsupported extension: ${ext}`)
      }

      // Write directly to the new filename
      await pipeline.toFile(newPath)
      const newSize = fs.statSync(newPath).size
      totalNew += newSize

      const saved = origSize - newSize
      const pct = ((saved / origSize) * 100).toFixed(1)
      log(`${count + 1}. ${oldName} → ${newName}`)
      log(`   ${formatBytes(origSize)} → ${formatBytes(newSize)}  (${pct > 0 ? '-' : ''}${pct}%)`)

      // Delete old file if the name changed
      if (oldPath !== newPath) {
        fs.unlinkSync(oldPath)
        log(`   🗑  Deleted old: ${oldName}`)
      }

      count++
    } catch (err) {
      log(`✗  Error on ${oldName}: ${err.message}`)
    }
  }

  const totalSaved = totalOriginal - totalNew
  const totalPct = totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100).toFixed(1) : '0'
  console.log('\n📊 Summary')
  console.log(`   Files processed: ${count}`)
  console.log(`   Original total:  ${formatBytes(totalOriginal)}`)
  console.log(`   New total:       ${formatBytes(totalNew)}`)
  console.log(`   Total saved:     ${formatBytes(totalSaved)} (${totalPct}%)`)
  console.log('')
  console.log('⚠  IMPORTANT: You must now update all code references to use the new filenames!')
  console.log('')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
