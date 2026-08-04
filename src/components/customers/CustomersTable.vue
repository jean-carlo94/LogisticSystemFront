<script setup lang="ts">
import { useCustomersStore } from '@/stores/customers'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/composables/useFormat'
import Pagination from '@/components/ui/Pagination.vue'

const store = useCustomersStore()
const auth = useAuthStore()
</script>

<template>
  <div v-if="store.customers.length > 0">
    <div class="table-wrap">
      <table aria-label="Lista de clientes">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Nombre</th>
            <th scope="col">Email</th>
            <th scope="col">Teléfono</th>
            <th scope="col">Documento</th>
            <th scope="col">Dirección</th>
            <th scope="col">Fecha</th>
            <th v-if="auth.hasPermission('customers_manage')" scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in store.customers" :key="customer.id">
            <td class="id-cell">{{ customer.id }}</td>
            <td class="name-cell">{{ customer.name }}</td>
            <td class="email-cell">{{ customer.email || '—' }}</td>
            <td>{{ customer.phone || '—' }}</td>
            <td>{{ customer.document || '—' }}</td>
            <td class="desc-cell">{{ customer.address || '—' }}</td>
            <td class="date-cell">{{ formatDate(customer.created_at) }}</td>
            <td v-if="auth.hasPermission('customers_manage')">
              <div class="actions-cell">
                <button class="btn btn-ghost" @click="store.openEditForm(customer)">Editar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :page="store.page" :pages="store.pages" :total="store.total" :size="store.size" @change="store.goToPage" @resize="store.setSize" />
  </div>
</template>
