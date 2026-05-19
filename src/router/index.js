import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/practice/:unitId/:paperId',
    name: 'Practice',
    component: () => import('../views/PracticePage.vue')
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('../views/ResultPage.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/HistoryPage.vue')
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/StatsPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
