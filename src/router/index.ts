import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/AuthView.vue'),
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('@/views/VerifyEmailView.vue'),
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/ForgotPasswordView.vue'),
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/ResetPasswordView.vue'),
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('@/views/ProductsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/shelves',
    name: 'shelves',
    component: () => import('@/views/ShelvesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/events',
    name: 'events',
    component: () => import('@/views/EventsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/roles',
    name: 'roles',
    component: () => import('@/views/RolesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('@/views/CategoriesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/sales',
    name: 'sales',
    component: () => import('@/views/SalesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/sales/history',
    name: 'sales-history',
    component: () => import('@/views/SalesHistoryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/products',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('access_token')

  if (to.meta.requiresAuth && !token) {
    next({ name: 'auth' })
  } else if (to.name === 'auth' && token) {
    next({ name: 'products' })
  } else {
    next()
  }
})

const titles: Record<string, string> = {
  auth: 'Iniciar sesión — Logistic System',
  products: 'Productos — Logistic System',
  shelves: 'Estanterías — Logistic System',
  events: 'Eventos — Logistic System',
  roles: 'Roles — Logistic System',
  users: 'Usuarios — Logistic System',
  categories: 'Categorías — Logistic System',
  sales: 'Nueva venta — Logistic System',
  'sales-history': 'Historial de ventas — Logistic System',
  'verify-email': 'Verificar email — Logistic System',
  'forgot-password': 'Recuperar contraseña — Logistic System',
  'reset-password': 'Restablecer contraseña — Logistic System',
}

router.afterEach((to) => {
  document.title = titles[to.name as string] ?? 'Logistic System'
})

export default router
