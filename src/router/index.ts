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
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/OrdersView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tenants',
    name: 'tenants',
    component: () => import('@/views/TenantsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/stations',
    name: 'stations',
    component: () => import('@/views/StationsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/customers',
    name: 'customers',
    component: () => import('@/views/CustomersView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/cash-register',
    name: 'cash-register',
    component: () => import('@/views/CashRegisterView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/taxes',
    name: 'taxes',
    component: () => import('@/views/TaxesView.vue'),
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
  auth: 'Iniciar sesión',
  products: 'Productos',
  shelves: 'Estanterías',
  events: 'Eventos',
  roles: 'Roles',
  users: 'Usuarios',
  categories: 'Categorías',
  sales: 'Nueva venta',
  orders: 'Pedidos',
  tenants: 'Tenants',
  stations: 'Estaciones',
  customers: 'Clientes',
  'cash-register': 'Caja registradora',
  taxes: 'Impuestos',
  'verify-email': 'Verificar email',
  'forgot-password': 'Recuperar contraseña',
  'reset-password': 'Restablecer contraseña',
}

router.afterEach((to) => {
  const name = titles[to.name as string]
  document.title = name ? `${name} — Logistic System` : 'Logistic System'
})

export default router
