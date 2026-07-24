# AssisPrexFront

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
│   ├── layout/AppNav.vue          # navegacion principal
│   ├── products/
│   │   ├── ProductBadge.vue       # badge de estado
│   │   ├── ProductForm.vue        # modal crear/editar
│   │   └── ProductsTable.vue      # tabla de productos
│   └── ui/Pagination.vue          # paginacion reutilizable
├── router/index.ts                # rutas (/products, /events)
├── services/
│   ├── api.ts                     # instancia axios + interceptors
│   ├── events.ts                  # endpoints de eventos
│   └── products.ts                # endpoints de productos
├── stores/
│   ├── events.ts                  # Pinia store de eventos
│   └── products.ts                # Pinia store de productos (CRUD)
├── types/
│   ├── event.ts                   # tipo Event
│   ├── pagination.ts              # PaginatedResponse<T>
│   └── product.ts                 # Product, ProductForm, ProductState enum
├── views/
│   ├── EventsView.vue             # pagina de log de eventos
│   └── ProductsView.vue           # pagina de productos
├── App.vue
├── main.ts
└── style.css
```

## Rutas

| Ruta | Pagina |
|---|---|
| `/products` | CRUD de productos |
| `/events` | Log de eventos (filtrable por `?product_id=X`) |

## Endpoints esperados

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
