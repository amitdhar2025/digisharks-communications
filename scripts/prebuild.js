/**
 * Prebuild Script
 * =================
 *
 * Runs image conversion scripts (AVIF, WebP, asset optimization) during
 * local development builds, but skips them on Vercel since all images
 * are already optimized and committed to the repository.
 *
 * This avoids the need to install platform-specific sharp binaries
 * (e.g., @img/sharp-linux-x64) on the Vercel build server.
 */

const { execSync } = require('child_process');

if (process.env.VERCEL) {
  console.log('[prebuild] Vercel detected — skipping image conversion (already committed)');
  process.exit(0);
}

console.log('[prebuild] Running image conversion...');

try {
  execSync('npm run convert:avif', { stdio: 'inherit', shell: true });
  execSync('npm run convert:webp', { stdio: 'inherit', shell: true });
  execSync('npm run optimize:assets', { stdio: 'inherit', shell: true });
  console.log('[prebuild] Image conversion complete.');
} catch (err) {
  console.error('[prebuild] Image conversion failed:', err.message);
  process.exit(1);
}
