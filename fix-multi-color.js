const fs = require('fs');

let css = fs.readFileSync('src/app/multi-color.css', 'utf8');
let log = [];

// 1. Remove the old :root block that overrides pink theme vars
const rootStart = css.indexOf(':root{');
if (rootStart >= 0) {
  const rootBlock = css.substring(rootStart, rootStart + 800);
  if (rootBlock.includes('--mc-1:#06b6d4')) {
    const rootEnd = css.indexOf('}', rootStart) + 1;
    css = css.substring(0, rootStart) + css.substring(rootEnd);
    log.push('Removed old :root block with cyan/blue values');
  }
}

// 2. Fix specific #fff -> var(--text) on colored backgrounds
const fixes = [
  // pf-tag on dark bg
  ['.pf-tag{position:absolute;top:14px;left:14px;padding:.3rem .7rem;background:rgba(46,15,27,.55);border:1px solid rgba(120,30,60,.18);border-radius:50px;font-size:.7rem;font-weight:700;color:var(--text);letter-spacing:.06em;text-transform:uppercase;z-index:3;backdrop-filter:blur(8px)}',
   '.pf-tag{position:absolute;top:14px;left:14px;padding:.3rem .7rem;background:rgba(46,15,27,.6);border:1px solid rgba(120,30,60,.18);border-radius:50px;font-size:.7rem;font-weight:700;color:#fff;letter-spacing:.06em;text-transform:uppercase;z-index:3;backdrop-filter:blur(8px)}'],
  // pf-year on dark bg
  ['.pf-year{position:absolute;top:14px;right:14px;padding:.3rem .7rem;background:rgba(46,15,27,.7);border:1px solid rgba(120,30,60,.18);border-radius:50px;font-size:.72rem;font-weight:700;color:var(--text);z-index:3;backdrop-filter:blur(8px)}',
   '.pf-year{position:absolute;top:14px;right:14px;padding:.3rem .7rem;background:rgba(46,15,27,.7);border:1px solid rgba(120,30,60,.18);border-radius:50px;font-size:.72rem;font-weight:700;color:#fff;z-index:3;backdrop-filter:blur(8px)}'],
  // pf-filter active on gradient
  ['.pf-filter.active{background:var(--mc-rainbow);background-size:200% 200%;color:var(--text);border-color:transparent;box-shadow:0 8px 22px rgba(181,23,158,.35);animation:gradientShift 4s ease infinite}',
   '.pf-filter.active{background:var(--mc-rainbow);background-size:200% 200%;color:#fff;border-color:transparent;box-shadow:0 8px 22px rgba(181,23,158,.35);animation:gradientShift 4s ease infinite}'],
  // metric-icon-wrap on pink gradient
  ['.metric-card-ai .metric-icon-wrap{width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:1.7rem;margin-bottom:1.25rem;background:linear-gradient(135deg,var(--c1,#E0436F) 0%,var(--c2,#B5179E) 100%);border:1px solid var(--c1,#E0436F);box-shadow:0 0 24px rgba(224,67,111,.3);transition:all .35s;color:var(--text)}',
   '.metric-card-ai .metric-icon-wrap{width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:1.7rem;margin-bottom:1.25rem;background:linear-gradient(135deg,var(--c1,#E0436F) 0%,var(--c2,#B5179E) 100%);border:1px solid var(--c1,#E0436F);box-shadow:0 0 24px rgba(224,67,111,.3);transition:all .35s;color:#fff}'],
  // shield-mid on red gradient
  ['.shield-mid{font-family:var(--font-syne),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:1.3rem;font-weight:800;color:var(--text);line-height:1}',
   '.shield-mid{font-family:var(--font-syne),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:1.3rem;font-weight:800;color:#fff;line-height:1}'],
  // service-card .service-icon on gradient
  ['.service-card .service-icon{background:linear-gradient(135deg,var(--svc-c1,#E0436F) 0%,var(--svc-c2,#B5179E) 100%)!important;border:1px solid var(--svc-c1,#E0436F)!important;box-shadow:0 0 24px rgba(224,67,111,.25)!important;color:var(--text)}',
   '.service-card .service-icon{background:linear-gradient(135deg,var(--svc-c1,#E0436F) 0%,var(--svc-c2,#B5179E) 100%)!important;border:1px solid var(--svc-c1,#E0436F)!important;box-shadow:0 0 24px rgba(224,67,111,.25)!important;color:#fff}'],
];

for (const [oldStr, newStr] of fixes) {
  if (css.includes(oldStr)) {
    css = css.replace(oldStr, newStr);
    log.push('Fixed: ' + oldStr.substring(0, 50) + '...');
  }
}

// 3. Fix service card fallback colors
const svcFixes = [
  ['var(--svc-c1,#06b6d4)', 'var(--svc-c1,#E0436F)'],
  ['var(--svc-c2,#8b5cf6)', 'var(--svc-c2,#B5179E)'],
  ['var(--svc-c3,#ec4899)', 'var(--svc-c3,#FF6FA5)'],
];
for (const [oldStr, newStr] of svcFixes) {
  if (css.includes(oldStr)) {
    css = css.replaceAll(oldStr, newStr);
    log.push('Fixed svc fallback: ' + oldStr);
  }
}

// 4. Fix metric-spark span::after background
const sparkOld = '.metric-card-ai .metric-spark span::after{content:\'\';position:absolute;top:-2px;left:10%;right:10%;height:2px;background:var(--text);border-radius:99px;opacity:.7;filter:blur(.5px)}';
const sparkNew = '.metric-card-ai .metric-spark span::after{content:\'\';position:absolute;top:-2px;left:10%;right:10%;height:2px;background:#fff;border-radius:99px;opacity:.7;filter:blur(.5px)}';
if (css.includes(sparkOld)) {
  css = css.replace(sparkOld, sparkNew);
  log.push('Fixed spark span::after background');
}

// 5. Fix color-mix to simple rgba
if (css.includes('color-mix(in srgb,var(--c1,#E0436F) 40%,transparent)')) {
  css = css.replaceAll('color-mix(in srgb,var(--c1,#E0436F) 40%,transparent)', 'rgba(224,67,111,.4)');
  log.push('Fixed color-mix to rgba');
}
if (css.includes('color-mix(in srgb,var(--c1,#E0436F) .6%,transparent)')) {
  css = css.replaceAll('color-mix(in srgb,var(--c1,#E0436F) .6%,transparent)', 'rgba(224,67,111,.5)');
  log.push('Fixed color-mix .6% to rgba');
}

// 6. Fix award-card:hover to use var(--award-c1) for per-card glows
const awardHoverOld = '.award-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 30px 80px rgba(190,40,90,.25),0 0 60px rgba(224,67,111,.15)}';
const awardHoverNew = '.award-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 30px 80px rgba(190,40,90,.25),0 0 60px var(--award-c1,rgba(224,67,111,.3))}';
if (css.includes(awardHoverOld)) {
  css = css.replace(awardHoverOld, awardHoverNew);
  log.push('Fixed award-card:hover to use var(--award-c1)');
}

fs.writeFileSync('src/app/multi-color.css', css, 'utf8');
console.log('Done! Fixes applied:');
log.forEach(l => console.log(' - ' + l));
console.log('\nFile length:', css.length);
console.log('Has :root block:', css.includes(':root{'));
console.log('Has #06b6d4:', css.includes('#06b6d4'));
