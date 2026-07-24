<script setup lang="ts">
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'
import ProductBadge from './ProductBadge.vue'

const store = useProductsStore()
const auth = useAuthStore()
</script>

<template>
  <div v-if="store.products.length > 0" class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Estado</th>
          <th v-if="auth.hasPermission('products_update') || auth.hasPermission('products_delete')"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in store.products" :key="product.id">
          <td class="id-cell">{{ product.id }}</td>
          <td>
            <span class="product-name">{{ product.name }}</span>
            <span v-if="product.description" class="product-desc">{{ product.description }}</span>
          </td>
          <td class="price-cell">{{ product.price.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' }) }}</td>
          <td>{{ product.stock }}</td>
          <td>
            <ProductBadge :state="product.state" />
          </td>
          <td class="actions-cell" v-if="auth.hasPermission('products_update') || auth.hasPermission('products_delete')">
            <button v-if="auth.hasPermission('products_update')" class="btn btn-ghost" @click="store.openEditForm(product)">Editar</button>
            <button v-if="auth.hasPermission('products_delete')" class="btn btn-ghost danger" @click="store.deleteProduct(product.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

td {
  font-size: 14px;
}

.id-cell {
  color: var(--text-muted);
  font-size: 13px;
}

.product-name {
  display: block;
  font-weight: 500;
}

.product-desc {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-cell {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.actions-cell {
  display: flex;
  gap: 4px;
}

.btn-ghost {
  padding: 5px 10px;
  font-size: 13px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.15s;
}

.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-ghost.danger:hover {
  background: var(--danger-light);
  color: var(--danger);
}

@media (max-width: 768px) {
  .table-wrap {
    overflow-x: auto;
  }
}
</style>
