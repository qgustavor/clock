import { createRouter, createWebHashHistory } from 'vue-router'
import ClockView from '../views/ClockView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ClockView
    },
    {
      path: '/settings/',
      name: 'settings',
      component: SettingsView
    }
  ]
})

export default router
