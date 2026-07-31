<script setup lang="ts">
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatDate } from '@/composables/useFormat'
import Pagination from '@/components/ui/Pagination.vue'

const store = useOrdersStore()
const auth = useAuthStore()

const statusLabels: Record<string, string> = {
  CREATED: 'Creado',
  PREPARING: 'Preparando',
  READY: 'Listo',
  DELIVERED: 'Entregado',
}

const statusClasses: Record<string, string> = {
  CREATED: 'status-created',
  PREPARING: 'status-preparing',
  READY: 'status-ready',
  DELIVERED: 'status-delivered',
}

const rowClasses: Record<string, string> = {
  CREATED: 'row-created',
  PREPARING: 'row-preparing',
  READY: 'row-ready',
  DELIVERED: 'row-delivered',
}
</script>

<template>
  <div v-if="store.orders.length > 0">
    <div class="table-wrap">
      <table aria-label="Lista de pedidos">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Cliente</th>
            <th scope="col">Total</th>
            <th scope="col">Estado</th>
            <th scope="col">Notas</th>
            <th scope="col">Fecha</th>
            <th scope="col" v-if="auth.hasPermission('orders_manage') || auth.hasPermission('orders_read')"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in store.orders" :key="order.id" :class="rowClasses[order.status]">
            <td class="id-cell">{{ order.id }}</td>
            <td class="name-cell">{{ order.customer_name }}</td>
            <td class="price-cell">{{ formatCurrency(order.total) }}</td>
            <td>
              <span class="status-badge" :class="statusClasses[order.status]">
                {{ statusLabels[order.status] || order.status }}
              </span>
            </td>
            <td class="desc-cell">{{ order.notes || '—' }}</td>
            <td class="date-cell">{{ formatDate(order.created_at, 'short') }}</td>
            <td v-if="auth.hasPermission('orders_manage') || auth.hasPermission('orders_read')">
              <div class="actions-cell">
                <button v-if="auth.hasPermission('orders_read')" class="btn btn-ghost" @click="store.fetchOrderDetail(order.id)">Detalle</button>
                <button
                  v-if="auth.hasPermission('orders_manage') && order.status === 'CREATED'"
                  class="btn btn-ghost"
                  @click="store.prepareOrder(order.id)"
                >Preparar</button>
                <button
                  v-if="auth.hasPermission('orders_manage') && order.status === 'PREPARING'"
                  class="btn btn-ghost"
                  @click="store.readyOrder(order.id)"
                >Listo</button>
                <button
                  v-if="auth.hasPermission('orders_manage') && order.status === 'READY'"
                  class="btn btn-ghost"
                  @click="store.deliverOrder(order.id)"
                >Entregar</button>
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
.price-cell { font-weight: 600; font-variant-numeric: tabular-nums; color: var(--accent); }

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.status-created { background: var(--bg-hover); color: var(--text-muted); }
.status-preparing { background: var(--accent-light); color: var(--accent); }
.status-ready { background: var(--warning-light); color: var(--warning); }
.status-delivered { background: var(--success-light); color: var(--success); }

.row-created  { border-left: 3px solid var(--text-muted); }
.row-preparing { border-left: 3px solid var(--accent); }
.row-ready     { border-left: 3px solid var(--warning); }
.row-delivered { border-left: 3px solid var(--success); }
</style>
