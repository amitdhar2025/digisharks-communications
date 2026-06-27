/**
 * Final cleanup — fix remaining hardcoded pink/magenta values missed by
 * earlier conversion scripts.
 *
 * Key mappings:
 *   rgba(233,30,140,…)  →  rgba(79,70,229,…)   (magenta → accent #4F46E5)
 *   rgba(240,98,146,…)  →  rgba(99,102,241,…)  (pink-soft → accent-soft #6366F1)
 *   rgba(194,24,91,…)   →  rgba(49,46,129,…)   (dark-pink → accent-dark #312E81)
 */

const fs = require('fs')
const path = require('path')
const root = path.resolve(__dirname, '..')

const replacements = [
  // ====== src/app/page.tsx — service card inline styles ======
  {
    file: 'src/app/page.tsx',
    from: /rgba\(233,\s*30,\s*140/g,
    to: 'rgba(79,70,229',
  },
  {
    file: 'src/app/page.tsx',
    from: /rgba\(240,\s*98,\s*146/g,
    to: 'rgba(99,102,241',
  },
  {
    file: 'src/app/page.tsx',
    from: /rgba\(194,\s*24,\s*91/g,
    to: 'rgba(49,46,129',
  },
  // ====== src/app/(public)/dp.css ======
  {
    file: 'src/app/(public)/dp.css',
    from: /rgba\(233,\s*30,\s*140/g,
    to: 'rgba(79,70,229',
  },
  // ====== src/app/(public)/digital-products/[slug]/ProductDetailView.tsx ======
  {
    file: 'src/app/(public)/digital-products/[slug]/ProductDetailView.tsx',
    from: /rgba\(233,\s*30,\s*140/g,
    to: 'rgba(79,70,229',
  },
  // ====== src/app/(public)/digital-products/[slug]/page.tsx ======
  {
    file: 'src/app/(public)/digital-products/[slug]/page.tsx',
    from: /rgba\(233,\s*30,\s*140/g,
    to: 'rgba(79,70,229',
  },
]

let totalCount = 0
const done = new Set()

for (const r of replacements) {
  const fp = path.join(root, r.file)
  if (!fs.existsSync(fp)) {
    console.warn(`⚠  File not found: ${r.file}`)
    continue
  }
  const original = fs.readFileSync(fp, 'utf8')
  const updated = original.replace(r.from, r.to)
  if (original !== updated) {
    const count = (original.match(r.from) || []).length
    fs.writeFileSync(fp, updated, 'utf8')
    if (!done.has(r.file)) {
      console.log(`\n📄 ${r.file}:`)
      done.add(r.file)
    }
    console.log(`   ${r.from} → ${r.to}  (${count}x)`)
    totalCount += count
  }
}

console.log(`\n✅ Total: ${totalCount} replacements across ${done.size} files`)
