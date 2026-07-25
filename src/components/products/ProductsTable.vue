<script setup lang="ts">
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'
import { useShelvesStore } from '@/stores/shelves'
import { useRouter } from 'vue-router'
import ProductBadge from './ProductBadge.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { getMediaUrl, formatCurrency } from '@/composables/useFormat'

const store = useProductsStore()
const auth = useAuthStore()
const shelvesStore = useShelvesStore()
const router = useRouter()

function openShelf(shelfId: number) {
  if (shelvesStore.details.size === 0) {
    shelvesStore.fetchShelves()
  }
  router.push({ path: '/shelves', query: { open: shelfId } })
}
</script>

<template>
  <div v-if="store.products.length > 0">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Img</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Código</th>
            <th>Estanterías</th>
            <th>Estado</th>
            <th v-if="auth.hasPermission('products_update') || auth.hasPermission('products_delete')"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in store.products" :key="product.id">
            <td class="id-cell">{{ product.id }}</td>
            <td>
              <img
                v-if="product.image_url"
                :src="getMediaUrl(product.image_url) || ''"
                class="product-thumb"
                alt=""
              />
              <span v-else class="no-thumb">—</span>
            </td>
            <td>
              <span class="product-name">{{ product.name }}</span>
              <span v-if="product.description" class="product-desc">{{ product.description }}</span>
            </td>
            <td class="price-cell">{{ formatCurrency(product.price) }}</td>
            <td>{{ product.stock }}</td>
            <td class="muted">{{ product.barcode || '—' }}</td>
            <td>
              <div class="shelf-badges">
                <template v-if="shelvesStore.details.size > 0">
                  <span
                    v-for="s in shelvesStore.getProductShelves(product.id)"
                    :key="s.shelfId"
                    class="shelf-badge"
                    @click="openShelf(s.shelfId)"
                    :title="s.name + ' (×' + s.quantity + ')'"
                  >{{ s.code }} ×{{ s.quantity }}</span>
                </template>
                <span v-else class="muted">—</span>
              </div>
            </td>
            <td>
              <ProductBadge :state="product.state" />
            </td>
            <td v-if="auth.hasPermission('products_update') || auth.hasPermission('products_delete')">
              <div class="actions-cell">
                <button v-if="auth.hasPermission('products_update')" class="btn btn-ghost" @click="store.openEditForm(product)">Editar</button>
                <button v-if="auth.hasPermission('products_delete')" class="btn btn-ghost danger" @click="store.deleteProduct(product.id)">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :page="store.page" :pages="store.pages" :total="store.total" :size="store.size" @change="store.goToPage" @resize="store.setSize" />
  </div>
</template>

<style scoped>
.product-name { display: block; font-weight: 500; }

.product-desc {
  display: block; font-size: 12px; color: var(--text-muted);
  margin-top: 2px; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.price-cell { font-weight: 500; font-variant-numeric: tabular-nums; }

.product-thumb {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.no-thumb {
  color: var(--text-muted);
  font-size: 13px;
}

.shelf-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.shelf-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--accent-light);
  color: var(--accent);
  cursor: pointer;
  white-space: nowrap;
  font-family: var(--mono);
  font-weight: 500;
}

.shelf-badge:hover {
  background: var(--accent);
  color: #fff;
}
</style>
