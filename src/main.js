import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settingsStore'

import App from './App.vue'
import router from './router'
import './main.css'

import { messages } from 'vite-i18n-resources'
const i18n = createI18n({
  locale: navigator.language.split('-')[0],
  fallbackLocale: 'en',
  legacy: false,
  messages
})

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(i18n)

const settingsStore = useSettingsStore()
watch(() => settingsStore.language, language => {
  i18n.global.locale.value = language
  document.querySelector('html').setAttribute('lang', language)
}, { immediate: true })

if (import.meta.hot) {
  import.meta.hot.on('locales-update', data => {
    Object.keys(data).forEach(lang => {
      i18n.global.setLocaleMessage(lang, data[lang])
    })
  })
}

app.mount('#app')
