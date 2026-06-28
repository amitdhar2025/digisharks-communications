/**
 * Convert all PNG/JPEG images in `public/` to lossless WebP.
 *
 * Keeps the original files as fallback — only adds .webp versions.
 * Run this once after adding new images.
 *
 * Usage:
 *   node scripts/convert-to-webp.js
 *   node scripts/convert-to-webp.js --verbose
 *   node scripts/convert-to-webp.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.resolve(ROOT, 'public');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.tiff']);

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
  console.log(bold('\n🖼️  Digisharks — PNG/JPEG → WebP Converter'));
  console.log(dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(`  Mode: ${DRY_RUN ? yellow('dry-run') : green('live')}`);
  console.log(`  Folder: ${PUBLIC}\n`);

  const allFiles = walkDir(PUBLIC);
  const toConvert = allFiles.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return false;
    const webpPath = f.replace(ext, '.webp');
    if (fs.existsSync(webpPath)) {
      // If WebP already exists and is not smaller, skip
      const origSize = fs.statSync(f).size;
      const webpSize = fs.statSync(webpPath).size;
      if (webpSize < origSize) {
        stats.skipped++;
        if (VERBOSE) console.log(`  ${dim('−')} ${path.relative(PUBLIC, f)}  WebP already exists (${formatBytes(webpSize)} vs ${formatBytes(origSize)})`);
        return false;
      }
    }
    return true;
  });

  if (toConvert.length === 0) {
    console.log('  No images to convert — all already have WebP versions.\n');
    return;
  }

  console.log(`  Found ${toConvert.length} images to convert.\n`);

  for (const filePath of toConvert) {
    const ext = path.extname(filePath).toLowerCase();
    const webpPath = filePath.replace(ext, '.webp');
    const relPath = path.relative(PUBLIC, filePath);
    const origSize = fs.statSync(filePath).size;

    try {
      if (!DRY_RUN) {
        await sharp(filePath)
          .webp({
            quality: 100,
            lossless: true,
            reductionEffort: 6,
            force: true,
          })
          .toFile(webpPath);

        const webpSize = fs.statSync(webpPath).size;
        const saved = origSize - webpSize;
        stats.bytesSaved += Math.max(0, saved);
        stats.converted++;

        if (VERBOSE) {
          const pct = saved > 0 ? ` (-${((saved / origSize) * 100).toFixed(1)}%)` : ' (same size)';
          console.log(`  ${green('✓')} ${relPath}  ${dim(formatBytes(origSize))} → ${green(formatBytes(webpSize))}${pct}`);
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
  console.log(`  Saved:     ${green(formatBytes(stats.bytesSaved))}`);
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
