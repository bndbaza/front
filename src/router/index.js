import Vue from 'vue'
import VueRouter from 'vue-router'
import Output from '../components/Output.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Исходящие',
    component: Output,
  },
  {
    path: '/entry',
    name: 'Входящие',
    component: () => import('../components/Entry.vue'),
  },
  {
    path: '/contract',
    name: 'Договора',
    component: () => import('../components/Contract.vue'),
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
