/**
 * Replace hardcoded pink/magenta color references with Electric Indigo equivalents
 * across all CSS and TSX files.
 *
 * Mapping:
 *   Pink accent (#E91E8C = rgb(224,67,111))  → Indigo (#4F46E5 = rgb(79,70,229))
 *   Dark pink (#B5179E = rgb(181,23,158))     → Violet (#7C3AED = rgb(124,58,237))
 *   Dark magenta (#BE285A = rgb(190,40,90))   → Accent-dark (#312E81 = rgb(49,46,129))
 *   Soft pink (#FF6FA5 = rgb(255,111,165))    → Accent-soft (#6366F1 = rgb(99,102,241))
 *   Blush (#FCE7EF = rgb(252,231,239))        → Indigo tint (#EEF2FF = rgb(238,242,255))
 *   Dark pink-brown (#781E3C = rgb(120,30,60))→ Navy (#1E1B4B = rgb(30,27,75))
 *   Magenta (#E91E8C/233,30,140)              → Accent (#4F46E5 = rgb(79,70,229))
 *   Pink-red (#DB2777 = rgb(219,39,119))      → Accent-soft (#6366F1 = rgb(99,102,241))
 *   Light pink (#F8DCE8 = rgb(248,220,232))   → Indigo tint (#EEF2FF = rgb(238,242,255))
 *   Very light pink (#FDEFE4 → #FDEFE4 → #EEF2FF)
 *
 * Hex values:
 *   #E91E8C → #4F46E5
 *   #C2185B → #312E81
 *   #F06292 → #6366F1
 *   #D946EF → #7C3AED
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = 'C:\\DG\\digisharks-communications';

const filesToProcess = [
  // CSS files
  'src/app/home.css',
  'src/app/services.css',
  'src/app/multi-color.css',
  'src/app/(public)/portfolio/portfolio.css',
  'src/app/(public)/blog/blog.css',
  'src/app/(public)/dp.css',
  // TSX files with hardcoded colors
  'src/app/(public)/portfolio/page.tsx',
  'src/app/(public)/digital-products/[slug]/ProductDetailView.tsx',
  'src/app/(public)/digital-products/[slug]/page.tsx',
  'src/app/admin/blog/categories/page.tsx',
  'src/components/admin/BlogForm.tsx',
];

// Replacement rules
const rgbaReplacements = [
  // Order matters: more specific/longer patterns first
  // Pink accent (224,67,111) → Indigo (79,70,229)
  { from: /rgba\(224,67,111,/g, to: 'rgba(79,70,229,' },
  // Dark pink (181,23,158) → Violet (124,58,237)  
  { from: /rgba\(181,23,158,/g, to: 'rgba(124,58,237,' },
  // Dark magenta (190,40,90) → Accent-dark (49,46,129)
  { from: /rgba\(190,40,90,/g, to: 'rgba(49,46,129,' },
  // Soft pink (255,111,165) → Accent-soft (99,102,241)
  { from: /rgba\(255,111,165,/g, to: 'rgba(99,102,241,' },
  // Blush (252,231,239) → Indigo tint (238,242,255)
  { from: /rgba\(252,231,239,/g, to: 'rgba(238,242,255,' },
  // Dark pink-brown (120,30,60) → Navy (30,27,75)
  { from: /rgba\(120,30,60,/g, to: 'rgba(30,27,75,' },
  // Magenta (233,30,140) → Accent (79,70,229)
  { from: /rgba\(233,30,140,/g, to: 'rgba(79,70,229,' },
  // Pink-red (219,39,119) → Accent-soft (99,102,241)
  { from: /rgba\(219,39,119,/g, to: 'rgba(99,102,241,' },
  // Light pink blush (248,220,232) → Indigo tint (238,242,255)
  { from: /rgba\(248,220,232,/g, to: 'rgba(238,242,255,' },
  // Very light pink (253,239,244) → Indigo tint (238,242,255)
  { from: /rgba\(253,239,244,/g, to: 'rgba(238,242,255,' },
  // Extra: 255,200,87 (gold) - SKIP, it's alert bar
  // Extra: 37,211,102 (whatsapp green) - SKIP
  // Extra: 251,191,36 (amber) - SKIP
  // Extra: 245,158,11 (amber/orange) - SKIP
  // Extra: 14,165,233 (sky blue) - SKIP
  // Extra: 163,230,53 (lime) - SKIP
  // Extra: 251,113,133 (rose) - SKIP
  // Extra: 248,220,232 (F8DCE8 light pink) already handled
  // pink rgba(124,58,237 → this is already violet, SKIP
];

const hexReplacements = [
  { from: /#E91E8C/g, to: '#4F46E5' },
  { from: /#C2185B/g, to: '#312E81' },
  { from: /#F06292/g, to: '#6366F1' },
  { from: /#D946EF/g, to: '#7C3AED' },
  { from: /#DB2777/g, to: '#6366F1' }, // pink-red → accent-soft
  // The alert bar uses different pink shades - handle those carefully
  { from: /#E91E63/g, to: '#4F46E5' }, // slightly different pink
  { from: /#AD1457/g, to: '#312E81' }, // dark pink
];

let totalReplacements = 0;

for (const relPath of filesToProcess) {
  const fullPath = path.join(projectRoot, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP (not found): ${relPath}`);
    continue;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;
  let fileChanges = 0;
  
  // Apply rgba replacements
  for (const { from, to } of rgbaReplacements) {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      fileChanges += matches.length;
    }
  }
  
  // Apply hex replacements
  for (const { from, to } of hexReplacements) {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      fileChanges += matches.length;
    }
  }
  
  if (fileChanges > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`UPDATED: ${relPath} (${fileChanges} replacements)`);
    totalReplacements += fileChanges;
  } else {
    console.log(`NO CHANGES: ${relPath}`);
  }
}

console.log(`\nTotal: ${totalReplacements} replacements across ${filesToProcess.length} files`);
