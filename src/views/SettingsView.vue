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
        <span>Settings</span>
      </h1>
    </div>

    <p class="helper mb-6">
      Settings are not saved automatically. Use the button on the bottom of the page to save them.
    </p>

    <div class="mb-6">
      <label class="block mb-2">Font</label>
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

      <p class="helper">
        Fonts provided by <a href="https://fonts.google.com/" target="_blank">Google Fonts</a>.
      </p>
    </div>

    <div class="mb-6">
      <label class="block mb-2">Text Color</label>
      <input
        v-model="selectedColor"
        type="color"
        class="p-2 bg-gray-700 text-white w-full h-10"
      >
    </div>

    <div class="mb-6">
      <label class="block mb-2">Text Font Size</label>
      <input
        v-model="scaleFactor"
        type="range"
        class="p-2 bg-gray-700 text-white w-full h-10"
        max="1"
        min="0.1"
        step="0.1"
      >

      <p class="helper">
        All to the right means the maximum size that can fit in the screen.
      </p>
    </div>

    <div class="mb-6">
      <label class="flex items-center">
        <input
          v-model="avoidBurnIn"
          type="checkbox"
          class="mr-2"
        >
        Avoid Screen Burn-In
      </label>

      <p class="helper">
        Slowly moves the text up and down.
      </p>
    </div>

    <div class="mb-6">
      <label class="block mb-2">First Line Formatting</label>
      <input
        v-model="firstLineFormatting"
        class="p-2 bg-gray-700 text-white w-full"
      >

      <p class="helper">
        Use <a href="https://date-fns.org/v4.1.0/docs/format" target="_blank">date-fns format</a>. Example: "p" for just showing minutes and seconds and "pp" to include seconds too.
      </p>
    </div>

    <div class="mb-6">
      <label class="block mb-2">Second Line Formatting</label>
      <input
        v-model="secondLineFormatting"
        class="p-2 bg-gray-700 text-white w-full"
      >

      <p class="helper">
        If you left it blank just the first line will be shown. Examples: "P" to show the current date.
      </p>
    </div>

    <div class="mb-6">
      <label class="block mb-2">Language</label>
      <input
        v-model="language"
        class="p-2 bg-gray-700 text-white w-full"
      >

      <p class="helper">
        Used only for date formatting at the moment. Specify just two letters.
      </p>
    </div>

    <div class="mb-6">
      <label class="block mb-2">Recurring events</label>
      <textarea
        v-model="recurringEvents"
        class="p-2 bg-gray-700 text-white w-full"
      />

      <p class="helper">
        Countdown to recurring events will be shown below the clock when they are less than one hour from happening, only the most close event showing up. You can define them by writing like this: "Lunch: at 12:00 pm" and "Soccer Training: at 17:00 pm on Weds, Thurs and Fri". Write one event per line. For more info on how to specify event dates check <a href="https://breejs.github.io/later/parsers.html#text" target="_blank">the syntax documentation</a>.
      </p>
    </div>

    <!-- Save All Button -->
    <button
      class="px-4 py-2 bg-green-600 text-white"
      @click="saveSettings"
    >
      Save settings and return
    </button>

    <p class="helper mb-10">
      Tip: Tap or click twice to switch to full screen (and hide browser interface) or install the web app.
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settingsStore'
import fontNames from '@virtual/google-fonts'

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
