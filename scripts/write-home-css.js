// Build scripts/build-home.css.js
// Writes src/app/home.css with the full design system
const fs = require("fs");
const path = require("path");

const css = `/* =========================================================
   Digisharks Communications — Live Site Design System
   Light theme · Poppins / Inter / JetBrains Mono
   ========================================================= */

:root {
  /* ===== Backgrounds (live) ===== */
  --bg: #FFFFFF;
  --band: #F8FAFC;
  --surface: #F1F5F9;
  --surface2: #F1F5F9;

  /* ===== Text ===== */
  --text: #0F172A;
  --muted: #475569;
  --faint: #94A3B8;
  --accent-ink: #FFFFFF;

  /* ===== Accent & categories ===== */
  --accent: #E0436F;
  --accent-2: #FF6FA5;
  --accent-3: #B5179E;
  --accent-soft: rgba(224, 67, 111, 0.12);

  /* Legacy aliases (mapped to live palette) */
  --cyan: #06B6D4;
  --cyan-soft: #67E8F9;
  --violet: #9333EA;
  --violet-soft: #C4A2F0;
  --pink: #E0436F;
  --pink-soft: #FF6FA5;
  --magenta: #DB2777;
  --indigo: #9333EA;
  --emerald: #10B981;
  --emerald-soft: #34D399;
  --amber: #F59E0B;
  --orange: #F97316;
  --red: #E0436F;
  --lime: #84CC16;
  --sky: #0EA5E9;
  --teal: #14B8A6;
  --fuchsia: #DB2777;
  --rose: #E0436F;

  /* ===== Border / radius ===== */
  --border: rgba(15, 23, 42, 0.08);
  --border2: rgba(15, 23, 42, 0.16);

  /* ===== Card / shadow / radius (live) ===== */
  --r-card: 16px;
  --r-btn: 12px;
  --r-pill: 100px;
  --shadow-card: 0 2px 12px rgba(15, 23, 42, 0.06);
  --shadow-card-hover: 0 24px 48px rgba(15, 23, 42, 0.14);
  --shadow-nav: 0 1px 4px rgba(0, 0, 0, 0.08);

  /* ===== Gradient (CTA / buttons) ===== */
  --grad: linear-gradient(120deg, #FF6FA5 0%, #E0436F 52%, #B5179E 100%);
  --grad-soft: linear-gradient(120deg, rgba(255, 111, 165, 0.18) 0%, rgba(224, 67, 111, 0.18) 52%, rgba(181, 23, 158, 0.18) 100%);

  /* ===== Multi-color palette ===== */
  --mc-1: #E0436F;
  --mc-2: #DB2777;
  --mc-3: #9333EA;
  --mc-4: #F97316;
  --mc-5: #FF6FA5;
  --mc-6: #B5179E;
  --mc-7: #FF6FA5;
  --mc-8: #E0436F;
  --mc-9: #DB2777;
  --mc-10: #9333EA;
  --mc-rainbow: linear-gradient(135deg, #FF6FA5 0%, #E0436F 28%, #DB2777 56%, #9333EA 84%);
  --mc-rainbow-soft: linear-gradient(135deg, rgba(255, 111, 165, 0.15) 0%, rgba(224, 67, 111, 0.15) 28%, rgba(219, 39, 119, 0.15) 56%, rgba(147, 51, 234, 0.15) 84%);
  --mc-aurora: linear-gradient(135deg, rgba(255, 111, 165, 0.18), rgba(224, 67, 111, 0.18), rgba(219, 39, 119, 0.18), rgba(147, 51, 234, 0.18), rgba(249, 115, 22, 0.18));
}

/* ===== Base ===== */
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-inter), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.65;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
  -webkit-font-smoothing: antialiased;
}
.content { position: relative; z-index: 1; }
#mobileMenu { z-index: 140; }

/* =========================================================
   NAV BAR — live: white · 0 1px 4px rgba(0,0,0,.08)
   ========================================================= */
nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 150;
  padding: 0 5%;
  height: 74px;
  display: flex; align-items: center; justify-content: space-between;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  background: #FFFFFF;
  box-shadow: var(--shadow-nav);
  border-bottom: 1px solid var(--border);
}
nav.scrolled, nav.menu-open {
  background: #FFFFFF;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
  border-bottom-color: var(--border2);
}
.nav-logo {
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  width: 200px; height: 60px;
  padding: 0 !important;
  border-radius: 6px;
  background: transparent !important;
  border: none; overflow: visible; transition: none;
  text-decoration: none; position: relative;
}
.nav-logo:hover { background: transparent !important; border: none; transform: none; box-shadow: none; }
.nav-logo img {
  width: 170px !important; height: auto !important;
  max-width: 170px; max-height: 60px !important;
  object-fit: contain; display: block;
}
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Nav links — live: 14px · wght 500 */
.nav-links {
  display: flex; align-items: center;
  gap: 1.2rem;
  list-style: none; margin: 0; padding: 0;
  flex: 1; justify-content: center; flex-wrap: nowrap;
}
.nav-links li { flex-shrink: 0; white-space: nowrap; position: relative; }
.nav-links a {
  color: var(--muted);
  text-decoration: none;
  font-family: var(--font-heading), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  border: 1.5px solid transparent;
  transition: all 0.25s ease;
  position: relative;
  letter-spacing: 0.01em;
}
.nav-links a:hover, .nav-links a.active {
  color: var(--accent);
  background: rgba(224, 67, 111, 0.06);
  border-color: rgba(224, 67, 111, 0.30);
  box-shadow: 0 0 14px rgba(224, 67, 111, 0.12);
}
.nav-links a.active::after {
  content: ""; position: absolute; bottom: -6px; left: 0; right: 0;
  height: 2px; background: var(--grad); border-radius: 2px;
}

/* Dropdown (Services) */
.has-dropdown { position: relative; }
.has-dropdown::after { content: ""; position: absolute; top: 100%; left: 0; right: 0; height: 18px; display: block; }
.has-dropdown .nav-dropdown {
  position: absolute; top: 100%; left: 0; transform: translateY(8px);
  min-width: 230px;
  background: #FFFFFF; border: 1px solid var(--border); border-radius: 12px;
  padding: 0.5rem; display: flex; flex-direction: column; gap: 2px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.14), 0 0 30px rgba(224, 67, 111, 0.08);
  opacity: 0; visibility: hidden; pointer-events: none;
  transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s;
  z-index: 50; margin-top: 10px;
}
.has-dropdown .nav-dropdown::before {
  content: ""; position: absolute; top: -7px; left: 24px;
  transform: rotate(45deg); width: 12px; height: 12px;
  background: #FFFFFF; border-top: 1px solid var(--border); border-left: 1px solid var(--border);
}
@media (min-width: 901px) {
  .has-dropdown:hover .nav-dropdown, .has-dropdown:focus-within .nav-dropdown {
    opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0);
  }
}
.nav-dropdown a {
  display: block; width: 100%;
  padding: 0.65rem 0.9rem; border-radius: 8px;
  color: var(--text) !important; font-size: 14px; font-weight: 500;
  text-decoration: none; border: 1.5px solid transparent;
  transition: all 0.2s ease; white-space: nowrap;
}
.nav-dropdown a:hover, .nav-dropdown a.active {
  color: var(--accent) !important;
  background: rgba(224, 67, 111, 0.08);
  border-color: rgba(224, 67, 111, 0.3);
  padding-left: 1.1rem;
}

/* Nav CTA pill */
.nav-cta-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  background: var(--grad);
  color: #FFFFFF !important;
  font-family: var(--font-heading), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  font-weight: 700; font-size: 14px;
  border-radius: 100px; text-decoration: none;
  white-space: nowrap; flex-shrink: 0;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-left: 0.75rem;
  box-shadow: 0 4px 14px rgba(224, 67, 111, 0.25);
}
.nav-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(224, 67, 111, 0.4); color: #FFFFFF !important; }
.nav-caret { font-size: 0.65rem; margin-left: 0.3rem; opacity: 0.7; display: inline-block; transition: transform 0.2s; }
.has-dropdown:hover .nav-caret { transform: rotate(180deg); }

/* Nav outline button */
.btn-nav {
  padding: 0.55rem 1.25rem;
  border: 1.5px solid var(--accent); border-radius: 12px;
  color: var(--accent); background: transparent;
  font-family: var(--font-heading), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.25s; text-decoration: none;
}
.btn-nav:hover { background: var(--accent); color: var(--accent-ink); box-shadow: 0 6px 18px rgba(224, 67, 111, 0.30); }

/* Social icons in nav */
.nav-social-icons { display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0; margin-left: 0.5rem; }
.nav-social-icon {
  width: 34px; height: 34px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 8px; color: var(--muted);
  background: transparent; border: 1px solid var(--border);
  text-decoration: none; transition: all 0.25s ease;
}
.nav-social-icon:hover { color: #FFFFFF; background: var(--grad); border-color: transparent; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(224, 67, 111, 0.35); }
.nav-social-icon svg { display: block; }

/* Hamburger */
.hamburger {
  display: none; flex-direction: column; gap: 5px;
  cursor: pointer; background: #FFFFFF;
  border: 1px solid var(--border); border-radius: 8px;
  padding: 10px; z-index: 160; position: relative;
  width: 44px; height: 44px;
  align-items: center; justify-content: center; transition: all 0.25s;
}
.hamburger:hover { background: var(--surface); border-color: var(--accent); }
.hamburger span { display: block; width: 22px; height: 2px; background: var(--text); border-radius: 2px; transition: all 0.3s; }
.hamburger.open { background: var(--surface); border-color: var(--accent); }
.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); background: var(--accent); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); background: var(--accent); }

/* Mobile menu */
.mobile-menu {
  position: fixed; inset: 0;
  background: #FFFFFF; z-index: 140;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
  padding: 110px 5% 2rem; gap: 0.4rem;
  opacity: 0; pointer-events: none; transition: opacity 0.3s; overflow-y: auto;
}
.mobile-menu.open { opacity: 1; pointer-events: all; }
.mobile-menu a {
  font-family: var(--font-heading), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  font-size: 1.25rem; font-weight: 700; color: var(--text);
  text-decoration: none;
  transition: color 0.2s, padding-left 0.2s;
  padding: 0.65rem 0; width: 100%; text-align: center; letter-spacing: 0.01em; position: relative;
}
.mobile-menu a:not(:last-child) { border-bottom: 1px solid var(--border); }
.mobile-menu a:hover, .mobile-menu a.active { color: var(--accent); padding-left: 8px; }
.mobile-menu a.btn-primary { margin-top: 1rem; width: auto; min-width: 220px; justify-content: center; border-bottom: none; padding: 0.8rem 2rem; }

/* Mobile submenu */
.mobile-sub {
  display: flex; flex-direction: column; gap: 0; width: 100%;
  padding: 0.25rem 0 0.75rem; margin: 0;
  max-height: 0; overflow: hidden; opacity: 0;
  transition: max-height 0.25s ease, opacity 0.2s ease;
}
.mobile-sub.open { max-height: 800px !important; opacity: 1 !important; overflow: visible !important; }
.mobile-sub a {
  display: inline-block !important; width: auto !important; min-width: 0 !important;
  text-align: center !important; font-size: 1.05rem !important; font-weight: 500 !important;
  padding: 0.7rem 0 !important; color: var(--muted) !important;
  white-space: normal !important; border-bottom: 1px dashed var(--border) !important;
  background: var(--band); border-radius: 8px; margin: 2px 0;
}
.mobile-sub a:last-child { border-bottom: none !important; }
.mobile-sub a:hover, .mobile-sub a.active { color: var(--accent) !important; background: var(--accent-soft) !important; }
.submenu-label