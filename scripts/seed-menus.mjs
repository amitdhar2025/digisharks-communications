/**
 * Seed Default Menu Items
 *
 * Populates the database with default menu items for alert bar links,
 * main navigation, and services sub-menus.
 *
 * This ensures the frontend components (AlertBar, Navigation) have data
 * to display immediately after deployment.
 *
 * Usage:
 *   npx tsx scripts/seed-menus.mjs
 *
 * (The script auto-detects .env.local and loads it via dotenv.)
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local')
  process.exit(1)
}

// ═══════════════════════════════════════════════════════════════════════
// DEFAULT MENU DATA
// ═══════════════════════════════════════════════════════════════════════

const ALERT_BAR_ITEMS = [
  { label: 'About Us',      href: '/about-us',                        order: 0 },
  { label: 'TIA',           href: 'https://theindianalert.com',       order: 1 },
  { label: 'Career',        href: '/career',                          order: 2 },
  { label: 'News',          href: '/news',                            order: 3 },
]

const TICKER_ITEMS = [
  { label: 'Beware of fraudulent calls, fake invoices, and impersonation scams. Always verify through our official website, email, and phone number before making any payments.', icon: '🚨', order: 0 },
  { label: 'DigiSharks does NOT offer any jobs or internships via WhatsApp or Telegram. All such messages are fraudulent — please ignore and report them immediately.', icon: '⚠️', order: 1 },
  { label: "Awarded 'Top Digital PR Agency — North India 2024' by Clutch. 500+ clients served, 50+ media house partnerships, and 10+ years of trusted digital growth expertise.", icon: '🏆', order: 2 },
]

const MAIN_NAV_ITEMS = [
  { label: 'Home',            href: '/',                                   order: 0 },
  { label: 'About Us',        href: '/about-us',                           order: 1 },
  { label: 'Services',        href: '/services-top-pr-digital-marketing/', order: 2 },
  { label: 'Portfolio',       href: '/portfolio',                          order: 3 },
  { label: 'Blog',            href: '/blog',                               order: 4 },
  { label: 'Contact',         href: '/contact-us',                         order: 5 },
  { label: 'Digital Products', href: '/digital-products/',                 order: 6 },
]

const SERVICES_SUB_ITEMS = [
  { label: 'Press Release',       href: '/press-release/',              order: 0 },
  { label: 'Digital Marketing',   href: '/digital-marketing-agency/',   order: 1 },
  { label: 'Social Media',        href: '/social-media/',               order: 2 },
  { label: 'Web Development',     href: '/web-development/',            order: 3 },
  { label: 'Brand Promotion',     href: '/brand-promotion/',            order: 4 },
]

const ALL_MENUS = [
  { type: 'alert-bar',    label: 'Alert Bar Links',     items: ALERT_BAR_ITEMS },
  { type: 'alert-ticker', label: 'Ticker Messages',     items: TICKER_ITEMS },
  { type: 'main-nav',     label: 'Main Navigation',     items: MAIN_NAV_ITEMS },
  { type: 'services-sub', label: 'Services Sub-menus',  items: SERVICES_SUB_ITEMS },
]

// ═══════════════════════════════════════════════════════════════════════

async function main() {
  console.log('')
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║       Seed Default Menu Items                       ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log('')

  // Connect to MongoDB
  console.log('📦 Connecting to MongoDB...')
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')
  } catch (err) {
    console.error('❌ Failed to connect:', err.message)
    process.exit(1)
  }

  // Define MenuItem schema (same as src/models/MenuItem.js)
  const MenuItemSchema = new mongoose.Schema(
    {
      type: {
        type: String,
        required: true,
        enum: ['alert-bar', 'alert-ticker', 'main-nav', 'services-sub'],
        index: true,
      },
      label: {
        type: String,
        required: true,
        trim: true,
      },
      href: {
        type: String,
        required: false,
        default: '#',
        trim: true,
      },
      order: {
        type: Number,
        default: 0,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      icon: {
        type: String,
        default: '',
      },
    },
    {
      timestamps: true,
    }
  )

  MenuItemSchema.index({ type: 1, order: 1 })

  const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema)

  let totalCreated = 0
  let totalSkipped = 0

  for (const group of ALL_MENUS) {
    console.log(`\n── ${group.label} (${group.type}) ──`)

    for (const item of group.items) {
      // For tickers, check by type + label; for others by type + href
      const existing = await MenuItem.findOne({
        type: group.type,
        ...(group.type === 'alert-ticker' ? { label: item.label } : { href: item.href }),
      })

      if (existing) {
        console.log(`  ⏭️  ${item.label} (${item.href}) — already exists, skipping`)
        totalSkipped++
        continue
      }

      await MenuItem.create({
        type: group.type,
        label: item.label,
        href: item.href || '#',
        order: item.order,
        isActive: true,
        icon: item.icon || '',
      })

      const displayRef = group.type === 'alert-ticker' ? (item.icon + ' ' + item.label.substring(0, 50) + '…') : `${item.label} (${item.href})`
      console.log(`  ✅ ${displayRef} — created`)
      totalCreated++
    }
  }

  console.log('')
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log(`║   ✅ ${totalCreated} items created  |  ⏭️  ${totalSkipped} skipped`)
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log('')
  console.log('You can now manage these menus from the CMS:')
  console.log('   http://localhost:3000/content/admin/menus')
  console.log('')

  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
