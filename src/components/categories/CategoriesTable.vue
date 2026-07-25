<script setup lang="ts">
import { useCategoriesStore } from '@/stores/categories'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/composables/useFormat'
import Pagination from '@/components/ui/Pagination.vue'

const store = useCategoriesStore()
const auth = useAuthStore()
</script>

<template>
  <div v-if="store.categories.length > 0">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Fecha</th>
            <th v-if="auth.hasPermission('categories_update') || auth.hasPermission('categories_delete')"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in store.categories" :key="category.id">
            <td class="id-cell">{{ category.id }}</td>
            <td class="name-cell">{{ category.name }}</td>
            <td class="desc-cell">{{ category.description || '—' }}</td>
            <td class="date-cell">{{ formatDate(category.created_at) }}</td>
            <td v-if="auth.hasPermission('categories_update') || auth.hasPermission('categories_delete')">
              <div class="actions-cell">
                <button v-if="auth.hasPermission('categories_update')" class="btn btn-ghost" @click="store.openEditForm(category)">Editar</button>
                <button v-if="auth.hasPermission('categories_delete')" class="btn btn-ghost danger" @click="store.deleteCategory(category.id)">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :page="store.page" :pages="store.pages" :total="store.total" :size="store.size" @change="store.goToPage" @resize="store.setSize" />
  </div>
</template>
