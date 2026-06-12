# Digisharks Communications — Admin Dashboard

A complete contact-form → MongoDB → admin dashboard flow.

## Stack
- **Next.js 16** (App Router) + **React 19**
- **MongoDB Atlas** (existing cluster `digisharks` database)
- **JWT** (jsonwebtoken) admin auth stored in `httpOnly` cookie
- **bcryptjs** for password hashing
- **ExcelJS** for `.xlsx` exports

## What's new

### User side
- `src/app/contact-us/ContactForm.tsx` — the contact form on `/contact-us` now
  actually submits data to `POST /api/contact`, which saves it to MongoDB
  collection **`queries`** with `status: "pending"`.

### Admin side
- `POST /admin/login` — JWT cookie auth (default `admin` / `Admin@123`,
  configured via `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env.local`).
  The admin account is auto-created on first login.
- `GET /admin/dashboard` — protected dashboard:
  - Stats cards (Total / Pending / Follow-up / Completed)
  - Search by name, email, phone, service, or message
  - Status filter
  - Pagination
  - Per-row **View / Edit / Excel / Delete**
  - Top-bar **Export all (.xlsx)** and **New query** buttons
- **View modal** — see full details + add/delete activity comments
- **Edit modal** — edit any field (DB row is updated)
- **Create modal** — manually add a new query
- **Delete modal** — confirmation, removes from DB

### API
| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/contact` | Public form submission |
| `POST` | `/api/admin/login` | Login (sets `admin_token` cookie) |
| `POST` | `/api/admin/logout` | Clears cookie |
| `GET` | `/api/admin/me` | Check auth status |
| `GET` | `/api/admin/queries?status=&search=&page=&limit=` | List with filter / search / pagination |
| `POST` | `/api/admin/queries` | Admin: create a new query |
| `GET/PUT/DELETE` | `/api/admin/queries/:id` | Read / update / delete one |
| `PATCH` | `/api/admin/queries/:id/status` | Quick status change |
| `POST/DELETE` | `/api/admin/queries/:id/comments` | Add or remove a comment |
| `GET` | `/api/admin/export?id=&status=&search=` | Excel export (all or single) |

All admin routes require the JWT cookie or `Authorization: Bearer <token>` header.

## First-time setup
1. Make sure `.env.local` has:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=<long random string>
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=Admin@123
   ```
2. Open `http://localhost:3000/admin/login` and sign in with the credentials
   above. The first successful login seeds the admin user (hashed via bcrypt).
3. Open `http://localhost:3000/admin/dashboard`.

## Notes
- The dashboard polls `/api/admin/me` on load. If the cookie is invalid
  (or expired) the user is redirected to `/admin/login`.
- All changes (status, comments, edits, deletes) write directly to MongoDB.
- Excel exports include every column plus all comments merged with author +
  timestamp.
- Default admin password is read from `ADMIN_PASSWORD`; change it in
  `.env.local` for any non-local environment.
