/**
 * Convert all images in `public/` to lossless AVIF.
 *
 * AVIF offers 30-50% better compression than WebP at the same quality.
 * Keeps the original files as fallback — only adds .avif versions.
 *
 * Usage:
 *   node scripts/convert-to-avif.js
 *   node scripts/convert-to-avif.js --verbose
 *   node scripts/convert-to-avif.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.resolve(ROOT, 'public');

// Convert from PNG, JPEG, TIFF, and WebP to AVIF
const SOURCE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.tiff', '.webp']);

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose') || args.includes('-v');

let stats = { converted: 0, skipped: 0, errors: [], bytesSaved: 0 };

const bold = (s) => `\x1b[1m${s}\x1b[22m`;
const green = (s) => `\x1b[32m${s}\x1b[39m`;
const dim = (s) => `\x1b[2m${s}\x1b[22m`;
const yellow = (s) => `\x1b[33m${s}\x1b[39m`;
const red = (s) => `\x1b[31m${s}\x1b[39m`;

function formatBytes(n) {
  if (n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(n)) / Math.log(1024));
  const v = (n / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0);
  return `${v} ${units[i]}`;
}

function walkDir(dir) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.')) results.push(...walkDir(full));
      } else {
        results.push(full);
      }
    }
  } catch {}
  return results;
}

async function main() {
  console.log(bold('\n🖼️  Digisharks — Image → AVIF Converter'));
  console.log(dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(`  Mode: ${DRY_RUN ? yellow('dry-run') : green('live')}`);
  console.log(`  Folder: ${PUBLIC}\n`);

  const allFiles = walkDir(PUBLIC);
  const toConvert = allFiles.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    if (!SOURCE_EXTS.has(ext)) return false;
    const avifPath = f.replace(ext, '.avif');
    if (fs.existsSync(avifPath)) {
      const origSize = fs.statSync(f).size;
      const avifSize = fs.statSync(avifPath).size;
      // Skip if AVIF already exists and is smaller (or equal)
      if (avifSize <= origSize) {
        stats.skipped++;
        if (VERBOSE) console.log(`  ${dim('−')} ${path.relative(PUBLIC, f)}  AVIF already exists (${formatBytes(avifSize)} vs ${formatBytes(origSize)})`);
        return false;
      }
    }
    return true;
  });

  if (toConvert.length === 0) {
    console.log('  No images to convert — all already have AVIF versions.\n');
    return;
  }

  console.log(`  Found ${toConvert.length} images to convert.\n`);

  for (const filePath of toConvert) {
    const ext = path.extname(filePath).toLowerCase();
    const avifPath = filePath.replace(ext, '.avif');
    const relPath = path.relative(PUBLIC, filePath);
    const origSize = fs.statSync(filePath).size;

    // Skip tiny files (< 256 bytes)
    if (origSize < 256) {
      stats.skipped++;
      if (VERBOSE) console.log(`  ${dim('−')} ${relPath}  ${dim('too small (<256 B)')}`);
      continue;
    }

    try {
      if (!DRY_RUN) {
        // AVIF quality 85 — visually-lossless, typically 30-70% smaller than PNG
        // Even WebP→AVIF gives meaningful savings for many images
        await sharp(filePath)
          .avif({
            quality: 85,
            lossless: false,
            effort: 6,
          })
          .toFile(avifPath);

        const avifSize = fs.statSync(avifPath).size;
        const saved = origSize - avifSize;
        stats.bytesSaved += Math.max(0, saved);
        stats.converted++;

        if (VERBOSE) {
          if (saved > 0) {
            const pct = ((saved / origSize) * 100).toFixed(1);
            console.log(`  ${green('✓')} ${relPath}  ${dim(formatBytes(origSize))} → ${green(formatBytes(avifSize))} (${green('-' + pct + '%')})`);
          } else {
            console.log(`  ${yellow('∼')} ${relPath}  ${dim(formatBytes(origSize))} → ${formatBytes(avifSize)} (${yellow('+' + Math.round((-saved / origSize) * 100) + '%')})`);
          }
        }
      } else {
        stats.converted++;
        console.log(`  ${green('✓')} ${relPath}  ${dim('(dry-run — would convert)')}`);
      }
    } catch (err) {
      stats.errors.push(`${relPath}: ${err.message}`);
      if (VERBOSE) console.error(`  ${red('✗')} ${relPath}  ${dim(err.message)}`);
    }
  }

  console.log(bold('\n📊 Summary'));
  console.log(dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(`  Converted: ${stats.converted}`);
  console.log(`  Skipped:   ${stats.skipped}`);
  console.log(`  Saved:     ${green(formatBytes(Math.max(0, stats.bytesSaved)))}`);
  const totalBefore = toConvert.reduce((sum, f) => {
    try { return sum + fs.statSync(f).size } catch { return sum }
  }, 0);
  const totalAfter = toConvert.reduce((sum, f) => {
    const ext = path.extname(f).toLowerCase();
    try { return sum + fs.statSync(f.replace(ext, '.avif')).size } catch { return sum }
  }, 0);
  if (totalAfter > 0) {
    const overall = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
    console.log(`  Overall:   ${formatBytes(totalBefore)} → ${green(formatBytes(totalAfter))} (${green('-' + overall + '%')})`);
  }
  if (stats.errors.length) {
    console.log(`  Errors:    ${red(String(stats.errors.length))}`);
    if (VERBOSE) stats.errors.forEach((e) => console.log(`    ${red('•')} ${e}`));
  }
  console.log('');
}

main().catch((err) => {
  console.error(red('\nFatal:'), err.message);
  process.exit(1);
});
