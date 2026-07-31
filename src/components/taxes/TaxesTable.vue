<script setup lang="ts">
import { useTaxesStore } from '@/stores/taxes'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/composables/useFormat'
import Pagination from '@/components/ui/Pagination.vue'

const store = useTaxesStore()
const auth = useAuthStore()
</script>

<template>
  <div v-if="store.taxes.length > 0">
    <div class="table-wrap">
      <table aria-label="Lista de impuestos">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Nombre</th>
            <th scope="col">Tasa</th>
            <th scope="col">Descripción</th>
            <th scope="col">Activo</th>
            <th scope="col">Fecha</th>
            <th scope="col" v-if="auth.hasPermission('taxes_manage')"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tax in store.taxes" :key="tax.id">
            <td class="id-cell">{{ tax.id }}</td>
            <td>{{ tax.name }}</td>
            <td class="rate-cell">{{ tax.rate }}%</td>
            <td>{{ tax.description || '—' }}</td>
            <td>
              <button
                v-if="auth.hasPermission('taxes_manage')"
                class="btn btn-ghost"
                :aria-label="tax.is_active ? 'Desactivar impuesto' : 'Activar impuesto'"
                @click="store.toggleActive(tax)"
              >
                {{ tax.is_active ? 'Sí' : 'No' }}
              </button>
              <span v-else>{{ tax.is_active ? 'Sí' : 'No' }}</span>
            </td>
            <td class="date-cell">{{ formatDate(tax.created_at) }}</td>
            <td v-if="auth.hasPermission('taxes_manage')">
              <div class="actions-cell">
                <button class="btn btn-ghost" @click="store.openEditForm(tax)">Editar</button>
                <button class="btn btn-ghost danger" @click="store.deleteTax(tax.id)">Eliminar</button>
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
.rate-cell { font-weight: 500; font-variant-numeric: tabular-nums; }
</style>
