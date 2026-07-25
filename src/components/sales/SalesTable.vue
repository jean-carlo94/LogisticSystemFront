<script setup lang="ts">
import { useSalesStore } from '@/stores/sales'
import { formatCurrency, formatDate } from '@/composables/useFormat'
import Pagination from '@/components/ui/Pagination.vue'

const store = useSalesStore()
</script>

<template>
  <div v-if="store.sales.length > 0">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sale in store.sales" :key="sale.id">
            <td class="id-cell">{{ sale.id }}</td>
            <td class="name-cell">{{ sale.customer_name }}</td>
            <td class="price-cell">{{ formatCurrency(sale.total) }}</td>
            <td>
              <span class="status-badge" :class="'status-' + sale.status.toLowerCase()">{{ sale.status }}</span>
            </td>
            <td class="date-cell">{{ formatDate(sale.created_at) }}</td>
            <td>
              <div class="actions-cell">
                <button class="btn btn-ghost" @click="store.fetchSaleDetail(sale.id)">Detalle</button>
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
.price-cell {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.status-completed {
  background: var(--success-light);
  color: var(--success);
}
</style>
