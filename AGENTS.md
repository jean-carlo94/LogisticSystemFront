# AGENTS.md

## Commands

```bash
pnpm dev          # start Vite dev server
pnpm build        # typecheck (vue-tsc) then vite build — type errors block build
pnpm typecheck    # vue-tsc with --noEmit (same check as build, without output)
pnpm preview      # preview production build
```

## Stack

Vue 3 SPA (Composition API, `<script setup lang="ts">`) + Pinia + Vue Router + Axios.
Pure CSS with `:root` custom properties for light/dark theming via `prefers-color-scheme`.
No meta-framework, no CSS framework, no Tailwind.

## Rules

- **pnpm only** — lockfile is `pnpm-lock.yaml`. Never use npm or yarn.
- **Node >= 22** required.
- **`@/`** path alias resolves to `src/` (configured in both `tsconfig.app.json` and `vite.config.ts`).
- **Strict TypeScript** — `noUnusedLocals: true`, `noUnusedParameters: true`. Unused imports/vars/params are compile errors.
- **No tests, no lint, no formatter** configured. Don't try to run them unless user asks to set them up.
- **`.env`** sets `VITE_API_BASE_URL=http://localhost:8000/api/v1`. The README example omits `/v1`, but the active `.env` includes it.
- Recommended VSCode extension: **Volar** (`.vscode/extensions.json`).

## Architecture

```
src/
  components/       Vue SFCs (layout/, products/, events/, ui/)
  router/index.ts   createWebHistory, routes: /products, /events, catch-all -> /products
  services/         Axios instance (api.ts) + per-resource methods (products.ts, events.ts)
  stores/           Pinia setup-function stores (products.ts, events.ts)
  types/            TS interfaces + enums (product.ts, event.ts, pagination.ts)
  views/            Page-level components (ProductsView.vue, EventsView.vue)
```

Axios interceptor unwraps `response.data` so callers receive the body directly.
API responses expected shaped as `{ items, total, page, size, pages }`.

## API Reference

Base URL: `VITE_API_BASE_URL` (`.env` = `http://localhost:8000/api/v1`).

### Auth (public — no token)

- `POST /auth/register` — `{ email, password }`, password min 6 max 128 chars
- `POST /auth/login` — `{ email, password }`, returns JWT for `Authorization: Bearer <token>`

### Products (protected — Bearer token required)

- `GET /products/` — paginated list
- `POST /products/` — create, required: `name`, `price`; optional: `description` (null), `stock` (default 0), `state` (default `ACTIVE`)
- `PUT /products/{id}` — partial update, all fields optional
- `DELETE /products/{id}` — no body

**Validation / setters:**
- `name`: min 1, max 200, auto `.strip()`
- `price`: float, gt 0, auto `.round(2)`
- `stock`: int, ge 0, default 0, auto `.max(0)` (clamp negative to 0)
- `state`: enum `ACTIVE` | `INACTIVE` | `NO_STOCK` | `DISCONTINUED`, default `ACTIVE`
- **State machine**: setting `stock=0` forces `state → NO_STOCK` automatically

### Events (protected — Bearer token, **read-only**, append-only audit log)

- `GET /events/` — paginated list
- `GET /events/{id}` — single event
- `GET /Product/{id}/events/` — events for a specific product
- `GET /User/{id}/events/`

**Event shape:**
- `entity_type`: `"Product"` | `"User"`
- `entity_id`: int (target entity)
- `action`: `CREATE` | `UPDATE` | `DELETE` | `STATUS_CHANGED`
- `user_id`: int (from JWT)
- `description`: JSON string of the changed data
