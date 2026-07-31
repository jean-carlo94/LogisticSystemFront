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
      <table aria-label="Lista de productos">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Img</th>
            <th scope="col">Nombre</th>
            <th scope="col">Precio</th>
            <th scope="col">Stock</th>
            <th scope="col">Código</th>
            <th scope="col">Categorías</th>
            <th scope="col">Impuestos</th>
            <th scope="col">Estanterías</th>
            <th scope="col">Estado</th>
            <th scope="col" v-if="auth.hasPermission('products_update') || auth.hasPermission('products_delete')"></th>
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
              <div v-if="product.categories.length > 0" class="tag-group">
                <span v-for="cat in product.categories" :key="cat.id" class="category-tag">{{ cat.name }}</span>
              </div>
              <span v-else class="muted">—</span>
            </td>
            <td>
              <div v-if="product.taxes && product.taxes.length > 0" class="tag-group">
                <span v-for="tax in product.taxes" :key="tax.id" class="tax-tag">{{ tax.name }} {{ tax.rate }}%</span>
              </div>
              <span v-else class="muted">—</span>
            </td>
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

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.category-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 500;
}

.tax-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--success-light);
  color: var(--success);
  font-weight: 500;
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
