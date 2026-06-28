#!/usr/bin/env node

/**
 * Watch Script — Auto-convert new PNG/JPEG images to lossless WebP
 * ==================================================================
 *
 * Monitors the `public/` folder for newly added or modified PNG/JPEG files
 * and automatically converts them to lossless WebP using sharp.
 *
 * Usage:
 *   node scripts/watch-public.js                  # Quiet mode
 *   node scripts/watch-public.js --verbose        # Show per-file details
 *   node scripts/watch-public.js --debounce=1000  # Custom debounce (ms)
 *
 * Press Ctrl+C to stop.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// --------------------------------------------------------------------------
// Configuration
// --------------------------------------------------------------------------
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.resolve(ROOT, 'public');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg']);
const AVIF_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose') || args.includes('-v');
const DEBOUNCE_MS = parseInt(args.find((a) => a.startsWith('--debounce='))?.split('=')[1] || '500', 10);

// --------------------------------------------------------------------------
// Terminal helpers
// --------------------------------------------------------------------------
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

function timestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

// --------------------------------------------------------------------------
// Debounce map — prevents double-processing rapid successive events
// --------------------------------------------------------------------------
const pendingTimers = new Map();
let conversionCount = 0;
let bytesSaved = 0;

function debouncedConvert(relPath, fullPath) {
  // Clear any existing timer for this path
  if (pendingTimers.has(fullPath)) {
    clearTimeout(pendingTimers.get(fullPath));
  }

  // Set a new debounce timer
  pendingTimers.set(fullPath, setTimeout(async () => {
    pendingTimers.delete(fullPath);
    await Promise.all([
      convertToWebP(relPath, fullPath),
      convertToAvif(relPath, fullPath),
    ]);
  }, DEBOUNCE_MS));
}

// --------------------------------------------------------------------------
// WebP conversion (reuses same lossless settings from convert-to-webp.js)
// --------------------------------------------------------------------------
async function convertToWebP(relPath, fullPath) {
  try {
    // Verify the file still exists (might have been deleted between event + timer)
    if (!fs.existsSync(fullPath)) return;

    const ext = path.extname(fullPath).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return;

    const webpPath = fullPath.replace(ext, '.webp');
    const origSize = fs.statSync(fullPath).size;

    // Skip tiny files
    if (origSize < 256) return;

    // If WebP already exists and is already smaller, skip
    if (fs.existsSync(webpPath)) {
      const webpSize = fs.statSync(webpPath).size;
      if (webpSize <= origSize) {
        if (VERBOSE) {
          console.log(`  ${dim('−')} [${timestamp()}] ${relPath}  ${dim('WebP already optimal')}`);
        }
        return;
      }
    }

    // Convert
    await sharp(fullPath)
      .webp({
        quality: 100,
        lossless: true,
        reductionEffort: 6,
        force: true,
      })
      .toFile(webpPath);

    const webpSize = fs.statSync(webpPath).size;
    const saved = Math.max(0, origSize - webpSize);
    conversionCount++;
    bytesSaved += saved;

    if (saved > 0) {
      const pct = ((saved / origSize) * 100).toFixed(1);
      console.log(`  ${green('✓')} [${timestamp()}] ${relPath}  ${dim(formatBytes(origSize))} → ${green(formatBytes(webpSize))}  (${green('-' + pct + '%')})`);
    } else {
      if (VERBOSE) {
        console.log(`  ${yellow('∼')} [${timestamp()}] ${relPath}  ${dim('same size — kept WebP')}`);
      }
    }
  } catch (err) {
    // Don't crash on individual file errors — just log and move on
    if (VERBOSE) {
      console.error(`  ${red('✗')} [${timestamp()}] ${relPath}  ${dim(err.message)}`);
    }
  }
}

// --------------------------------------------------------------------------
// AVIF conversion (reuses lossless settings from convert-to-avif.js)
// --------------------------------------------------------------------------
async function convertToAvif(relPath, fullPath) {
  try {
    if (!fs.existsSync(fullPath)) return;

    const ext = path.extname(fullPath).toLowerCase();
    if (!AVIF_EXTS.has(ext)) return;

    const avifPath = fullPath.replace(ext, '.avif');
    const origSize = fs.statSync(fullPath).size;

    if (origSize < 256) return;

    if (fs.existsSync(avifPath)) {
      const avifSize = fs.statSync(avifPath).size;
      if (avifSize <= origSize) {
        if (VERBOSE) {
          console.log(`  ${dim('−')} [${timestamp()}] ${relPath} → .avif  ${dim('AVIF already optimal')}`);
        }
        return;
      }
    }

    await sharp(fullPath)
      .avif({
        quality: 85,
        lossless: false,
        effort: 6,
      })
      .toFile(avifPath);

    const avifSize = fs.statSync(avifPath).size;
    const saved = Math.max(0, origSize - avifSize);
    conversionCount++;
    bytesSaved += saved;

    if (saved > 0) {
      const pct = ((saved / origSize) * 100).toFixed(1);
      console.log(`  ${green('✓')} [${timestamp()}] ${relPath} → .avif  ${dim(formatBytes(origSize))} → ${green(formatBytes(avifSize))}  (${green('-' + pct + '%')})`);
    } else {
      if (VERBOSE) {
        console.log(`  ${yellow('∼')} [${timestamp()}] ${relPath} → .avif  ${dim('same size')}`);
      }
    }
  } catch (err) {
    if (VERBOSE) {
      console.error(`  ${red('✗')} [${timestamp()}] ${relPath} → .avif  ${dim(err.message)}`);
    }
  }
}

// --------------------------------------------------------------------------
// File watcher
// --------------------------------------------------------------------------
function startWatcher() {
  console.log(bold('\n👁️  Digisharks — Public Folder Watcher'));
  console.log(dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(`  Watching:  ${PUBLIC}`);
  console.log(`  Outputs:   ${Array.from(IMAGE_EXTS).join(', ')} → .webp + .avif`);
  console.log(`  Debounce:  ${DEBOUNCE_MS}ms`);
  console.log(`  Mode:      ${VERBOSE ? yellow('verbose') : green('normal')}`);
  console.log(dim('\n  Waiting for new or modified images...\n'));
  console.log(dim('  Tip: Drop a .png or .jpg into the public/ folder and'));
  console.log(dim('       it will be auto-converted to WebP + AVIF.\n'));

  // Attempt recursive watching
  try {
    const watcher = fs.watch(PUBLIC, { recursive: true }, (eventType, filename) => {
      if (!filename) return;

      const relPath = filename.replace(/\\/g, '/');
      const ext = path.extname(relPath).toLowerCase();

      // Only care about image files
      if (!IMAGE_EXTS.has(ext)) return;

      const fullPath = path.resolve(PUBLIC, relPath);

      // Only process if it's actually a file (not a directory event)
      try {
        if (!fs.statSync(fullPath).isFile()) return;
      } catch {
        return; // file may have been deleted before we could stat it
      }

      debouncedConvert(relPath, fullPath);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log(bold('\n\n🛑  Shutting down watcher...'));
      console.log(`  Converted: ${conversionCount} file(s)`);
      console.log(`  Saved:     ${green(formatBytes(bytesSaved))}\n`);

      // Clear pending timers
      for (const [path, timer] of pendingTimers) {
        clearTimeout(timer);
      }
      pendingTimers.clear();

      watcher.close();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      watcher.close();
      process.exit(0);
    });

    // Handle watcher errors
    watcher.on('error', (err) => {
      console.error(red('\n✗ Watcher error:'), err.message);
    });
  } catch (err) {
    console.error(red('\n✗ Failed to start watcher:'), err.message);
    console.error(dim('  The fs.watch recursive option is not supported on this platform.'));
    console.error(dim('  Try running the conversion manually instead: npm run convert:webp'));
    process.exit(1);
  }
}

// --------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------
// Check sharp availability
try {
  require.resolve('sharp');
} catch {
  console.error(red('\n✗ sharp is not installed. Run: npm install sharp\n'));
  process.exit(1);
}

startWatcher();
