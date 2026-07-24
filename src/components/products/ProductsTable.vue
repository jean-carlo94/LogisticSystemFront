<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import ProductBadge from './ProductBadge.vue'

const store = useProductsStore()
const router = useRouter()

function viewEvents(productId: number) {
  router.push({ name: 'events', query: { product_id: String(productId) } })
}
</script>

<template>
  <table v-if="store.products.length > 0" class="products-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Nombre</th>
        <th>Precio</th>
        <th>Stock</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="product in store.products" :key="product.id">
        <td>{{ product.id }}</td>
        <td>
          <strong>{{ product.name }}</strong>
          <small v-if="product.description">{{ product.description }}</small>
        </td>
        <td>{{ product.price.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' }) }}</td>
        <td>{{ product.stock }}</td>
        <td>
          <ProductBadge :state="product.state" />
        </td>
        <td>
          <div class="actions">
            <button class="btn btn-sm btn-log" @click="viewEvents(product.id)">Log</button>
            <button class="btn btn-sm btn-edit" @click="store.openEditForm(product)">Editar</button>
            <button class="btn btn-sm btn-danger" @click="store.deleteProduct(product.id)">Eliminar</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th,
.products-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.products-table th {
  text-align: left;
  font-weight: 500;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text);
}

.products-table td strong {
  display: block;
  color: var(--text-h);
}

.products-table td small {
  display: block;
  font-size: 13px;
  color: var(--text);
  margin-top: 4px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.btn {
  font-family: inherit;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  background: var(--bg);
  color: var(--text-h);
  transition: background 0.2s, border-color 0.2s;
}

.btn:hover {
  border-color: var(--accent-border);
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

.btn-edit:hover {
  color: var(--accent);
}

.btn-log {
  color: #3b82f6;
  border-color: #3b82f6;
  background: transparent;
}

.btn-log:hover {
  background: #3b82f6;
  color: #fff;
}

.btn-danger {
  color: #ef4444;
  border-color: #ef4444;
  background: transparent;
}

.btn-danger:hover {
  background: #ef4444;
  color: #fff;
}

@media (max-width: 768px) {
  .products-table th:nth-child(4),
  .products-table td:nth-child(4),
  .products-table th:nth-child(5),
  .products-table td:nth-child(5) {
    display: none;
  }
}
</style>
