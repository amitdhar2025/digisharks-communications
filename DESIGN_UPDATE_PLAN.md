# Design System Update — Implementation Plan

## Goal
Apply a unified orange-red + dark navy design system across the entire Next.js site,
following the user's spec. MongoDB / API code is NOT touched — only the CSS layer.

## Color tokens (new)
- Action orange:  #FF5B2E  (was #FF6B47)
- Dark navy:      #0F1628  (was #1E2A4A)
- Body text:      #4A5568  (was #1F2937)
- Page bg:        #F8F9FB  (was #FAFAFA)
- Card bg:        #FFFFFF  (unchanged)
- Border:         #E5E7EB  (unchanged)

## Fonts
- Headings: Plus Jakarta Sans 700 (replacing Sora)
- Body:     Inter 400 / 600 (unchanged)

## Steps
- [ ] 1. Update `src/app/theme.css` — swap canonical tokens to new colors,
        add `--color-text` body color, soften legacy navy references.
- [ ] 2. Update `src/app/layout.tsx` — swap Sora → Plus Jakarta Sans, keep Inter,
        remove JetBrains Mono (use Plus Jakarta 800 for stat numbers).
- [ ] 3. Update `src/app/globals.css` — body text color, ensure reset.
- [ ] 4. Patch hardcoded colors in `src/components/Footer.tsx`,
        `src/components/Navigation.tsx`, and any inline-styled spots.
- [ ] 5. Sweep hardcoded hex values in `src/app/home.css`,
        `src/app/multi-color.css`, `src/app/home-overrides.css`,
        `src/app/services.css`, `src/app/stat-pattern.css`.
- [ ] 6. Sweep hardcoded values in `(public)` pages:
        `dp.css`, `portfolio.css`, `blog.css`.
- [ ] 7. Build & smoke-test.
