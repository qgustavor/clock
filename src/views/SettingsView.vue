<template>
  <div class="p-8 bg-gray-800 text-white h-full">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl flex items-center">
        <RouterLink
          to="/"
          class="text-white mr-2 inline-block"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#e8eaed"
          ><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
        </RouterLink>
        <span>{{ t('settings.title') }}</span>
      </h1>
    </div>

    <p class="helper mb-6">
      {{ t('settings.note') }}
    </p>

    <div class="mb-6">
      <label class="block mb-2">{{ t('settings.font') }}</label>
      <select
        v-model="selectedFont"
        class="p-2 bg-gray-700 text-white w-full"
      >
        <option
          v-for="font of fontNames"
          :key="font"
          :value="font"
        >
          {{ font }}
        </option>
      </select>

      <i18n-t keypath="settings.fontsProvidedBy" tag="p" class="helper">
        <a
          href="https://fonts.google.com/"
          target="_blank"
        >{{ t('settings.googleFonts') }}</a>
      </i18n-t>
    </div>

    <div class="mb-6">
      <label class="block mb-2">{{ t('settings.textColor') }}</label>
      <input
        v-model="selectedColor"
        type="color"
        class="p-2 bg-gray-700 text-white w-full h-10"
      >
    </div>

    <div class="mb-6">
      <label class="block mb-2">{{ t('settings.fontSize') }}</label>
      <input
        v-model="scaleFactor"
        type="range"
        class="p-2 bg-gray-700 text-white w-full h-10"
        max="1"
        min="0.1"
        step="0.1"
      >

      <p class="helper">
        {{ t('settings.fontSizeHelper') }}
      </p>
    </div>

    <div class="mb-6">
      <label class="flex items-center">
        <input
          v-model="avoidBurnIn"
          type="checkbox"
          class="mr-2"
        >
        {{ t('settings.avoidBurnIn') }}
      </label>

      <p class="helper">
        {{ t('settings.avoidBurnInHelper') }}
      </p>
    </div>

    <div class="mb-6">
      <label class="block mb-2">{{ t('settings.firstLine') }}</label>
      <input
        v-model="firstLineFormatting"
        class="p-2 bg-gray-700 text-white w-full"
      >

      <i18n-t keypath="settings.firstLineHelper" tag="p" class="helper">
        <a
          href="https://date-fns.org/v4.1.0/docs/format"
          target="_blank"
        >{{ t('settings.dateFnsFormat') }}</a>
      </i18n-t>
    </div>

    <div class="mb-6">
      <label class="block mb-2">{{ t('settings.secondLine') }}</label>
      <input
        v-model="secondLineFormatting"
        class="p-2 bg-gray-700 text-white w-full"
      >

      <p class="helper">
        {{ t('settings.secondLineHelper') }}
      </p>
    </div>

    <div class="mb-6">
      <label class="block mb-2">{{ t('settings.language') }}</label>
      <input
        v-model="language"
        class="p-2 bg-gray-700 text-white w-full"
      >

      <p class="helper">
        {{ t('settings.languageHelper', [
          availableLocales.join(', '),
          partialLocales
        ]) }}
      </p>
    </div>

    <div class="mb-6">
      <label class="block mb-2">{{ t('settings.recurringEvents') }}</label>
      <textarea
        v-model="recurringEvents"
        class="p-2 bg-gray-700 text-white w-full"
      />

      <i18n-t keypath="settings.recurringEventsHelper" tag="p" class="helper">
        <a
          href="https://breejs.github.io/later/parsers.html#text"
          target="_blank"
        >{{ t('settings.syntaxDoc') }}</a>
      </i18n-t>
    </div>

    <!-- Save All Button -->
    <button
      class="px-4 py-2 bg-green-600 text-white"
      @click="saveSettings"
    >
      {{ t('settings.saveAndReturn') }}
    </button>

    <p class="helper mb-10">
      {{ t('settings.tip') }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settingsStore'
import fontNames from '@virtual/google-fonts'

import { useI18n } from 'vue-i18n'
const { t, availableLocales } = useI18n()

const settingsStore = useSettingsStore()
const selectedFont = ref('')
const selectedColor = ref('')
const firstLineFormatting = ref('')
const secondLineFormatting = ref('')
const language = ref('')
const recurringEvents = ref('')
const avoidBurnIn = ref(false)
const scaleFactor = ref(1)
const router = useRouter()
const partialLocales = ref('')

// Load settings on component mount
onMounted(async () => {
  selectedFont.value = settingsStore.font
  selectedColor.value = settingsStore.color
  avoidBurnIn.value = settingsStore.avoidBurnIn
  firstLineFormatting.value = settingsStore.firstLineFormatting
  secondLineFormatting.value = settingsStore.secondLineFormatting
  language.value = settingsStore.language
  recurringEvents.value = settingsStore.recurringEvents
  scaleFactor.value = settingsStore.scaleFactor
  
  const localesObj = await import('@/util/date-fns-locales.js')
  const dateFnsLocales = Object.keys(localesObj.default)
  for (const el of availableLocales) {
    const index = dateFnsLocales.indexOf(el)
    if (index !== -1) dateFnsLocales.splice(index, 1)
  }
  partialLocales.value = dateFnsLocales.join(', ')
})

// Save settings
const saveSettings = () => {
  settingsStore.setSettings({
    font: selectedFont.value,
    color: selectedColor.value,
    avoidBurnIn: avoidBurnIn.value,
    firstLineFormatting: firstLineFormatting.value,
    secondLineFormatting: secondLineFormatting.value,
    language: language.value,
    recurringEvents: recurringEvents.value,
    scaleFactor: scaleFactor.value
  })
  router.replace('/')
}
</script>

<style>
.helper {
  @apply text-gray-300 text-sm mt-2 text-balance;
}
</style>
