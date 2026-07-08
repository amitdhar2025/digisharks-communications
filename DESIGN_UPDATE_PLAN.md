# UI Update Plan — Admin Login (c:/DG/digisharks-communications)

## Information gathered
- `src/app/admin/login/page.tsx` renders a centered login card using classes:
  - `.admin-login-wrap`, `.admin-login-card`, `.admin-login-logo`, `.admin-login-sub`
  - form elements rely on `.admin-shell .field`, `.admin-shell .btn`, and input/textarea styling.
- `src/app/admin/layout.tsx` wraps all admin pages with:
  - `<div className="admin-shell"> ... </div>`
- `src/app/admin/admin.css` contains most admin styles.
  - Input/select/textarea styles are scoped under `.admin-shell .field input, .admin-shell .field textarea`.
  - Login card background + layout exists (`.admin-login-wrap`, `.admin-login-card`), but login form control styling is scoped to `.admin-shell`, while the login page uses `.field` and `.btn` but isn’t under a dedicated `.admin-shell`-scoped wrapper.
  - There is no explicit styling for `.admin-login-wrap .field` / `.admin-login-wrap .field input` etc.

## Plan
1. Fix the root cause of “input/textarea not visible properly”:
   - Ensure login form controls inherit the same dark background, light text, borders, focus ring.
   - Add explicit CSS rules for login page elements, scoped to `.admin-login-wrap` (and/or adjust selectors if safe).
2. Bring login UI closer to dashboard look:
   - Use the same border radius, border color, focus glow, button gradient, and spacing as dashboard cards.
   - Add alignment + sizing constraints so labels, inputs, and button align consistently.
3. Add error message styling:
   - Style `.alert-error`/error text and connect it to existing state (note: current component has `error` state but does not render it).
4. Add accessibility:
   - Ensure `aria-live` for error text.
   - Ensure focus-visible outlines for inputs.

## Dependent files to edit
- `src/app/admin/admin.css`
- `src/app/admin/login/page.tsx`

## Followup steps
- Run `npm run dev` (or existing dev server) and verify:
  - `http://localhost:3000/admin` and `http://localhost:3000/content/admin/login`
  - Inputs/textarea visibility: background, text, border, focus.
  - Alignment and spacing match the dashboard.

<ask_followup_question>
Proceed with these edits (update `admin.css` + render `error` in login page) to improve login UI visibility and alignment?
</ask_followup_question>

