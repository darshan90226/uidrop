# UIDrop

**Discover. Customize. Copy. Build.** UIDrop is an open-source UI component playground. This starter includes a working React gallery/editor and an Express + Prisma (SQLite/PostgreSQL) API.

## Features in this MVP

- Responsive component gallery with search and category filters
- Live customization for accent color and corner radius
- Copy generated HTML/CSS snippets
- Save favorites in browser storage
- Submit a component to the API (or use local demo mode when the API is unavailable)
- Express API with component listing, submission, and moderation-ready status field
- Prisma schema (SQLite by default, PostgreSQL supported)

> This is a starter MVP, not a finished production service. Authentication, user-owned collections, moderation UI, automated tests, and production security hardening are follow-up work. Submissions are stored in PostgreSQL when the backend is configured; the frontend remains usable in demo mode without it.

## Requirements

- Node.js 20+

## Quick start (full stack, no database install needed)

Requires Node.js 20+. The API uses SQLite by default, so there is nothing else to install.

```bash
cd uidrop
npm run setup      # installs everything, creates the database, seeds sample data
npm run dev        # starts client (5173) and API (4000) together
```

Open http://localhost:5173. To serve everything from one port in production: `npm run build && npm start`, then open http://localhost:4000. The stats bar shows **API connected** when the backend is running.

Frontend only (no backend): `cd client && npm install && npm run dev`. The app falls back to demo mode.

## Moderation

Submissions start as `pending` and are hidden until approved.

1. `npm run setup` generates a random `ADMIN_TOKEN` in `server/.env` and prints it (open that file any time to see it).
2. Open http://localhost:5173/#admin (or click **Admin** in the footer).
3. Enter the token, then Approve / Reject / Delete submissions.

## Using PostgreSQL instead

Just set `DATABASE_URL="postgresql://USER:PASS@HOST:5432/uidrop"` in `server/.env` and run `npm run db:setup`. The provider switches automatically.

## Going live

See [DEPLOY.md](./DEPLOY.md) for a step-by-step guide (GitHub + Neon + Render, all free).

## API endpoints

- `GET /api/health`: health check (also tests the database)
- `GET /api/components`: list approved components (`?category=Buttons` optional)
- `POST /api/components`: submit a component (starts as `pending`, rate limited)
- `GET /api/admin/components?status=pending`: moderation list (header `x-admin-token`)
- `PATCH /api/admin/components/:id`: body `{ "status": "approved" | "rejected" | "pending" }`
- `DELETE /api/admin/components/:id`

## Troubleshooting

- **"Demo mode active"**: the API isn't running or the DB failed. Run `npm run dev:server` and read the error.
- **`@prisma/client did not initialize yet`**: run `npm run db:setup`.
- **Port 4000 in use**: change `PORT` in `server/.env` and the proxy target in `client/vite.config.js`.
- **Submission doesn't show in the gallery**: it is `pending`; approve it in `/#admin`.

## Project structure

```text
uidrop/
├── client/          # React + Vite frontend
└── server/          # Express API + Prisma schema
```

## Open source

The project is licensed under the MIT License. Contributions should include a clear description and screenshots for UI changes. Before public launch, review dependency licenses and add automated tests and a code of conduct.
