import { readFileSync, writeFileSync } from 'fs';

let css = readFileSync('src/app/home.css', 'utf8');
let count = 0;

// 1. Remove body::after (grain texture), .mesh-grid, .orb CSS and their keyframes
// These are dark-theme decorations that look wrong on light background
let patterns = [
  [/body::after[\s\S]*?@keyframes grainShift[\s\S]*?\}\n/g, ''],
  [/\.mesh-grid[\s\S]*?@keyframes gridShift[\s\S]*?\}\n/g, ''],
  [/\.orb[\s\S]*?@keyframes orbFloat[\s\S]*?\}\n/g, ''],
];

for (const [pattern, replacement] of patterns) {
  const before = css.length;
  css = css.replace(pattern, replacement);
  if (css.length !== before) count++;
}

// 2. Fix nav - white bg instead of dark
css = css.replace(
  /nav\{position:fixed;top:0;left:0;right:0;z-index:150;padding:0 5%;height:74px;display:flex;align-items:center;justify-content:space-between;transition:all .35s cubic-bezier\(.4,0,.2,1\);background:rgba\(5,6,13,.85\);backdrop-filter:blur\(18px\) saturate\(180%\);border-bottom:1px solid var\(--border\);box-shadow:0 4px 30px rgba\(0,0,0,.35\)\}/,
  'nav{position:fixed;top:0;left:0;right:0;z-index:150;padding:0 5%;height:74px;display:flex;align-items:center;justify-content:space-between;transition:all .35s cubic-bezier(.4,0,.2,1);background:rgba(255,255,255,.95);backdrop-filter:blur(18px);border-bottom:1px solid var(--color-border);box-shadow:var(--shadow-nav)}'
);
css = css.replace(
  /nav\.scrolled,nav\.menu-open\{background:rgba\(11,13,24,.96\);backdrop-filter:blur\(24px\) saturate\(200%\);border-bottom-color:rgba\(0,229,255,.35\);box-shadow:0 8px 36px rgba\(0,0,0,.5\),0 0 24px rgba\(0,229,255,.08\)\}/,
  'nav.scrolled,nav.menu-open{background:rgba(255,255,255,.98);backdrop-filter:blur(24px);border-bottom-color:var(--color-border-strong);box-shadow:0 4px 24px rgba(30,42,74,.12)}'
);

// 3. Fix nav-logo - remove gradient text, use navy
css = css.replace(
  /\.nav-logo\{font-family:var\(--font-syne\),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:1\.5rem;font-weight:800;background:linear-gradient\(135deg,var\(--cyan\),var\(--violet\) 50%,var\(--pink\)\);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-decoration:none;letter-spacing:-\.5px;position:relative;background-size:200% 200%;animation:gradientShift 6s ease infinite\}/,
  '.nav-logo{font-family:var(--font-heading),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:1.5rem;font-weight:800;color:var(--color-navy);text-decoration:none;letter-spacing:-.5px;position:relative}'
);

// 4. Fix nav-links hover/active - orange instead of cyan
css = css.replace(
  /\.nav-links a\{color:var\(--muted\);text-decoration:none;font-size:\.9rem;font-weight:500;transition:color \.25s,text-shadow \.25s;position:relative\}\n\.nav-links a:hover,\.nav-links a\.active\{color:var\(--cyan\);text-shadow:0 0 20px rgba\(0,229,255,\.4\)\}\n\.nav-links a\.active::after\{content:'';position:absolute;bottom:-6px;left:0;right:0;height:2px;background:linear-gradient\(90deg,var\(--cyan\),var\(--violet\)\);border-radius:2px;box-shadow:0 0 10px rgba\(0,229,255,\.6\)\}\n\.btn-nav\{padding:\.55rem 1\.25rem;border:1\.5px solid var\(--cyan\);border-radius:var\(--r-btn\);color:var\(--cyan\);background:transparent;font-family:var\(--font-dm-sans\),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:\.85rem;font-weight:600;cursor:pointer;transition:all \.25s;text-decoration:none\}\n\.btn-nav:hover\{background:var\(--cyan\);color:#05060d;box-shadow:0 0 24px rgba\(0,229,255,\.5\)\}/,
  '.nav-links a{color:var(--color-navy);text-decoration:none;font-size:.9rem;font-weight:500;transition:color .2s;position:relative}\n.nav-links a:hover,.nav-links a.active{color:var(--color-orange)}\n.nav-links a.active::after{content:\'\';position:absolute;bottom:-6px;left:0;right:0;height:2px;background:var(--color-orange);border-radius:2px}\n.btn-nav{padding:.55rem 1.25rem;border:1.5px solid var(--color-navy);border-radius:var(--radius-btn);color:var(--color-navy);background:transparent;font-family:var(--font-body),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s;text-decoration:none}\n.btn-nav:hover{background:var(--color-orange);border-color:var(--color-orange);color:#ffffff;box-shadow:var(--shadow-button)}'
);

// 5. Fix hamburger - navy bars, orange active
css = css.replace(
  /\.hamburger\{display:none;flex-direction:column;gap:5px;cursor:pointer;background:rgba\(255,255,255,\.04\);border:1px solid var\(--border2\);border-radius:8px;padding:10px;z-index:160;position:relative;width:44px;height:44px;align-items:center;justify-content:center;transition:all \.25s\}\n\.hamburger:hover\{background:rgba\(0,229,255,\.08\);border-color:var\(--cyan\)\}\n\.hamburger span\{display:block;width:22px;height:2px;background:var\(--text\);border-radius:2px;transition:all \.3s\}\n\.hamburger\.open\{background:rgba\(0,229,255,\.12\);border-color:var\(--cyan\)\}\n\.hamburger\.open span:nth-child\(1\)\{transform:translateY\(7px\) rotate\(45deg\);background:var\(--cyan\)\}\n\.hamburger\.open span:nth-child\(2\)\{opacity:0\}\n\.hamburger\.open span:nth-child\(3\)\{transform:translateY\(-7px\) rotate\(-45deg\);background:var\(--cyan\)\}/,
  '.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;background:var(--color-surface-alt);border:1px solid var(--color-border);border-radius:8px;padding:10px;z-index:160;position:relative;width:44px;height:44px;align-items:center;justify-content:center;transition:all .25s}\n.hamburger:hover{background:rgba(255,107,71,.08);border-color:var(--color-orange)}\n.hamburger span{display:block;width:22px;height:2px;background:var(--color-navy);border-radius:2px;transition:all .3s}\n.hamburger.open{background:rgba(255,107,71,.12);border-color:var(--color-orange)}\n.hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);background:var(--color-orange)}\n.hamburger.open span:nth-child(2){opacity:0}\n.hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);background:var(--color-orange)}'
);

// 6. Fix mobile menu - light background
css = css.replace(
  /\.mobile-menu\{position:fixed;inset:0;background:rgba\(5,6,13,\.98\);z-index:140;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:110px 5% 2rem;gap:\.4rem;opacity:0;pointer-events:none;transition:opacity \.3s;overflow-y:auto;backdrop-filter:blur\(20px\)\}/,
  '.mobile-menu{position:fixed;inset:0;background:rgba(255,255,255,.98);z-index:140;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:110px 5% 2rem;gap:.4rem;opacity:0;pointer-events:none;transition:opacity .3s;overflow-y:auto}'
);

// 7. Fix mobile menu links - navy text, orange hover
css = css.replace(
  /\.mobile-menu a\{font-family:var\(--font-syne\),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:1\.25rem;font-weight:700;color:var\(--text\);text-decoration:none;transition:color \.2s,padding-left \.2s;padding:\.65rem 0;width:100%;text-align:center;letter-spacing:\.01em;position:relative\}\n\.mobile-menu a:not\(:last-child\)\{border-bottom:1px solid rgba\(255,255,255,\.05\)\}\n\.mobile-menu a:hover,\.mobile-menu a\.active\{color:var\(--cyan\);padding-left:8px\}\n\.mobile-menu a\.btn-primary\{margin-top:1rem;width:auto;min-width:220px;justify-content:center;border-bottom:none;padding:\.8rem 2rem\}/,
  '.mobile-menu a{font-family:var(--font-heading),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:1.25rem;font-weight:700;color:var(--color-navy);text-decoration:none;transition:color .2s,padding-left .2s;padding:.65rem 0;width:100%;text-align:center;letter-spacing:.01em;position:relative}\n.mobile-menu a:not(:last-child){border-bottom:1px solid rgba(30,42,74,.08)}\n.mobile-menu a:hover,.mobile-menu a.active{color:var(--color-orange);padding-left:8px}\n.mobile-menu a.btn-primary{margin-top:1rem;width:auto;min-width:220px;justify-content:center;border-bottom:none;padding:.8rem 2rem}'
);

// 8. Fix buttons - solid orange, no gradients
css = css.replace(
  /\.btn-primary\{display:inline-flex;align-items:center;gap:\.5rem;padding:\.85rem 2rem;background:linear-gradient\(135deg,var\(--cyan\),var\(--violet\) 60%,var\(--pink\)\);background-size:200% 200%;color:#05060d;border:none;border-radius:var\(--r-btn\);font-family:var\(--font-dm-sans\),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:\.95rem;font-weight:700;cursor:pointer;transition:all \.3s;text-decoration:none;position:relative;overflow:hidden;animation:btnShine 6s ease infinite\}\n@keyframes btnShine\{0%,100%\{background-position:0% 50%\}50%\{background-position:100% 50%\}\}\n\.btn-primary::before\{content:'';position:absolute;inset:0;background:linear-gradient\(120deg,transparent 30%,rgba\(255,255,255,\.4\) 50%,transparent 70%\);transform:translateX\(-100%\);transition:transform \.6s\}\n\.btn-primary:hover\{transform:translateY\(-2px\) scale\(1\.02\);box-shadow:0 0 32px rgba\(0,229,255,\.45\),0 8px 24px rgba\(139,92,246,\.3\)\}\n\.btn-primary:hover::before\{transform:translateX\(100%\)\}\n\.btn-primary:active\{transform:translateY\(0\) scale\(\.98\)\}\n\.btn-outline\{display:inline-flex;align-items:center;gap:\.5rem;padding:\.85rem 2rem;background:rgba\(255,255,255,\.02\);color:var\(--text\);border:1\.5px solid var\(--border2\);border-radius:var\(--r-btn\);font-family:var\(--font-dm-sans\),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:\.95rem;font-weight:600;cursor:pointer;transition:all \.3s;text-decoration:none;position:relative;overflow:hidden\}\n\.btn-outline:hover\{border-color:var\(--cyan\);color:var\(--cyan\);background:rgba\(0,229,255,\.06\);transform:translateY\(-2px\);box-shadow:0 8px 24px rgba\(0,229,255,\.15\)\}/,
  '/* ===== BUTTONS ===== */\n.btn-primary{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 2rem;background:var(--color-orange);color:#ffffff;border:none;border-radius:var(--radius-btn);font-family:var(--font-body),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .2s;text-decoration:none;position:relative;overflow:hidden;box-shadow:var(--shadow-button)}\n.btn-primary:hover{transform:translateY(-2px) scale(1.02);box-shadow:var(--shadow-button-hover)}\n.btn-primary:active{transform:translateY(0) scale(.98)}\n.btn-outline{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 2rem;background:transparent;color:var(--color-navy);border:1.5px solid var(--color-border-strong);border-radius:var(--radius-btn);font-family:var(--font-body),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:.95rem;font-weight:600;cursor:pointer;transition:all .2s;text-decoration:none}\n.btn-outline:hover{border-color:var(--color-orange);color:var(--color-orange);background:rgba(255,107,71,.06);transform:translateY(-2px);box-shadow:0 4px 14px rgba(255,107,71,.15)}'
);

// 9. Fix section-label - solid orange
css = css.replace(
  /\.section-label\{display:inline-flex;align-items:center;gap:\.75rem;font-size:\.8rem;font-weight:700;letter-spacing:\.12em;text-transform:uppercase;background:linear-gradient\(135deg,var\(--cyan\),var\(--violet\)\);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:1\.2rem;position:relative\}\n\.section-label::before\{content:'';width:32px;height:2px;background:linear-gradient\(90deg,var\(--cyan\),var\(--violet\)\);display:block;box-shadow:0 0 8px rgba\(0,229,255,\.5\)\}/,
  '.section-label{display:inline-flex;align-items:center;gap:.75rem;font-size:.8rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--color-orange);margin-bottom:1.2rem;position:relative}\n.section-label::before{content:\'\';width:32px;height:2px;background:var(--color-orange);display:block}'
);

// 10. Fix hero section
css = css.replace(
  /\.hero-eyebrow\{display:inline-flex;align-items:center;gap:\.75rem;padding:\.5rem 1\.3rem;background:linear-gradient\(135deg,rgba\(0,229,255,\.12\),rgba\(139,92,246,\.1\)\);border:1px solid rgba\(0,229,255,\.35\);border-radius:50px;font-size:\.8rem;font-weight:700;letter-spacing:\.1em;text-transform:uppercase;color:var\(--cyan\);margin-bottom:2rem;box-shadow:0 0 28px rgba\(0,229,255,\.18\),inset 0 0 14px rgba\(0,229,255,\.06\);position:relative;overflow:hidden\}\n\.hero-eyebrow::before\{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient\(90deg,transparent,rgba\(0,229,255,\.3\),transparent\);animation:eyebrowShine 3s ease-in-out infinite\}\n@keyframes eyebrowShine\{0%\{left:-100%\}50%\{left:100%\}100%\{left:100%\}\}\n\.eyebrow-dot\{width:8px;height:8px;border-radius:50%;background:var\(--cyan\);box-shadow:0 0 12px var\(--cyan\);animation:pulse 1\.5s ease-in-out infinite\}\n\.hero h1 span\{color:var\(--cyan\)\}\n\.hero-visual-card\{width:100%;background:linear-gradient\(135deg,rgba\(15,16,24,\.85\),rgba\(22,24,33,\.85\)\);border:1px solid var\(--border\);border-radius:22px;padding:1\.7rem 1\.35rem;box-shadow:0 30px 90px rgba\(0,0,0,\.5\),0 0 60px rgba\(0,229,255,\.08\);backdrop-filter:blur\(10px\);overflow:hidden;position:relative;animation:cardFloat 6s ease-in-out infinite\}\n@keyframes cardFloat\{0%,100%\{transform:translateY\(0\)\}50%\{transform:translateY\(-8px\)\}\}\n\.hero-visual-card::before\{content:'';position:absolute;inset:-2px;background:linear-gradient\(135deg,rgba\(0,229,255,\.4\),rgba\(139,92,246,\.32\),rgba\(244,114,182,\.24\)\);opacity:\.25;filter:blur\(18px\);z-index:-1\}\n\.hero-visual-topline\{height:3px;border-radius:99px;background:linear-gradient\(90deg,var\(--cyan\),var\(--violet\),var\(--pink\)\);margin:-\.35rem -1\.35rem 1\.1rem;background-size:200% 200%;animation:gradientShift 4s ease infinite\}\n\.hero-visual-glow\{position:absolute;width:220px;height:220px;border-radius:50%;filter:blur\(40px\);opacity:\.3;animation:orbFloat 15s ease-in-out infinite\}\n\.hero-glow-1\{top:25%;right:-40px;background:radial-gradient\(circle,rgba\(0,229,255,\.55\),transparent 60%\)\}\n\.hero-glow-2\{bottom:-30px;left:-70px;background:radial-gradient\(circle,rgba\(139,92,246,\.45\),transparent 60%\);animation-delay:-5s\}\n\.hero p\{font-size:1\.1rem;color:var\(--muted\);max-width:640px;margin:0 0 2\.5rem;line-height:1\.75;text-align:left\}/,
  '.hero-eyebrow{display:inline-flex;align-items:center;gap:.75rem;padding:.5rem 1.3rem;background:rgba(255,107,71,.08);border:1px solid rgba(255,107,71,.25);border-radius:50px;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--color-orange);margin-bottom:2rem;position:relative}\n.eyebrow-dot{width:8px;height:8px;border-radius:50%;background:var(--color-orange);box-shadow:0 0 12px var(--color-orange);animation:pulse 1.5s ease-in-out infinite}\n.hero h1 span{color:var(--color-orange)}\n.hero-visual-card{width:100%;background:var(--color-surface);border:1px solid var(--color-border);border-radius:22px;padding:1.7rem 1.35rem;box-shadow:var(--shadow-card),0 4px 24px rgba(30,42,74,.08);overflow:hidden;position:relative}\n.hero-visual-card::before{content:\'\';position:absolute;inset:-2px;background:linear-gradient(135deg,rgba(255,107,71,.25),rgba(99,102,241,.18));opacity:.35;filter:blur(14px);z-index:-1}\n.hero-visual-topline{height:3px;border-radius:99px;background:var(--color-orange);margin:-.35rem -1.35rem 1.1rem}\n.hero-visual-glow{display:none}\n.hero p{font-size:1.1rem;color:var(--color-text-muted);max-width:640px;margin:0 0 2.5rem;line-height:1.75;text-align:left}'
);

// 11. Fix stats
css = css.replace(
  /\.stats-row\{display:grid;grid-template-columns:repeat\(4,1fr\);gap:1px;background:var\(--border\);border:1px solid var\(--border\);border-radius:var\(--r-card\);overflow:hidden;max-width:760px;margin:0\}\n\.stat-item\{background:linear-gradient\(180deg,var\(--surface\),var\(--surface2\)\);padding:1\.5rem 1rem;text-align:center;position:relative;transition:all \.3s\}\n\.stat-item:hover\{background:linear-gradient\(180deg,var\(--surface2\),rgba\(0,229,255,\.05\)\)\}\n\.stat-num\{font-family:var\(--font-syne\),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:1\.8rem;font-weight:800;background:linear-gradient\(135deg,var\(--cyan\),var\(--violet\)\);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:block;background-size:200% 200%;animation:gradientShift 4s ease infinite\}\n\.stat-label\{font-size:\.8rem;color:var\(--muted\);margin-top:\.25rem\}/,
  '.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--color-border);border:1px solid var(--color-border);border-radius:var(--radius-card);overflow:hidden;max-width:760px;margin:0}\n.stat-item{background:var(--color-surface);padding:1.5rem 1rem;text-align:center;position:relative;transition:all .3s}\n.stat-item:hover{background:var(--color-surface-alt)}\n.stat-num{font-family:var(--font-heading),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:1.8rem;font-weight:800;color:var(--color-orange);display:block}\n.stat-label{font-size:.8rem;color:var(--color-text-muted);margin-top:.25rem}'
);

// 12. Fix hero-visual-title and hero-visual-sub
css = css.replace(
  /\.hero-visual-title\{font-family:var\(--font-syne\),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-weight:800;font-size:1\.6rem;line-height:1\.1;margin-bottom:\.65rem\}/,
  '.hero-visual-title{font-family:var(--font-heading),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-weight:700;font-size:1.4rem;line-height:1.2;margin-bottom:.65rem;color:var(--color-navy)}'
);
css = css.replace(
  /\.hero-visual-sub\{color:var\(--muted\);font-size:\.9rem;line-height:1\.6;margin-bottom:1\.25rem;text-align:left\}/,
  '.hero-visual-sub{color:var(--color-text-muted);font-size:.9rem;line-height:1.6;margin-bottom:1.25rem;text-align:left}'
);

// 13. Fix hero-badge
css = css.replace(
  /\.hero-badge\{padding:\.45rem \.7rem;border-radius:999px;border:1px solid var\(--border2\);background:rgba\(255,255,255,\.03\);color:var\(--text\);font-size:\.78rem;font-weight:700;transition:all \.25s\}\n\.hero-badge:hover\{background:rgba\(0,229,255,\.1\);border-color:rgba\(0,229,255,\.4\);transform:translateY\(-2px\)\}/,
  '.hero-badge{padding:.45rem .7rem;border-radius:999px;border:1px solid var(--color-border);background:var(--color-surface-alt);color:var(--color-text-muted);font-size:.78rem;font-weight:600;transition:all .25s}\n.hero-badge:hover{background:rgba(255,107,71,.08);border-color:rgba(255,107,71,.3);color:var(--color-orange);transform:translateY(-2px)}'
);

// 14. Fix progress bars
css = css.replace(
  /\.progress-bar\{height:10px;border-radius:999px;background:rgba\(255,255,255,\.04\);border:1px solid var\(--border\);overflow:hidden;margin-bottom:\.9rem;position:relative\}\n\.progress-fill\{height:100%;background:linear-gradient\(90deg,var\(--cyan\),var\(--violet\),var\(--pink\)\);border-radius:999px;box-shadow:0 0 30px rgba\(0,229,255,\.3\);position:relative;background-size:200% 100%;animation:progressShine 3s linear infinite\}\n@keyframes progressShine\{0%\{background-position:0% 0\}100%\{background-position:200% 0\}\}\n\.progress-fill-2\{background:linear-gradient\(90deg,var\(--pink\),var\(--amber\)\);box-shadow:0 0 30px rgba\(244,114,182,\.25\)\}\n\.progress-num\{font-family:var\(--font-syne\),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var\(--text\);font-weight:800\}\n\.progress-row\{display:flex;align-items:center;justify-content:space-between;font-size:\.82rem;color:var\(--muted\);margin-bottom:\.55rem\}/,
  '.progress-bar{height:10px;border-radius:999px;background:var(--color-surface-alt);border:1px solid var(--color-border);overflow:hidden;margin-bottom:.9rem;position:relative}\n.progress-fill{height:100%;background:var(--color-orange);border-radius:999px;box-shadow:0 0 12px rgba(255,107,71,.3);position:relative}\n.progress-fill-2{background:var(--color-indigo)}\n.progress-num{font-family:var(--font-heading),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--color-navy);font-weight:800}\n.progress-row{display:flex;align-items:center;justify-content:space-between;font-size:.82rem;color:var(--color-text-muted);margin-bottom:.55rem}'
);

// 15. Fix gradient-text and ai-gradient-text classes
css = css.replace(
  /\.gradient-text\{background:linear-gradient\(135deg,var\(--cyan\) 0%,var\(--violet\) 50%,var\(--pink\) 100%\);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;position:relative;background-size:200% 200%;animation:gradientShift 6s ease infinite\}\n\.ai-gradient-text\{background:linear-gradient\(135deg,var\(--emerald\) 0%,var\(--cyan\) 50%,var\(--violet\) 100%\);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200% 200%;animation:gradientShift 5s ease infinite\}/,
  '.gradient-text{color:var(--color-orange);-webkit-text-fill-color:var(--color-orange);background:none;-webkit-background-clip:unset;background-clip:unset;animation:none}\n.ai-gradient-text{color:var(--color-orange);-webkit-text-fill-color:var(--color-orange);background:none;-webkit-background-clip:unset;background-clip:unset;animation:none}'
);

// 16. Fix typography
css = css.replace(
  /h1,h2,h3,h4\{font-family:var\(--font-syne\),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1\.15;color:var\(--text\)\}\nh1\{font-size:2\.5rem;font-weight:800;letter-spacing:-\.02em\}\nh2\{font-size:clamp\(1\.8rem,4vw,2\.9rem\);font-weight:700;letter-spacing:-\.02em\}\nh3\{font-size:1\.15rem;font-weight:700\}\n\.text-muted\{color:var\(--muted\)\}\n\.container\{max-width:1200px;margin:0 auto\}/,
  'h1,h2,h3,h4{font-family:var(--font-heading),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--color-navy)}\nh1{font-size:2.5rem;font-weight:800;letter-spacing:-.02em}\nh2{font-size:clamp(1.8rem,4vw,2.9rem);font-weight:700;letter-spacing:-.02em}\nh3{font-size:1.15rem;font-weight:700}\n.text-muted{color:var(--color-text-muted)}\n.container{max-width:1200px;margin:0 auto}'
);

// 17. Scroll animations - update timing
css = css.replace(
  /\.js-ready \.fade-up \{ opacity:0; transform:translateY\(40px\); transition:opacity \.8s cubic-bezier\(\.4,0,\.2,1\),transform \.8s cubic-bezier\(\.4,0,\.2,1\) \}/,
  '.js-ready .fade-up{opacity:0;transform:translateY(20px);transition:opacity .6s ease-out,transform .6s ease-out}'
);
css = css.replace(
  /\.fade-left\{opacity:0;transform:translateX\(-40px\);transition:opacity \.8s ease,transform \.8s ease\}/,
  '.fade-left{opacity:0;transform:translateX(-30px);transition:opacity .6s ease-out,transform .6s ease-out}'
);
css = css.replace(
  /\.fade-right\{opacity:0;transform:translateX\(40px\);transition:opacity \.8s ease,transform \.8s ease\}/,
  '.fade-right{opacity:0;transform:translateX(30px);transition:opacity .6s ease-out,transform .6s ease-out}'
);
css = css.replace(
  /\.scale-in\{opacity:0;transform:scale\(\.85\);transition:opacity \.8s ease,transform \.8s ease\}/,
  '.scale-in{opacity:0;transform:scale(.92);transition:opacity .4s ease-out,transform .4s ease-out}'
);

writeFileSync('src/app/home.css', css, 'utf8');
console.log('home.css updated with', count, 'pattern fixes');
