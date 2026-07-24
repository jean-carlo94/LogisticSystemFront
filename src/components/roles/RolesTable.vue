<script setup lang="ts">
import { useRolesStore } from '@/stores/roles'
import { useAuthStore } from '@/stores/auth'
import Pagination from '@/components/ui/Pagination.vue'

const store = useRolesStore()
const auth = useAuthStore()
</script>

<template>
  <div v-if="store.roles.length > 0">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th v-if="auth.hasPermission('roles_manage')"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in store.roles" :key="role.id">
            <td class="id-cell">{{ role.id }}</td>
            <td class="name-cell">{{ role.name }}</td>
            <td class="desc-cell">{{ role.description || '—' }}</td>
            <td v-if="auth.hasPermission('roles_manage')">
              <div class="actions-cell">
                <button class="btn btn-ghost" @click="store.openPermissions(role.id)">Permisos</button>
                <button class="btn btn-ghost" @click="store.openEditForm(role)">Editar</button>
                <button class="btn btn-ghost danger" @click="store.deleteRole(role.id)">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :page="store.page" :pages="store.pages" :total="store.total" :size="store.size" @change="store.goToPage" @resize="store.setSize" />
  </div>
</template>
