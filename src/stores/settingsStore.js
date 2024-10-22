import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const font = ref('Nova Mono')
  const color = ref('#00FF00')
  const avoidBurnIn = ref(true)
  const firstLineFormatting = ref('p')
  const secondLineFormatting = ref('P')
  const language = ref(navigator.language)
  const recurringEvents = ref('')

  const setSettings = (settings) => {
    font.value = settings.font
    color.value = settings.color
    avoidBurnIn.value = settings.avoidBurnIn
    firstLineFormatting.value = settings.firstLineFormatting
    secondLineFormatting.value = settings.secondLineFormatting
    language.value = settings.language
    recurringEvents.value = settings.recurringEvents
  }

  return {
    font,
    color,
    avoidBurnIn,
    firstLineFormatting,
    secondLineFormatting,
    language,
    recurringEvents,
    setSettings
  }
}, { persist: true })
