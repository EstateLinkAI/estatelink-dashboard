# EstateLink Dashboard

EstateLink Dashboard is the React frontend for EstateLink, a property lead intelligence platform. It gives analysts a protected workspace for reviewing scored property opportunities, filtering lead data, inspecting individual intelligence reports, and importing clean scraped listings into the backend pipeline.

The backend is a Go API that handles authentication, listing import, lead normalisation, scoring, and lead retrieval.

## Screenshots

Screenshots are not committed yet. Add them later under `docs/screenshots/` when the UI is ready to document visually.

## Features

- JWT login flow with protected app routes.
- Dashboard metrics for visible leads, A-grade leads, average score, and highest score.
- Responsive lead pipeline with filters for city, postcode area, property type, source platform, and minimum score.
- Lead detail intelligence report with property summary, investment metrics, source information, score overview, and grouped score reasons.
- Clean listings import flow for JSON arrays and NDJSON files.
- Import job polling for queued, processing, completed, and failed states.
- Desktop sidebar, mobile sidebar drawer, and account dropdown menu.
- Centralised Tailwind v4 theme tokens in `src/styles/theme.css`.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS v4
- Axios
- React Router DOM

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file if the API is not running on the default backend URL:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | No | `http://localhost:8080` | Base URL for the Go API. |
| `VITE_MAX_IMPORT_ROWS` | No | `5000` | Maximum listings allowed per import upload. Must stay in sync with the backend's `MAX_IMPORT_ROWS` limit. |

## Routes

| Route | Access | Description |
| --- | --- | --- |
| `/login` | Public | Login screen. |
| `/app/dashboard` | Protected | Lead intelligence overview. |
| `/app/leads` | Protected | Filterable lead pipeline. |
| `/app/leads/:id` | Protected | Lead detail intelligence report. |
| `/app/imports` | Protected | Clean listing JSON/NDJSON import workflow. |
| `/` | Redirect | Redirects to `/app/dashboard`. |

## Backend API Expectations

The frontend currently expects these backend capabilities:

```text
POST /api/auth/login
GET  /api/me
GET  /api/leads
GET  /api/leads/:id
POST /api/imports/clean-listings
GET  /api/imports/:jobId
```

Authentication is handled through the shared Axios client in `src/api/client.ts`. The JWT is stored in `localStorage`, attached to outgoing requests, and cleared on `401` responses.

## Import Workflow

The import page accepts either a JSON array:

```json
[
  {
    "title": "2 Bed Flat in Manchester",
    "city": "Manchester",
    "sourcePlatform": "Rightmove"
  }
]
```

Or newline-delimited JSON:

```ndjson
{"title":"2 Bed Flat in Manchester","city":"Manchester","sourcePlatform":"Rightmove"}
{"title":"3 Bed Terrace in Leeds","city":"Leeds","sourcePlatform":"Zoopla"}
```

The frontend parses the file, sends an array of listing objects to `POST /api/imports/clean-listings`, then polls `GET /api/imports/:jobId` for progress.

## Project Structure

```text
src/
  api/                 API clients and response normalisation
  components/
    layout/            App shell, sidebar, topbar, account menu
    lead/              Lead-specific UI components
    ui/                Shared loading, empty, error, and stat components
  pages/               Route-level screens
  routes/              Router and protected route wrapper
  styles/              Centralised Tailwind theme tokens
  types/               Shared TypeScript types
```

## Design Tokens

Tailwind v4 theme tokens live in:

```text
src/styles/theme.css
```

Use this file for shared design decisions such as:

- font stacks
- app background colours
- panel and border colours
- accent, success, warning, and danger colours
- shared radius and shadow tokens

Example token-backed utilities:

```tsx
<div className="rounded-panel border border-border-subtle bg-panel shadow-panel" />
```

## Quality Checks

Run these before opening a pull request:

```bash
npm run build
npm run lint
```

## Notes

- The frontend is intentionally lightweight. It does not use Redux, Zustand, React Query, chart libraries, or auth refresh logic yet.
- API response normalisation is defensive because backend field names may vary slightly while the product is still evolving.
- Import screenshots should be committed as normal image assets once captured from the running app.
