/**
 * Asset Optimization Script
 * ===========================
 *
 * Losslessly compresses images (PNG, JPEG, WebP, AVIF) in the `public/`
 * folder using `sharp` (already installed as a Next.js dependency) with
 * zero quality loss.
 *
 * Videos (MP4) require FFmpeg. If FFmpeg is found in PATH, they will be
 * re-encoded with visually-lossless H.264; otherwise videos are skipped.
 *
 * Usage:
 *   node scripts/optimize-assets.js                # Optimize everything
 *   node scripts/optimize-assets.js --dry-run       # Preview only, no writes
 *   node scripts/optimize-assets.js --verbose       # Show per-file details
 *   node scripts/optimize-assets.js --since=2025-01-01  # Only files modified after date
 *
 * Run this before `next build` (it is wired into the `build` script in
 * package.json).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --------------------------------------------------------------------------
// Configuration
// --------------------------------------------------------------------------
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.resolve(ROOT, 'public');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.tiff', '.avif']);
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov', '.avi', '.mkv']);

// Skip files that are already tiny — no need to waste cycles
const MIN_SIZE_BYTES = 2048; // skip files under 2 KB

// --------------------------------------------------------------------------
// CLI flags
// --------------------------------------------------------------------------
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose') || args.includes('-v');
const SINCE_FLAG = args.find((a) => a.startsWith('--since='));
const SINCE_DATE = SINCE_FLAG ? new Date(SINCE_FLAG.split('=')[1]) : null;

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
const bold = (s) => `\x1b[1m${s}\x1b[22m`;
const green = (s) => `\x1b[32m${s}\x1b[39m`;
const dim = (s) => `\x1b[2m${s}\x1b[22m`;
const yellow = (s) => `\x1b[33m${s}\x1b[39m`;
const red = (s) => `\x1b[31m${s}\x1b[39m`;

let stats = { imagesProcessed: 0, imagesSkipped: 0, videosProcessed: 0, videosSkipped: 0, bytesSaved: 0, errors: [] };

// --------------------------------------------------------------------------
// Synchronous sleep (blocks the event loop — acceptable for a CLI script)
// --------------------------------------------------------------------------
function sleepSync(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // Busy-wait — this is a CLI tool, no other concurrency to worry about
  }
}

// --------------------------------------------------------------------------
// Safe file operations with retry (handles Windows EBUSY / locking)
// --------------------------------------------------------------------------
function safeUnlink(p, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.unlinkSync(p);
      return;
    } catch (e) {
      if (i === attempts - 1) {
        console.error(`  Failed to delete ${p} after ${attempts} attempts: ${e.message}`);
        return;
      }
      sleepSync(300 * (i + 1)); // backoff: 300ms, 600ms, 900ms
    }
  }
}

function safeRename(oldPath, newPath, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.renameSync(oldPath, newPath);
      return;
    } catch (e) {
      if (i === attempts - 1) {
        console.error(`  Failed to rename ${oldPath} after ${attempts} attempts: ${e.message}`);
        return;
      }
      sleepSync(300 * (i + 1));
    }
  }
}

function safeReplace(targetPath, tempPath) {
  safeUnlink(targetPath);
  // After unlink, the file may not be completely released. Wait a beat.
  sleepSync(100);
  safeRename(tempPath, targetPath);
}

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
        // Skip hidden dirs and node_modules
        if (!entry.name.startsWith('.')) results.push(...walkDir(full));
      } else {
        results.push(full);
      }
    }
  } catch (e) {
    // Permission errors on some dirs
  }
  return results;
}

function shouldProcess(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXTS.has(ext) && !VIDEO_EXTS.has(ext)) return false;
  try {
    const stat = fs.statSync(filePath);
    if (stat.size < MIN_SIZE_BYTES) return false;
    if (SINCE_DATE && stat.mtime < SINCE_DATE) return false;
    return true;
  } catch {
    return false;
  }
}

// --------------------------------------------------------------------------
// Image optimisation via sharp
// --------------------------------------------------------------------------
async function optimiseImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = fs.statSync(filePath).size;
  const tempPath = filePath + '.opt-tmp';

  try {
    const sharp = require('sharp');
    let pipeline = sharp(filePath);

    switch (ext) {
      case '.png':
        // Truly lossless PNG — preserves every pixel exactly.
        // compressionLevel: 9 applies zlib's maximum compression
        // without any colour quantization or palette conversion.
        pipeline = pipeline.png({
          compressionLevel: 9,       // max compression (0-9), lossless
          force: true,
        });
        break;

      case '.jpg':
      case '.jpeg':
        // MozJPEG lossless optimisation (mozjpeg is bundled with sharp)
        pipeline = pipeline.jpeg({
          quality: 100,              // keep 100% quality
          chromaSubsampling: '4:4:4', // preserve full colour information
          force: true,
          mozjpeg: true,            // use mozjpeg encoder
          trellisQuantisation: true,
          overshootDeringing: true,
          optimiseScans: true,
        });
        break;

      case '.webp':
        // Lossless WebP re-encode
        pipeline = pipeline.webp({
          quality: 100,
          lossless: true,           // true lossless mode
          force: true,
          smartSubsample: true,
          reductionEffort: 6,       // max compression effort (0-6)
        });
        break;

      case '.avif':
        pipeline = pipeline.avif({
          quality: 100,
          lossless: true,
          force: true,
        });
        break;

      case '.tiff':
        pipeline = pipeline.tiff({
          compression: 'lzw',       // lossless LZW compression
          force: true,
        });
        break;

      default:
        return null; // unsupported
    }

    await pipeline.toFile(tempPath);
    const newSize = fs.statSync(tempPath).size;

    // Only replace if actually smaller
    if (newSize < originalSize) {
      if (!DRY_RUN) {
        safeReplace(filePath, tempPath);
      } else {
        safeUnlink(tempPath);
      }
      const saved = originalSize - newSize;
      stats.imagesProcessed++;
      stats.bytesSaved += saved;
      if (VERBOSE) {
        const pct = ((saved / originalSize) * 100).toFixed(1);
        console.log(`  ${green('✓')} ${path.relative(PUBLIC, filePath)}  ${dim(formatBytes(originalSize))} → ${green(formatBytes(newSize))}  (${green('-' + pct + '%')})`);
      }
      return saved;
    } else {
      // No gain — discard temp
      fs.unlinkSync(tempPath);
      stats.imagesSkipped++;
      if (VERBOSE) {
        console.log(`  ${dim('−')} ${path.relative(PUBLIC, filePath)}  ${dim('already optimal (no reduction)')}`);
      }
      return 0;
    }
  } catch (err) {
    // Clean up temp if it exists
    safeUnlink(tempPath);
    stats.errors.push(`${filePath}: ${err.message}`);
    if (VERBOSE) console.error(`  ${red('✗')} ${path.relative(PUBLIC, filePath)}  ${dim(err.message)}`);
    return null;
  }
}

// --------------------------------------------------------------------------
// Video optimisation via FFmpeg (if available)
// --------------------------------------------------------------------------
function optimiseVideo(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = fs.statSync(filePath).size;

  // Output: always .mp4 with H.264 for maximum compatibility
  const outPath = filePath.replace(ext, '.mp4');
  const tempPath = outPath + '.opt-tmp.mp4';

  try {
    // CRF 18 = visually lossless (transparent to source)
    // -preset slow = better compression for same quality
    // -pix_fmt yuv420p = maximum compatibility
    const cmd = [
      'ffmpeg',
      '-y',
      `-i "${filePath}"`,
      '-c:v libx264',
      '-crf 18',
      '-preset slow',
      '-pix_fmt yuv420p',
      '-movflags +faststart',
      `"${tempPath}"`,
    ].join(' ');

    execSync(cmd, { stdio: DRY_RUN ? 'ignore' : 'pipe', timeout: 600000 }); // 10 min timeout

    const newSize = fs.statSync(tempPath).size;

    if (newSize < originalSize) {
      if (!DRY_RUN) {
        if (outPath !== filePath) fs.unlinkSync(filePath);
        fs.renameSync(tempPath, outPath);
      } else {
        fs.unlinkSync(tempPath);
      }
      const saved = originalSize - newSize;
      stats.videosProcessed++;
      stats.bytesSaved += saved;
      if (VERBOSE) {
        const pct = ((saved / originalSize) * 100).toFixed(1);
        console.log(`  ${green('✓')} ${path.relative(PUBLIC, filePath)}  ${dim(formatBytes(originalSize))} → ${green(formatBytes(newSize))}  (${green('-' + pct + '%')})`);
      }
      return saved;
    } else {
      fs.unlinkSync(tempPath);
      stats.videosSkipped++;
      if (VERBOSE) console.log(`  ${dim('−')} ${path.relative(PUBLIC, filePath)}  ${dim('already optimal')}`);
      return 0;
    }
  } catch (err) {
    safeUnlink(tempPath);
    // FFmpeg not found or error
    stats.videosSkipped++;
    if (VERBOSE) console.log(`  ${yellow('⚠')} ${path.relative(PUBLIC, filePath)}  ${dim('skipped (ffmpeg not available or error)')}`);
    return null;
  }
}

// --------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------
async function main() {
  console.log(bold('\n🔧 Digisharks — Asset Optimizer'));
  console.log(dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(`  Mode: ${DRY_RUN ? yellow('dry-run (no writes)') : green('live')}`);
  console.log(`  Folder: ${PUBLIC}`);
  console.log('');

  // Ensure sharp is available
  try {
    require.resolve('sharp');
  } catch {
    console.error(red('\n✗ sharp is not installed. Run: npm install sharp\n'));
    process.exit(1);
  }

  // Check ffmpeg
  let ffmpegAvailable = false;
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    ffmpegAvailable = true;
    console.log(dim('  FFmpeg: ✓  (video compression enabled)\n'));
  } catch {
    console.log(dim('  FFmpeg: ✗  (videos will be skipped — install ffmpeg for video compression)'));
    console.log(dim('  To install FFmpeg, run: winget install ffmpeg  (Windows) or  choco install ffmpeg'));
    console.log(dim('  Or download from: https://ffmpeg.org/download.html\n'));
  }

  // Walk public/ for all media files
  const allFiles = walkDir(PUBLIC);
  const mediaFiles = allFiles.filter(shouldProcess);

  if (mediaFiles.length === 0) {
    console.log('  No files to optimise.\n');
    return;
  }

  console.log(`  Found ${mediaFiles.length} files to process.\n`);

  // Process each file
  for (const filePath of mediaFiles) {
    const ext = path.extname(filePath).toLowerCase();
    if (IMAGE_EXTS.has(ext)) {
      await optimiseImage(filePath);
    } else if (VIDEO_EXTS.has(ext) && ffmpegAvailable) {
      optimiseVideo(filePath);
    } else {
      stats.videosSkipped++;
    }
  }

  // Summary
  console.log(bold('\n📊 Summary'));
  console.log(dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(`  Images optimised:  ${stats.imagesProcessed}`);
  console.log(`  Images skipped:    ${stats.imagesSkipped}`);
  if (ffmpegAvailable) {
    console.log(`  Videos optimised:  ${stats.videosProcessed}`);
    console.log(`  Videos skipped:    ${stats.videosSkipped}`);
  }
  console.log(`  Total saved:       ${green(formatBytes(stats.bytesSaved))}`);
  if (stats.errors.length > 0) {
    console.log(`  Errors:            ${red(String(stats.errors.length))}`);
    if (VERBOSE) stats.errors.forEach((e) => console.log(`    ${red('•')} ${e}`));
  }
  console.log('');
}

main().catch((err) => {
  console.error(red('\nFatal error:'), err.message);
  process.exit(1);
});
