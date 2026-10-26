# UIDrop: code walkthrough

This guide explains what each part does and how the browser and server connect.

## 1. The frontend

### `client/src/main.jsx`

This is the React application.

- `initialComponents`: starter content used immediately, so the UI can run without a database.
- `ComponentPreview`: renders a preview based on each component's `type` (`button`, `card`, `form`, etc.). It receives the component plus the selected accent color and border radius.
- `App`: owns the page state: current category, search query, selected component, editor values, favorites, submission form, and API status.
- `useState`: stores UI state. Updating a state value tells React to render the UI again.
- `useEffect`: runs side effects. UIDrop uses it to persist favorites in `localStorage`, check whether the API is available, load approved community components, and clear toast messages.
- `useMemo`: filters the component list when the search, category, favorites filter, or component list changes.
- `codeFor`: creates a copyable HTML snippet and CSS from the selected component's ID, accent color, and corner radius.
- `copyCode`: copies the generated snippet using the browser Clipboard API.
- `submitComponent`: validates the basic required fields and sends the submission to the Express API. If the API is unavailable, it adds a local demo card instead.

The UI uses React event handlers such as `onClick`, `onChange`, and `onSubmit` so controls are interactive rather than static pictures.

### `client/src/styles.css`

The visual design lives here: color tokens, typography, component previews, responsive grids, modals, hover states, and mobile layouts. CSS variables such as `--bg`, `--surface`, `--text`, `--accent`, and `--radius` help keep styles consistent.

### `client/index.html` and `client/vite.config.js`

The HTML file provides the page shell and loads the React entry point. Vite runs the development server and bundles the frontend for deployment.

## 2. The backend

### `server/src/index.js`

This is an Express REST API.

- `GET /api/health`: confirms the API process is running.
- `GET /api/components`: asks Prisma for approved components and returns JSON.
- `POST /api/components`: validates incoming data with Zod, stores the component as `pending`, and returns the new record.
- `helmet`: adds common HTTP security headers.
- `cors`: allows the local frontend origin to call the API.
- `express.json`: parses JSON request bodies and limits their size.
- The final error handler returns a generic server error instead of exposing internal details to clients.

### `server/prisma/schema.prisma`

This defines the PostgreSQL `Component` table. Prisma generates a JavaScript client from this schema. `status` supports a basic review workflow: submissions start as `pending`, while the public listing only returns `approved` records.

### `server/.env.example`

Copy this to `server/.env` and put your own database URL in `DATABASE_URL` (SQLite by default). Never commit your real `.env` file or database password.

## 3. How the full-stack flow works

1. React shows starter components immediately.
2. React checks `GET /api/health` to display whether the local API is available.
3. React requests `GET /api/components`; approved database records are added to the gallery.
4. When someone submits a component, React sends JSON to `POST /api/components`.
5. Express validates the request, Prisma writes it to PostgreSQL as `pending`, and the UI confirms the submission.
6. A future moderation screen or admin workflow must approve pending components before they appear in the public gallery.

## 4. Run it locally

### Frontend demo only

```bash
cd client
npm install
npm run dev
```

### Full stack

1. Install Node.js 20 or newer and PostgreSQL.
2. Create a database named `uidrop`.
3. Copy `server/.env.example` to `server/.env` and update `DATABASE_URL`.
4. From the project root run:

```bash
npm install
npm run db:setup --workspace server
npm run dev
```

The frontend should be available at `http://localhost:5173`; the API at `http://localhost:4000`.

## 5. What is not finished yet

This is an MVP starter. It does not yet include authentication, user-owned server-side favorites, persistent collections, an admin moderation screen, automated tests, or production deployment configuration. Favorites are stored in browser `localStorage`; if the API is offline, new submissions only exist in the current browser session. Before a public launch, add authentication and authorization, rate limiting, stronger submission review, tests, and a safe sandbox for rendering user-submitted code. Do not execute arbitrary submitted JavaScript in the main application page.
