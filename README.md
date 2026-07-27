# Logistic System Front

CRUD de productos con registro de eventos. Vue 3 + TypeScript + Pinia + Vue Router + Axios.

## Requisitos

- **Node.js** >= 22
- **pnpm** >= 9

## Instalacion

```bash
nvm use 22
pnpm install
```

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar la URL base de la API:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

| Variable | Descripcion | Default |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API | `http://localhost:3000/api` |

## Scripts

| Comando | Descripcion |
|---|---|
| `pnpm dev` | Servidor de desarrollo (Vite) |
| `pnpm build` | Typecheck + build de produccion |
| `pnpm preview` | Previsualizar build |
| `pnpm typecheck` | Solo chequeo de tipos |

## Docker

```bash
# Desarrollo (hot reload en localhost:5173)
docker compose up dev

# Produccion
docker compose up prod --build
```

Tambien se puede hacer build de la imagen directamente:

```bash
docker build -t assisprexfront .
docker run -p 80:80 assisprexfront
```

## Estructura

```
src/
├── components/
│   ├── layout/                   AppSidebar.vue, ProfileModal.vue
│   ├── products/                 ProductBadge.vue, ProductForm.vue, ProductsTable.vue
│   ├── shelves/                  ShelfCard.vue, ShelvesGrid.vue, ShelfFormModal.vue, ShelfDetailModal.vue, ProductPalette.vue
│   ├── events/                   EventBadge.vue, EventsTable.vue
│   ├── roles/                    RoleFormModal.vue, PermissionsModal.vue, RolesTable.vue
│   ├── users/                    UserFormModal.vue, RoleAssignModal.vue, UsersTable.vue
│   └── ui/                       Pagination.vue
├── composables/                  useTheme.ts, useSidebar.ts
├── router/index.ts               createWebHistory, beforeEach guard for auth
├── services/
│   ├── api.ts                    instancia axios + interceptors
│   └── auth.ts                   endpoints auth
│   └── ...                       products, events, roles, users, shelves, categories, sales
├── stores/
│   ├── auth.ts                   Pinia store autenticacion
│   └── ...                       products, events, roles, users, shelves, categories, sales
├── types/
│   ├── auth.ts                   User, LoginPayload, RegisterPayload, etc.
│   └── ...                       product, event, role, user, pagination, shelf, category, sale
├── views/
│   ├── AuthView.vue              login + registro
│   ├── VerifyEmailView.vue       activacion de cuenta
│   ├── ForgotPasswordView.vue    solicitar recuperacion
│   ├── ResetPasswordView.vue     restablecer contraseña
│   └── ...                       Products, Shelves, Events, Roles, Users, Categories, Sales
├── App.vue
├── main.ts
└── style.css
```

## Rutas

| Ruta | Pagina | Auth |
|---|---|---|
| `/auth` | Login / Registro | Publica |
| `/verify-email?token=xxx` | Activacion de cuenta | Publica |
| `/forgot-password` | Solicitar recuperacion de contraseña | Publica |
| `/reset-password?token=xxx` | Restablecer contraseña | Publica |
| `/products` | CRUD de productos | Requerido |
| `/shelves` | Estanterias | Requerido |
| `/events` | Log de eventos | Requerido |
| `/roles` | Gestion de roles y permisos | Requerido |
| `/users` | Gestion de usuarios | Requerido |
| `/categories` | Categorias de productos | Requerido |
| `/sales` | Ventas | Requerido |
| `/sales/history` | Historial de ventas | Requerido | |

## Endpoints esperados

### Auth

| Metodo | Ruta | Descripcion |
|---|---|---|
| `POST` | `/auth/register` | Registrar usuario |
| `POST` | `/auth/login` | Iniciar sesion |
| `GET` | `/auth/me` | Perfil del usuario autenticado |
| `PUT` | `/auth/me` | Actualizar perfil |
| `GET` | `/auth/activate?token=xxx` | Activar cuenta via email |
| `POST` | `/auth/forgot-password` | Solicitar reset de contraseña |
| `POST` | `/auth/reset-password` | Ejecutar reset de contraseña |

### Productos

| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/products?page=1&size=10` | Listar paginado |
| `GET` | `/products/:id` | Obtener por ID |
| `POST` | `/products` | Crear |
| `PUT` | `/products/:id` | Actualizar |
| `DELETE` | `/products/:id` | Eliminar |

### Eventos

| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `events/?page=1&size=10` | Listar eventos |
| `GET` | `events/:id` | Obtener evento |
| `GET` | `products/:id/events/?page=1&size=10` | Eventos por producto |

### Formato de respuesta paginada

```json
{
  "items": [],
  "total": 100,
  "page": 1,
  "size": 10,
  "pages": 10
}
```

## Stack

- **Vue 3** (Composition API, `<script setup lang="ts">`)
- **TypeScript 5.8** (strict mode)
- **Pinia** (state management)
- **Vue Router** (SPA routing)
- **Axios** (HTTP client)
- **Vite** (build tool)
