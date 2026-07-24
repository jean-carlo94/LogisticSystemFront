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
Pure CSS with `[data-theme]` attribute + `:root` custom properties for light/dark theming.
No meta-framework, no CSS framework, no Tailwind.

## Rules

- **pnpm only** — lockfile is `pnpm-lock.yaml`. Never use npm or yarn.
- **Node >= 22** required.
- **`@/`** path alias resolves to `src/` (configured in both `tsconfig.app.json` and `vite.config.ts`).
- **Strict TypeScript** — `noUnusedLocals: true`, `noUnusedParameters: true`. Unused imports/vars/params are compile errors.
- **No tests, no lint, no formatter** configured. Don't try to run them unless user asks to set them up.
- **`.env`** sets `VITE_API_BASE_URL=http://localhost:8000/api/v1`. The README example omits `/v1`, but the active `.env` includes it.
- Recommended VSCode extension: **Volar** (`.vscode/extensions.json`).
- **Auth state recovery**: `src/main.ts` calls `useAuthStore().init()` checking localStorage for token and restoring profile via `GET /auth/me`. Do NOT remove or bypass this call.
- **Store reset**: When login/logout occurs, `authStore` calls `resetAllStores()` which invokes `reset()` on all other stores (products, events, roles, users). Every new store MUST expose a `reset()` method that clears all state to initial values.
- **CSS conventions**: Shared UI classes live in `src/style.css` (not duplicated in scoped blocks). Global classes include: `.page`, `.table-wrap`, `.overlay`, `.modal`, `.form`, `.field`, `.row`, `.actions`, `.btn-ghost`, `.empty-state`, `.error-banner`, `.id-cell`, `.date-cell`, `.actions-cell`, `.skeleton`, `.skeleton-table`, `.skeleton-row`. Component `<style scoped>` blocks should ONLY contain classes unique to that component.
- **Logic reuse**: Common formatters live in `src/composables/useFormat.ts` (`formatDate`). User display name is a store computed (`authStore.displayName`). Do not duplicate these in components.

## Architecture

```
src/
  components/
    layout/          AppSidebar.vue, ProfileModal.vue
    products/        ProductBadge.vue, ProductForm.vue (modal), ProductsTable.vue (table + pagination)
    events/          EventBadge.vue, EventsTable.vue (table + pagination)
    roles/           RoleFormModal.vue, PermissionsModal.vue, RolesTable.vue (table + pagination)
    users/           UserFormModal.vue, RoleAssignModal.vue, UsersTable.vue (table + pagination)
    ui/              Pagination.vue (page size selector + page buttons)
  composables/       useTheme.ts (dark/light toggle, OS auto-detect), useSidebar.ts (collapse state)
  router/index.ts    createWebHistory, beforeEach guard for auth
  services/          Axios instance (api.ts) + per-resource methods
  stores/            Pinia setup-function stores
  types/             TS interfaces + enums per domain
  views/             Page-level components (minimal wiring: header, state, table, modals)
```

### View pattern

Views are thin containers. They only render the page header, loading/error/empty state, and delegate table + pagination + modals to their component files. Never put inline table markup or modal markup inside a view.

```vue
// Correct — ProductsView.vue
<ProductsTable />       // table + pagination inside
<ProductForm />         // modal

// Correct — UsersView.vue
<UsersTable />          // table + pagination inside
<UserFormModal />
<RoleAssignModal />

// Wrong — inline <table> or modal <div> in the view
```

### Table + pagination pattern

Every table component includes its own `Pagination` component. The view does NOT wire pagination separately.

```vue
// Correct — inside *Table.vue
<template>
  <div v-if="store.items.length > 0">
    <div class="table-wrap"> <table>...</table> </div>
    <Pagination :page :pages :total :size @change="store.goToPage" @resize="store.setSize" />
  </div>
</template>
```

### Action buttons pattern

Actions inside `<td>` MUST be wrapped in `<div class="actions-cell">`, with `v-if` on the `<td>`:

```html
<td v-if="auth.hasPermission('products_update')">
  <div class="actions-cell">
    <button class="btn btn-ghost" @click="...">Editar</button>
    <button class="btn btn-ghost danger" @click="...">Eliminar</button>
  </div>
</td>
```

### Modal pattern

All modals use:
- `<Transition name="fade">` wrapper
- `<div class="overlay" @click.self="close">` for backdrop dismiss
- `<div class="modal">` for the card
- Store-driven visibility (`v-if="store.isXxxOpen"`)
- Close via `store.closeXxx()` or `emit('close')`

### Pinia store pattern (setup stores)

Every store exports:
- `reset()` — clears all refs to initial values (mandatory, called by `resetAllStores()`)
- `goToPage(p)` / `setSize(s)` — pagination helpers
- `fetchXxx()` — main data loader
- Modal state: `isFormOpen`, `isXxxOpen`, `editingId`, `form` refs
- `loading`, `saving`, `error` for async state

### Permission gating

Use `auth.hasPermission('code')` to conditionally show buttons and table columns. Permission codes: `products_create`, `products_read`, `products_update`, `products_delete`, `events_read`, `roles_manage`, `users_manage`. Super admins bypass all checks.

```ts
const auth = useAuthStore()
// In template: v-if="auth.hasPermission('products_create')"
```

### Theme system

- `useTheme()` composable: `theme` ref, `toggle()`, `set()`
- Persists to `localStorage('theme')`, auto-detects OS preference on first visit
- CSS selectors: `[data-theme='light']` and `[data-theme='dark']`
- CSS custom properties: `--text-primary`, `--bg-surface`, `--border`, `--accent`, etc.

### API interceptor behavior

- **Request**: reads `localStorage('access_token')`, injects `Authorization: Bearer`
- **Response**: unwraps `response.data` so callers get body directly
- **Error**: checks `data.detail` first, then `data.message`, then generic fallback
- **401**: clears token from localStorage, redirects to `/auth`

## API Reference

Base URL: `VITE_API_BASE_URL` (`.env` = `http://localhost:8000/api/v1`).

### Auth (public — no token)

- `POST /auth/register` — `{ email, password, first_name?, last_name?, phone?, city?, country? }`, password min 6 max 128
- `POST /auth/login` — `{ email, password }`, returns `{ access_token, token_type }`
- `GET /auth/me` — current user profile with `roles[]` and `permissions[]`
- `PUT /auth/me` — update own profile (`first_name, last_name, phone, city, country, password`)

### Products (protected)

- `GET /products/` — paginated list
- `POST /products/` — create, required: `name`, `price`; optional: `description`, `stock`, `state`
- `PUT /products/{id}` — partial update
- `DELETE /products/{id}`

**Validation:** `name` min 1 max 200 (strip), `price` gt 0 (round 2), `stock` ge 0 (clamp), `state` enum `ACTIVE|INACTIVE|NO_STOCK|DISCONTINUED`. Setting `stock=0` forces `state → NO_STOCK`.

### Events (read-only)

- `GET /events/` — paginated list
- `GET /events/{id}` — single
- `GET /Product/{id}/events/` | `GET /User/{id}/events/`

### Roles

- `GET /roles/` — paginated list [auth]
- `POST /roles/` — create `{ name, description? }` [roles_manage]
- `PUT /roles/{id}` — update [roles_manage]
- `DELETE /roles/{id}` — delete [roles_manage]
- `GET /roles/permissions/` — all permissions [auth]
- `GET /roles/{id}/permissions` — role's permissions [auth]
- `POST /roles/{id}/permissions` — set permissions `{ permission_ids: [] }` (replaces) [roles_manage]

### Users (admin)

- `GET /users/` — paginated list [users_manage]
- `GET /users/{id}` — single user [users_manage]
- `PUT /users/{id}` — update `{ email?, password?, first_name?, last_name?, phone?, city?, country?, is_active? }` [users_manage]
- `DELETE /users/{id}` — delete [users_manage]
- `GET /users/{id}/roles` — user's roles [users_manage]
- `POST /users/{id}/roles` — assign role `{ role_id: N }` [users_manage]
