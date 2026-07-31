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
- **Store reset**: When login/logout occurs, `authStore` calls `resetAllStores()` which invokes `reset()` on all other stores (products, events, roles, users, shelves, categories, sales, orders, taxes, tenants). Every new store MUST expose a `reset()` method that clears all state to initial values.
- **CSS conventions**: Shared UI classes live in `src/style.css` (not duplicated in scoped blocks). Global classes include: `.page`, `.table-wrap`, `.overlay`, `.modal`, `.form`, `.field`, `.row`, `.actions`, `.btn-ghost`, `.empty-state`, `.error-banner`, `.id-cell`, `.date-cell`, `.actions-cell`, `.skeleton`, `.skeleton-table`, `.skeleton-row`, `.filter-group`, `.filter-label`. Component `<style scoped>` blocks should ONLY contain classes unique to that component.
- **Logic reuse**: Common formatters live in `src/composables/useFormat.ts` (`formatDate`). User display name is a store computed (`authStore.displayName`). Do not duplicate these in components.
- **Accessibility conventions**:
  - Every filter input/select MUST have `aria-label` describing its purpose (e.g. `aria-label="Filtrar por nombre"`)
  - Every filter bar MUST wrap each input in `<div class="filter-group"><label class="filter-label">LABEL</label> ... </div>` for visual consistency
  - Every modal MUST have `role="dialog" aria-modal="true" aria-labelledby="..."` on `.modal`, a matching `:id` on the `<h2>`, and `@keydown.escape` to close
  - Every data table MUST have `scope="col"` on all `<th>` elements and `aria-label` on `<table>`
  - Every non-interactive clickable element (`<div @click>`) MUST have `role="button" tabindex="0"` plus `@keydown.enter` and `@keydown.space.prevent` handlers
  - Icon-only buttons (SVG without visible text) MUST have `aria-label`
  - `lang="es"` on `<html>` — UI is in Spanish
  - `document.title` is updated dynamically via `router.afterEach` in `src/router/index.ts`

## Architecture

```
src/
  components/
    layout/          AppSidebar.vue, ProfileModal.vue
    products/        ProductBadge.vue, ProductForm.vue (modal, on-demand category + tax search, price-with-tax preview), ProductsTable.vue (table + pagination, category & tax columns)
    shelves/         ShelfCard.vue, ShelvesGrid.vue (grid + pagination), ShelfFormModal.vue, ShelfDetailModal.vue, ProductPalette.vue
    sales/           ProductCard.vue (stock gate + inline restock), ProductSearch.vue (debounced search), SalesCart.vue (customer accordion + tax tags), SalesTable.vue (table + pagination), ShelfPickerModal.vue (with "Sin estantería" option), SaleDetailModal.vue (customer fields + tax summary)
    events/          EventBadge.vue, EventsTable.vue (table + pagination)
    roles/           RoleFormModal.vue, PermissionsModal.vue, RolesTable.vue (table + pagination)
    users/           UserFormModal.vue, RoleAssignModal.vue, UsersTable.vue (table + pagination)
    taxes/           TaxFormModal.vue, TaxesTable.vue (table + pagination)
    orders/          OrderFormModal.vue (customer accordion + editable qty + tax tags), OrderDetailModal.vue (customer fields), OrdersTable.vue, OrdersBoard.vue (kanban + drag-drop)
    ui/              Pagination.vue (page size selector + page buttons)
  composables/       useTheme.ts (dark/light toggle, OS auto-detect), useSidebar.ts (collapse state)
  router/index.ts    createWebHistory, beforeEach guard for auth
  services/          Axios instance (api.ts) + per-resource methods
  stores/            Pinia setup-function stores
  types/             TS interfaces + enums per domain
   views/             Page-level components (minimal wiring: header, state, table, modals)
                     AuthView, VerifyEmailView, ForgotPasswordView, ResetPasswordView
                     ProductsView, ShelvesView, EventsView, RolesView, UsersView
                     CategoriesView, SalesView, OrdersView, TaxesView, TenantsView
```

### View pattern

Views are thin containers. They only render the page header, loading/error/empty state, and delegate table + pagination + modals to their component files. Never put inline table markup or modal markup inside a view.

Auth-flow views (`AuthView`, `VerifyEmailView`, `ForgotPasswordView`, `ResetPasswordView`) are the exception: they are self-contained form pages (login, register, activation, password reset) without table/modal delegation.

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

**CRITICAL: Every reactive value (`ref`, `computed`, `reactive`) declared inside a setup store MUST be returned from the setup function.** Values not returned are invisible to DevTools, SSR, and Pinia plugins. If you need "private" state, use a naming convention (`_name`) instead of omitting it from the return.

### Permission gating

Use `auth.hasPermission('code')` to conditionally show buttons and table columns. Permission codes: `products_create`, `products_read`, `products_update`, `products_delete`, `categories_*`, `shelves_*`, `sales_*`, `orders_*`, `events_read`, `roles_manage`, `users_manage`, `tenants_manage`, `taxes_read`, `taxes_manage`, `customers_read`, `customers_manage`. Super admins bypass all checks.

```ts
const auth = useAuthStore()
// In template: v-if="auth.hasPermission('products_create')"
```

### Theme system

- `useTheme()` composable: `theme` ref, `toggle()`
- Persists to `localStorage('theme')`, auto-detects OS preference on first visit
- CSS selectors: `[data-theme='light']` and `[data-theme='dark']`
- CSS custom properties: `--text-primary`, `--bg-surface`, `--border`, `--accent`, etc.

### API interceptor behavior

- **Request**: reads `localStorage('access_token')`, injects `Authorization: Bearer`
- **Response**: unwraps `response.data` so callers get body directly
- **Error**: checks `data.detail` first, then `data.message`, then generic fallback
- **401**: clears token from localStorage, redirects to `/auth` via `router.push` (NOT `window.location.href`)
- **Production logging**: `console.error` in the error interceptor is gated behind `import.meta.env.DEV`. Never log API URLs or methods unconditionally.

### Security rules

- **CSP**: `index.html` includes a Content-Security-Policy meta tag using `%VITE_CSP_ORIGINS%` (set via `.env`, defaults to `http://localhost:*`). `ws://localhost:*` is always appended to `connect-src` for Vite HMR. If you add new external resources (CDNs, analytics, third-party fonts/images), update the CSP or the app will break.
- **No `v-html`, `innerHTML`, `eval()`, `Function()`** — Vue template interpolation escapes HTML automatically. Never bypass it. If rich text rendering is ever needed, use a sanitizer library (DOMPurify) and update the CSP.
- **Password fields MUST have `autocomplete`** — `autocomplete="current-password"` for login forms, `autocomplete="new-password"` for registration, profile edits, and admin user forms.
- **File upload validation** — every image upload component MUST validate MIME type (`file.type.startsWith('image/')`) AND enforce a 5 MB size limit (`MAX_IMAGE_SIZE = 5 * 1024 * 1024`). Show a user-facing error on rejection (never silently ignore). The backend is the authoritative validator; frontend checks are defense-in-depth.
- **Error messages from API** — displayed via `{{ error }}` template interpolation (auto-escaped by Vue). Never reflect raw backend strings into `v-html` or attribute bindings without sanitization.
- **No secrets in frontend code** — `.env` only contains `VITE_API_BASE_URL` and `VITE_CSP_ORIGINS`. Never commit actual API keys, tokens, or credentials. The `.env.example` exists as a template.
- **Tokens in query strings** — `VerifyEmailView` and `ResetPasswordView` read tokens via `route.query.token`. These tokens persist in browser history, server access logs, and may leak via `Referer` header. This is a known trade-off (the backend sends links with tokens in the URL). If the backend ever changes to hash fragments or POST-based token submission, update both views accordingly.

## Production deployment

```bash
docker compose up prod -d          # frontend + backend + postgres
docker compose up dev              # Vite dev server with HMR
```

### Architecture

- **`nginx.conf`** — SPA fallback (`try_files $uri /index.html`), API proxy (`/api/` → `backend:8000`), CSP header with `${CSP_IMG_ORIGINS}` and `${CSP_CONNECT_ORIGINS}` placeholders (processed by `envsubst` at startup)
- **`Dockerfile`** — two-stage: `node:22-alpine` builds the Vue app with `VITE_API_BASE_URL=/api/v1` and `VITE_CSP_ORIGINS`, then `nginx:alpine` + `gettext` serves via envsubst-processed nginx config
- **`docker-compose.yml`** — `dev` (Vite HMR), `prod` (nginx + build), `backend` (placeholder), `db` (postgres:16)

### CSP strategy

- **Dev**: meta tag in `index.html` uses `%VITE_CSP_ORIGINS%` (from `.env`, default `http://localhost:*`) + `ws://localhost:*` for HMR
- **Prod**: nginx CSP header is templated via `envsubst`: `${CSP_IMG_ORIGINS}` and `${CSP_CONNECT_ORIGINS}` env vars (both default empty, same-origin proxy). The server header overrides the meta tag
- **Build arg**: `VITE_CSP_ORIGINS` (defaults to empty string in prod build, keeps CSP strict)
- If the backend domain is different from the frontend in prod, set `CSP_IMG_ORIGINS`/`CSP_CONNECT_ORIGINS` env vars and the `VITE_CSP_ORIGINS` build arg

## API Reference

Base URL: `VITE_API_BASE_URL` (`.env` = `http://localhost:8000/api/v1`).

### Auth (public — no token)

- `POST /auth/register` — `{ email, password, first_name?, last_name?, phone?, city?, country? }`, password min 6 max 128
- `POST /auth/login` — `{ email, password }`, returns `{ access_token, token_type }`
- `GET /auth/me` — current user profile with `roles[]` and `permissions[]`
- `PUT /auth/me` — update own profile (`first_name, last_name, phone, city, country, password`)
- `GET /auth/activate?token=xxx` — activate account via email token, returns `{ message }`
- `POST /auth/forgot-password` — `{ email }`, always returns `{ message }` (anti-enumeration), sends reset email if account exists
- `POST /auth/reset-password` — `{ token, new_password }` (new_password min 6 max 128), returns `{ message }`

### Products (protected)

- `GET /products/` — paginated list
- `POST /products/` — create, required: `name`, `price`; optional: `description`, `stock`, `state`, `category_ids`, `tax_ids`, `barcode`, `weight_kg`, `width_cm`, `height_cm`, `depth_cm`
- `PUT /products/{id}` — partial update
- `DELETE /products/{id}`

**Validation:** `name` min 1 max 200 (strip), `price` gt 0 (round 2), `stock` ge 0 (clamp), `state` enum `ACTIVE|INACTIVE|NO_STOCK|DISCONTINUED`. Setting `stock=0` forces `state → NO_STOCK`. Response includes `taxes: [{id, name, rate}]`.

### Categories

- `GET /categories/` — paginated list, supports `?name=` filter (used by ProductForm for on-demand search)
- `POST /categories/` — create `{ name, description? }`
- `PUT /categories/{id}` — update
- `DELETE /categories/{id}`

### Taxes

- `GET /taxes/` — paginated list, supports `?name=` filter [taxes_read]
- `POST /taxes/` — create `{ name, rate, description? }` [taxes_manage]
- `PUT /taxes/{id}` — update `{ name?, rate?, description?, is_active? }` [taxes_manage]
- `DELETE /taxes/{id}` [taxes_manage]

### Customers

- `GET /customers/` — paginated list, supports `?name=`, `?email=`, `?document=` filters [customers_read]
- Used by SalesCart and OrderFormModal for existing customer search (debounced autocomplete, populates all fields on select)

### Orders

- `GET /orders/` — paginated list [orders_read]
- `GET /orders/{id}` — single order with items [orders_read]
- `POST /orders/` — create `{ customer_name, customer_email?, customer_phone?, customer_document?, customer_address?, notes?, items: [{ product_id, shelf_id?, quantity, unit_price }] }` [orders_create]
- `POST /orders/{id}/prepare` — CREATED → PREPARING [orders_manage]
- `POST /orders/{id}/ready` — PREPARING → READY [orders_manage]
- `POST /orders/{id}/deliver` — READY → DELIVERED, creates a sale automatically [orders_manage]

### Events (read-only)

- `GET /events/` — paginated list
- `GET /events/{id}` — single
- `GET /Product/{id}/events/` | `GET /User/{id}/events/`

### Sales

- `GET /sales/` — paginated list
- `GET /sales/{id}` — single sale with items
- `POST /sales/` — create `{ customer_name, customer_email?, customer_phone?, customer_document?, customer_address?, notes?, items: [{ product_id, shelf_id?, quantity, unit_price }] }`. Customer fields are optional; if omitted, `customer_name` defaults to `"Consumidor final"`. If `shelf_id` is omitted/null, only product stock is reduced. If present, both shelf quantity and product stock are reduced. Response items include `tax_amount`.

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

## Gotchas / Guardrails

Rules discovered via audit. Violations cause bugs, memory leaks, or broken SSR/DevTools. Follow these on every new component and store.

### 1. Stor-level timers MUST be cleaned in reset()

Any `setTimeout`/`setInterval` in a store must be stored in a variable and cleared in `reset()`.

```ts
// Correct
let _timer: ReturnType<typeof setTimeout> | null = null

function someAction() {
  _timer = setTimeout(() => { ... }, 2000)
}

function reset() {
  if (_timer) clearTimeout(_timer)
  _timer = null
}
```

### 2. Components MUST cleanup timers + watchers in onUnmounted

All `setTimeout`, `setInterval`, and `watch()` must be stored and cleaned up.

```ts
// Correct
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const unwatch = watch(source, () => { ... })

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  unwatch()
})
```

### 3. Use useTemplateRef() for template refs (Vue 3.5+)

```ts
// Correct (Vue 3.5+)
import { useTemplateRef } from 'vue'
const input = useTemplateRef<HTMLInputElement>('myInput')

// Wrong
const input = ref<HTMLInputElement | null>(null)
```

### 4. No inline complex expressions in templates

Move `.filter()`, `.map()`, `.find()`, `.toLocaleString()`, `.join()` chains to `computed` or helper functions.

```vue
<!-- Wrong -->
<span>{{ store.user?.roles?.map(r => r.name).join(', ') || '—' }}</span>
<span>{{ product.price.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' }) }}</span>

<!-- Correct -->
<span>{{ roleNames }}</span>
<span>{{ formatCurrency(product.price) }}</span>
```

### 5. CSS classes over inline styles for layout

No `style="width: 560px; max-height: 90vh"` on modals. Use CSS classes.

```vue
<!-- Wrong -->
<div class="modal" style="width: 560px; max-height: 90vh;">

<!-- Correct -->
<div class="modal product-form-modal">
```

### 6. Computed must be pure

No side effects (mutations, API calls, emit, storage writes) inside `computed()`. Use `watch()` for side effects.

```ts
// Wrong — side effect in computed
const doubled = computed(() => {
  if (count.value > 10) api.log(count.value) // side effect!
  return count.value * 2
})

// Correct
const doubled = computed(() => count.value * 2)
watch(doubled, (v) => { if (v > 20) api.log(v) })
```

### 7. Auto-filters: debounce + cleanup pattern

Every filter bar with text input needs a debounced watcher with `onUnmounted` cleanup. The debounce timer and unwatcher must be stored.

### 8. Store reset must clear ALL state

Every `ref`, `computed` dependency state, timer, and reactive value must be reset to its initial value in the store's `reset()` method. This is called on logout by `resetAllStores()`.

### 9. Error state must be cleared on close

All `closeForm()`, `closeDetail()`, `closeAssign()`, `closePermissions()` methods must set `error.value = null` to prevent stuck error banners.
