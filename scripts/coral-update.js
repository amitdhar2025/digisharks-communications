/**
 * Update coral hex values to match user's spec:
 *   Old coral: #FF7C60 → New coral: #FB7185
 *   Old coral-soft: #FF9B85 → New coral-soft: #FDA4AF
 *   Old rgba(255,124,96,...) → rgba(251,113,133,...)
 */

const fs = require('fs');
const path = require('path');

const projectRoot = 'C:\\DG\\digisharks-communications';

const filesToProcess = [
  'src/app/multi-color.css',
  'src/app/(public)/portfolio/page.tsx',
  'src/app/admin/blog/categories/page.tsx',
  'src/components/admin/BlogForm.tsx',
];

const replacements = [
  // Hex values
  { from: /#FF7C60/g, to: '#FB7185' },
  { from: /#FF9B85/g, to: '#FDA4AF' },
  // rgba values
  { from: /rgba\(255,\s*124,\s*96,/g, to: 'rgba(251, 113, 133,' },
];

let total = 0;

for (const relPath of filesToProcess) {
  const fullPath = path.join(projectRoot, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP: ${relPath}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  let changes = 0;

  for (const { from, to } of replacements) {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      changes += matches.length;
    }
  }

  if (changes > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`UPDATED: ${relPath} (${changes})`);
    total += changes;
  }
}

console.log(`\nTotal: ${total} replacements`);
