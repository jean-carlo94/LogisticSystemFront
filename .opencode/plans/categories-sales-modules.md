# Plan: Módulos Categorías y Ventas

## 1. Tipos nuevos

### `src/types/category.ts`
```ts
export interface Category { id, name, description, created_at }
export interface CategoryForm { name, description }
export function createEmptyCategory(): CategoryForm
```

### `src/types/sale.ts`
```ts
export interface SaleItem { id, product_id, product_name, shelf_id, shelf_code, quantity, unit_price, subtotal }
export interface Sale { id, customer_name, total, status, notes, created_at, created_by, items? }
export interface CreateSalePayload { customer_name, notes?, items: CreateSaleItemPayload[] }
export interface CreateSaleItemPayload { product_id, shelf_id, quantity, unit_price }
export interface ProductLocation { shelf_id, code, aisle, row, level, quantity }
export interface CartItem { product_id, product_name, shelf_id, shelf_code, quantity, unit_price, stock }
```

### Modificar `src/types/product.ts`
Agregar campo `categories` al interface `Product`:
```ts
categories: { id: number; name: string }[]
```

---

## 2. Servicios nuevos

### `src/services/categories.ts`
- `getAll(page, size, filters?)` → `GET /categories/`
- `create(data: CategoryForm)` → `POST /categories/`
- `update(id, data: CategoryForm)` → `PUT /categories/{id}`
- `remove(id)` → `DELETE /categories/{id}`

### `src/services/sales.ts`
- `getAll(page, size, filters?)` → `GET /sales/`
- `getOne(id)` → `GET /sales/{id}`
- `create(data: CreateSalePayload)` → `POST /sales/`

### Agregar a `src/services/products.ts`
- `getLocations(id)` → `GET /products/{id}/locations`

---

## 3. Stores nuevos

### `src/stores/categories.ts` (patrón CRUD estándar)
State: `categories`, `form`, `editingId`, `isFormOpen`, `loading`, `error`, `saving`, `page`, `size`, `total`, `pages`, `filterParams`
Métodos: `fetchCategories`, `setFilter`, `goToPage`, `setSize`, `openCreateForm`, `openEditForm`, `closeForm`, `saveCategory`, `deleteCategory`, `reset`

### `src/stores/sales.ts` (POS + historial)
State:
- Ventas (historial): `sales`, `loading`, `error`, `page`, `size`, `total`, `pages`
- POS: `cart` (CartItem[]), `searchedProducts` (Product[]), `searchLoading`, `searchError`, `selectedProduct`, `locations` (ProductLocation[]), `locationsLoading`, `saving`, `customerName`, `notes`
- Modal: `isShelfPickerOpen`, `isDetailOpen`, `selectedSale`
- Computed: `cartTotal` (auto-suma)

Métodos:
- Historial: `fetchSales`, `goToPage`, `setSize`, `fetchSaleDetail`, `closeDetail`
- POS: `searchProducts(query)`, `openShelfPicker(product)`, `fetchLocations(productId)`, `closeShelfPicker`, `addToCart(item)`, `removeFromCart(index)`, `updateCartQuantity(index, qty)`, `clearCart`, `submitSale`
- `reset()` — limpia TODO

---

## 4. Componentes

### Categorías

**`src/components/categories/CategoriesTable.vue`**
- Tabla estándar con columnas: #, Nombre, Descripción, Fecha, Acciones
- Pagination embebido
- Botones Editar/Eliminar con permisos `categories_update`/`categories_delete`

**`src/components/categories/CategoryFormModal.vue`**
- Modal con Transition+overlay
- Campos: name (required), description (textarea opcional)
- Store-driven: `v-if="store.isFormOpen"`

### Ventas

**`src/components/sales/ProductCard.vue`**
- Card touch-friendly (min-height ~120px, cursor pointer, hover effect)
- Muestra: nombre, precio (formatCurrency), stock badge, barcode (muted), badges de categorías
- Emite `@select` al hacer click

**`src/components/sales/ProductSearch.vue`**
- Input de búsqueda con debounce (400ms)
- Grid de ProductCards (3 cols desktop, 2 tablet, 1 mobile)
- Estados: loading (skeleton cards), empty ("No se encontraron productos"), error

**`src/components/sales/ShelfPickerModal.vue`**
- Modal que muestra ubicaciones del producto (GET /products/{id}/locations)
- Cada ubicación: código, pasillo, fila, nivel, cantidad disponible
- Input de cantidad (default 1, min 1, max = available)
- Botón "Agregar al carrito"
- Si no hay ubicaciones: "Producto sin ubicación asignada"

**`src/components/sales/SalesCart.vue`**
- Panel lateral derecho (sticky, 380px)
- Campo: customer_name (required)
- Campo: notes (opcional)
- Lista de items con:
  - Nombre producto
  - Código estantería
  - Precio unitario (editable)
  - Cantidad (+/- buttons)
  - Subtotal (auto-calculado)
  - Botón quitar (X)
- Total general (auto-suma, formato moneda)
- Botón "Registrar Venta" (disabled si carrito vacío o sin customer_name)
- Botón "Limpiar carrito"

**`src/components/sales/SalesTable.vue`**
- Tabla estándar: #, Cliente, Total, Estado, Fecha, Acciones
- Pagination embebido
- Botón "Ver detalle" → abre SaleDetailModal

**`src/components/sales/SaleDetailModal.vue`**
- Modal con detalle completo de venta
- Info: cliente, total, estado, notas, fecha
- Tabla de items: producto, estantería, cantidad, precio unitario, subtotal

---

## 5. Vistas

### `src/views/CategoriesView.vue`
- Patrón delgado: header + CategoryFormModal + filtro (nombre) + CategoriesTable
- Debounce watcher para filtro

### `src/views/SalesView.vue` (POS)
- Layout 2 columnas (flex):
  - Izquierda (flex: 1): ProductSearch
  - Derecha (380px, sticky): SalesCart
- ShelfPickerModal como overlay
- En mobile: layout vertical (cart abajo como drawer)

### `src/views/SalesHistoryView.vue`
- Patrón delgado: header + SalesTable + SaleDetailModal

---

## 6. Modificaciones a archivos existentes

### `src/router/index.ts`
Agregar rutas:
```ts
{ path: '/categories', name: 'categories', component: () => import('@/views/CategoriesView.vue'), meta: { requiresAuth: true } }
{ path: '/sales', name: 'sales', component: () => import('@/views/SalesView.vue'), meta: { requiresAuth: true } }
{ path: '/sales/history', name: 'sales-history', component: () => import('@/views/SalesHistoryView.vue'), meta: { requiresAuth: true } }
```

### `src/components/layout/AppSidebar.vue`
Agregar items:
```ts
{ to: '/categories', label: 'Categorías', icon: 'tag', show: store.hasPermission('categories_read') }
{ to: '/sales', label: 'Ventas', icon: 'cart', show: store.hasPermission('sales_read') }
```
Agregar íconos SVG: `tag` y `cart`

### `src/stores/auth.ts`
Agregar a `resetAllStores()`:
```ts
useCategoriesStore().reset()
useSalesStore().reset()
```
Agregar imports correspondientes.

### `src/types/product.ts`
Agregar campo al interface `Product`:
```ts
categories: { id: number; name: string }[]
```

### `src/services/products.ts`
Agregar método:
```ts
async getLocations(id: number): Promise<ProductLocation[]>
```

---

## Orden de implementación

1. Tipos (category.ts, sale.ts, modificar product.ts)
2. Servicios (categories.ts, sales.ts, modificar products.ts)
3. Stores (categories.ts, sales.ts)
4. Componentes de categorías (2 archivos)
5. Componentes de ventas (5 archivos)
6. Vistas (3 archivos)
7. Modificar router, sidebar, auth store
8. Typecheck y verificar
