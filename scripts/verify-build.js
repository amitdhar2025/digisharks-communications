// One-shot script: run npm run build and stream the result.
const { execSync } = require('child_process');

try {
  const out = execSync('npm run build', {
    cwd: 'c:/DG/digisharks-communications',
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 50 * 1024 * 1024,
  });
  console.log(out);
  console.log('=== BUILD SUCCEEDED ===');
} catch (e) {
  console.log('STDOUT:');
  console.log(e.stdout || '');
  console.log('STDERR:');
  console.log(e.stderr || '');
  console.log('Exit code:', e.status);
  process.exit(1);
}
