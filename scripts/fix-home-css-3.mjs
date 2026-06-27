import { readFileSync, writeFileSync } from 'fs';

let css = readFileSync('src/app/home.css', 'utf8');

// Read the full file and make all replacements
let original = css;

// 1. Fix buttons - solid orange, white text
css = css.replace(
  '.btn-primary{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 2rem;background:linear-gradient(135deg,var(--cyan),var(--violet) 60%,var(--pink));background-size:200% 200%;color:#05060d;border:none;border-radius:var(--r-btn);font-family:var(--font-dm-sans),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .3s;text-decoration:none;position:relative;overflow:hidden;animation:btnShine 6s ease infinite}',
  '.btn-primary{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 2rem;background:var(--color-orange);color:#ffffff;border:none;border-radius:var(--radius-btn);font-family:var(--font-body),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .2s ease;text-decoration:none;position:relative;overflow:hidden;box-shadow:var(--shadow-button)}'
);

// 2. Fix btn-primary:hover glow
css = css.replace(
  '.btn-primary:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 0 32px rgba(0,229,255,.45),0 8px 24px rgba(139,92,246,.3)}',
  '.btn-primary:hover{transform:translateY(-2px) scale(1.02);box-shadow:var(--shadow-button-hover)}'
);

// 3. Remove btn-primary::before (shine effect)
css = css.replace(
  '.btn-primary::before{content:\'\';position:absolute;inset:0;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.4) 50%,transparent 70%);transform:translateX(-100%);transition:transform .6s}',
  ''
);
css = css.replace(
  '.btn-primary:hover::before{transform:translateX(100%)}',
  ''
);

// 4. Fix btn-outline
css = css.replace(
  '.btn-outline{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 2rem;background:rgba(255,255,255,.02);color:var(--text);border:1.5px solid var(--border2);border-radius:var(--r-btn);font-family:var(--font-dm-sans),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:.95rem;font-weight:600;cursor:pointer;transition:all .3s;text-decoration:none;position:relative;overflow:hidden}',
  '.btn-outline{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 2rem;background:transparent;color:var(--color-navy);border:1.5px solid var(--color-border-strong);border-radius:var(--radius-btn);font-family:var(--font-body),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:.95rem;font-weight:600;cursor:pointer;transition:all .2s ease;text-decoration:none}'
);

// 5. Fix btn-outline:hover
css = css.replace(
  '.btn-outline:hover{border-color:var(--cyan);color:var(--cyan);background:rgba(0,229,255,.06);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,229,255,.15)}',
  '.btn-outline:hover{border-color:var(--color-orange);color:var(--color-orange);background:rgba(255,107,71,.06);transform:translateY(-2px);box-shadow:0 4px 14px rgba(255,107,71,.15)}'
);

// 6. Fix section-label
css = css.replace(
  '.section-label{display:inline-flex;align-items:center;gap:.75rem;font-size:.8rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;background:linear-gradient(135deg,var(--cyan),var(--violet));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:1.2rem;position:relative}',
  '.section-label{display:inline-flex;align-items:center;gap:.75rem;font-size:.8rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--color-orange);margin-bottom:1.2rem;position:relative}'
);

// 7. Fix section-label::before
css = css.replace(
  '.section-label::before{content:\'\';width:32px;height:2px;background:linear-gradient(90deg,var(--cyan),var(--violet));display:block;box-shadow:0 0 8px rgba(0,229,255,.5)}',
  '.section-label::before{content:\'\';width:32px;height:2px;background:var(--color-orange);display:block}'
);

// 8. Fix gradient-text
css = css.replace(
  '.gradient-text{background:linear-gradient(135deg,var(--cyan) 0%,var(--violet) 50%,var(--pink) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;position:relative;background-size:200% 200%;animation:gradientShift 6s ease infinite}',
  '.gradient-text{color:var(--color-orange);-webkit-text-fill-color:var(--color-orange);background:none;-webkit-background-clip:unset;background-clip:unset;animation:none}'
);

// 9. Fix ai-gradient-text
css = css.replace(
  '.ai-gradient-text{background:linear-gradient(135deg,var(--emerald) 0%,var(--cyan) 50%,var(--violet) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200% 200%;animation:gradientShift 5s ease infinite}',
  '.ai-gradient-text{color:var(--color-orange);-webkit-text-fill-color:var(--color-orange);background:none;-webkit-background-clip:unset;background-clip:unset;animation:none}'
);

// 10. Fix typography h1/h2/h3/h4
css = css.replace(
  'h1,h2,h3,h4{font-family:var(--font-syne),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.15;color:var(--text)}',
  'h1,h2,h3,h4{font-family:var(--font-heading),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--color-navy)}'
);

// 11. Fix h1
css = css.replace(
  'h1{font-size:2.5rem;font-weight:800;letter-spacing:-.02em}',
  'h1{font-size:var(--type-h1-size);font-weight:var(--type-h1-weight);line-height:var(--type-h1-line-height);letter-spacing:var(--type-h1-letter-spacing)}'
);

// 12. Fix h2
css = css.replace(
  'h2{font-size:clamp(1.8rem,4vw,2.9rem);font-weight:700;letter-spacing:-.02em}',
  'h2{font-size:var(--type-h2-size);font-weight:var(--type-h2-weight);line-height:var(--type-h2-line-height);letter-spacing:var(--type-h2-letter-spacing)}'
);

// 13. Fix h3
css = css.replace(
  'h3{font-size:1.15rem;font-weight:700}',
  'h3{font-size:var(--type-h3-size);font-weight:var(--type-h3-weight);line-height:var(--type-h3-line-height)}'
);

// 14. Fix text-muted
css = css.replace(
  '.text-muted{color:var(--muted)}',
  '.text-muted{color:var(--color-text-muted)}'
);

// 15. Fix container
css = css.replace(
  '.container{max-width:1200px;margin:0 auto}',
  '.container{max-width:var(--content-max-width);margin:0 auto}'
);

// 16. Fix scroll animations
css = css.replace(
  '.js-ready .fade-up { opacity:0; transform:translateY(40px); transition:opacity .8s cubic-bezier(.4,0,.2,1),transform .8s cubic-bezier(.4,0,.2,1) }',
  '.js-ready .fade-up{opacity:0;transform:translateY(20px);transition:opacity var(--anim-enter) var(--ease-out),transform var(--anim-enter) var(--ease-out)}'
);

// 17. Fix hero h1 span
css = css.replace(
  '.hero h1 span{color:var(--cyan)}',
  '.hero h1 span{color:var(--color-orange)}'
);

// 18. Fix hero p
css = css.replace(
  '.hero p{font-size:1.1rem;color:var(--muted);max-width:640px;margin:0 0 2.5rem;line-height:1.75;text-align:left}',
  '.hero p{font-size:var(--type-body-lg-size);font-weight:var(--type-body-lg-weight);line-height:var(--type-body-lg-line-height);color:var(--color-text-muted);max-width:640px;margin:0 0 2.5rem;text-align:left}'
);

// 19. Fix hero-eyebrow
css = css.replace(
  '.hero-eyebrow{display:inline-flex;align-items:center;gap:.75rem;padding:.5rem 1.3rem;background:linear-gradient(135deg,rgba(0,229,255,.12),rgba(139,92,246,.1));border:1px solid rgba(0,229,255,.35);border-radius:50px;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--cyan);margin-bottom:2rem;box-shadow:0 0 28px rgba(0,229,255,.18),inset 0 0 14px rgba(0,229,255,.06);position:relative;overflow:hidden}',
  '.hero-eyebrow{display:inline-flex;align-items:center;gap:.75rem;padding:.5rem 1.3rem;background:rgba(255,107,71,.08);border:1px solid rgba(255,107,71,.25);border-radius:50px;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--color-orange);margin-bottom:2rem;position:relative}'
);

// 20. Fix eyebrow-dot
css = css.replace(
  '.eyebrow-dot{width:8px;height:8px;border-radius:50%;background:var(--cyan);box-shadow:0 0 12px var(--cyan);animation:pulse 1.5s ease-in-out infinite}',
  '.eyebrow-dot{width:8px;height:8px;border-radius:50%;background:var(--color-orange);box-shadow:0 0 12px var(--color-orange);animation:pulse 1.5s ease-in-out infinite}'
);

// 21. Fix hero-visual-card
css = css.replace(
  '.hero-visual-card{width:100%;background:linear-gradient(135deg,rgba(15,16,24,.85),rgba(22,24,33,.85));border:1px solid var(--border);border-radius:22px;padding:1.7rem 1.35rem;box-shadow:0 30px 90px rgba(0,0,0,.5),0 0 60px rgba(0,229,255,.08);backdrop-filter:blur(10px);overflow:hidden;position:relative;animation:cardFloat 6s ease-in-out infinite}',
  '.hero-visual-card{width:100%;background:var(--color-surface);border:1px solid var(--color-border);border-radius:22px;padding:1.7rem 1.35rem;box-shadow:var(--shadow-card),0 4px 24px rgba(30,42,74,.08);overflow:hidden;position:relative}'
);

// 22. Fix hero-visual-card::before
css = css.replace(
  '.hero-visual-card::before{content:\'\';position:absolute;inset:-2px;background:linear-gradient(135deg,rgba(0,229,255,.4),rgba(139,92,246,.32),rgba(244,114,182,.24));opacity:.25;filter:blur(18px);z-index:-1}',
  '.hero-visual-card::before{content:\'\';position:absolute;inset:-2px;background:linear-gradient(135deg,rgba(255,107,71,.25),rgba(99,102,241,.18));opacity:.35;filter:blur(14px);z-index:-1}'
);

// 23. Fix hero-visual-topline
css = css.replace(
  '.hero-visual-topline{height:3px;border-radius:99px;background:linear-gradient(90deg,var(--cyan),var(--violet),var(--pink));margin:-.35rem -1.35rem 1.1rem;background-size:200% 200%;animation:gradientShift 4s ease infinite}',
  '.hero-visual-topline{height:3px;border-radius:99px;background:var(--color-orange);margin:-.35rem -1.35rem 1.1rem}'
);

// 24. Fix hero-visual-title
css = css.replace(
  '.hero-visual-title{font-family:var(--font-syne),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-weight:800;font-size:1.6rem;line-height:1.1;margin-bottom:.65rem}',
  '.hero-visual-title{font-family:var(--font-heading),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-weight:700;font-size:1.4rem;line-height:1.2;margin-bottom:.65rem;color:var(--color-navy)}'
);

// 25. Fix hero-visual-sub
css = css.replace(
  '.hero-visual-sub{color:var(--muted);font-size:.9rem;line-height:1.6;margin-bottom:1.25rem;text-align:left}',
  '.hero-visual-sub{color:var(--color-text-muted);font-size:.9rem;line-height:1.6;margin-bottom:1.25rem;text-align:left}'
);

// 26. Fix hero-badge
css = css.replace(
  '.hero-badge{padding:.45rem .7rem;border-radius:999px;border:1px solid var(--border2);background:rgba(255,255,255,.03);color:var(--text);font-size:.78rem;font-weight:700;transition:all .25s}',
  '.hero-badge{padding:.45rem .7rem;border-radius:999px;border:1px solid var(--color-border);background:var(--color-surface-alt);color:var(--color-text-muted);font-size:.78rem;font-weight:600;transition:all .25s}'
);

// 27. Fix hero-badge:hover
css = css.replace(
  '.hero-badge:hover{background:rgba(0,229,255,.1);border-color:rgba(0,229,255,.4);transform:translateY(-2px)}',
  '.hero-badge:hover{background:rgba(255,107,71,.08);border-color:rgba(255,107,71,.3);color:var(--color-orange);transform:translateY(-2px)}'
);

// 28. Fix progress-row
css = css.replace(
  '.progress-row{display:flex;align-items:center;justify-content:space-between;font-size:.82rem;color:var(--muted);margin-bottom:.55rem}',
  '.progress-row{display:flex;align-items:center;justify-content:space-between;font-size:.82rem;color:var(--color-text-muted);margin-bottom:.55rem}'
);

// 29. Fix progress-num
css = css.replace(
  '.progress-num{font-family:var(--font-syne),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--text);font-weight:800}',
  '.progress-num{font-family:var(--font-heading),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--color-navy);font-weight:800}'
);

// 30. Fix progress-bar
css = css.replace(
  '.progress-bar{height:10px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid var(--border);overflow:hidden;margin-bottom:.9rem;position:relative}',
  '.progress-bar{height:10px;border-radius:999px;background:var(--color-surface-alt);border:1px solid var(--color-border);overflow:hidden;margin-bottom:.9rem;position:relative}'
);

// 31. Fix progress-fill
css = css.replace(
  '.progress-fill{height:100%;background:linear-gradient(90deg,var(--cyan),var(--violet),var(--pink));border-radius:999px;box-shadow:0 0 30px rgba(0,229,255,.3);position:relative;background-size:200% 100%;animation:progressShine 3s linear infinite}',
  '.progress-fill{height:100%;background:var(--color-orange);border-radius:999px;box-shadow:0 0 12px rgba(255,107,71,.3);position:relative}'
);

// 32. Fix progress-fill-2
css = css.replace(
  '.progress-fill-2{background:linear-gradient(90deg,var(--pink),var(--amber));box-shadow:0 0 30px rgba(244,114,182,.25)}',
  '.progress-fill-2{background:var(--color-indigo)}'
);

// 33. Fix stats
css = css.replace(
  '.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--r-card);overflow:hidden;max-width:760px;margin:0}',
  '.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--color-border);border:1px solid var(--color-border);border-radius:var(--radius-card);overflow:hidden;max-width:760px;margin:0}'
);

// 34. Fix stat-item
css = css.replace(
  '.stat-item{background:linear-gradient(180deg,var(--surface),var(--surface2));padding:1.5rem 1rem;text-align:center;position:relative;transition:all .3s}',
  '.stat-item{background:var(--color-surface);padding:1.5rem 1rem;text-align:center;position:relative;transition:all .3s}'
);

// 35. Fix stat-item:hover
css = css.replace(
  '.stat-item:hover{background:linear-gradient(180deg,var(--surface2),rgba(0,229,255,.05))}',
  '.stat-item:hover{background:var(--color-surface-alt)}'
);

// 36. Fix stat-num
css = css.replace(
  '.stat-num{font-family:var(--font-syne),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:1.8rem;font-weight:800;background:linear-gradient(135deg,var(--cyan),var(--violet));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:block;background-size:200% 200%;animation:gradientShift 4s ease infinite}',
  '.stat-num{font-family:var(--font-heading),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:var(--type-stat-size);font-weight:var(--type-stat-weight);line-height:var(--type-stat-line-height);color:var(--color-orange);display:block}'
);

// 37. Fix stat-label
css = css.replace(
  '.stat-label{font-size:.8rem;color:var(--muted);margin-top:.25rem}',
  '.stat-label{font-size:var(--type-small-size);color:var(--color-text-muted);margin-top:.25rem;font-weight:var(--type-small-weight)}'
);

// 38. Remove btnShine keyframes
css = css.replace(/@keyframes btnShine[^}]*\}\s*/g, '');

// 39. Remove progressShine keyframes
css = css.replace(/@keyframes progressShine[^}]*\}\s*/g, '');

// 40. Remove gradientShift keyframes (from old :root)
css = css.replace(/@keyframes gradientShift[^}]*\}\s*/g, '');

// 41. Fix footer logo - remove gradient
css = css.replace(
  '.footer-logo{font-family:var(--font-syne),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:1.5rem;font-weight:800;background:linear-gradient(135deg,var(--cyan),var(--violet),var(--pink));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-decoration:none;display:inline-block;margin-bottom:.75rem;background-size:200% 200%;animation:gradientShift 5s ease infinite}',
  '.footer-logo{font-family:var(--font-heading),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:1.5rem;font-weight:800;color:var(--color-navy);text-decoration:none;display:inline-block;margin-bottom:.75rem}'
);

// 42. Fix footer-logo in extra block
css = css.replace(
  '.footer-logo{font-family:var(--font-syne),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:1.5rem;font-weight:800;background:linear-gradient(135deg,var(--cyan),var(--violet) 50%,var(--pink));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:inline-block;margin-bottom:.75rem}',
  '.footer-logo{font-family:var(--font-heading),ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:1.5rem;font-weight:800;color:var(--color-navy);text-decoration:none;display:inline-block;margin-bottom:.75rem}'
);

// 43. Remove eyebrowShine keyframes
css = css.replace(/@keyframes eyebrowShine[^}]*\}\s*/g, '');

// 44. Remove duplicate section{padding...}
css = css.replace(/section\{padding:5rem 5%;position:relative\}\n\n/, '');

const changes = original !== css ? (original.length - css.length) : 0;
writeFileSync('src/app/home.css', css, 'utf8');
console.log('Applied fixes. Bytes changed:', changes > 0 ? (changes) : 'unknown');
