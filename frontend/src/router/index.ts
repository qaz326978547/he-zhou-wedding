import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: App },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminDashboard.vue'),
    },
    {
      path: '/admin/login',
      component: () => import('../views/admin/AdminLogin.vue'),
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const isAdminRoute = to.path.startsWith('/admin') && to.path !== '/admin/login'
  const token = localStorage.getItem('admin_token')
  if (isAdminRoute && !token) return next('/admin/login')
  next()
})

export default router
