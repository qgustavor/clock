<template>
  <div
    class="relative h-screen h-screen flex items-center justify-center"
    @dblclick="toggleFullScreen"
    @click="handleTap"
  >
    <div
      ref="clockElement"
      :style="clockStyle"
      class="select-none leading-none w-screen h-screen flex items-center justify-center text-center"
      :class="{
        'anti-burn-in': settingsStore.avoidBurnIn,
        'invisible': !fontLoaded || !localeLoaded
      }"
    >
      <span class="textFitted inline-block">
        {{ firstLine }}<br>
        <span class="second-line">{{ secondLine }}</span>
        <span class="event-line">{{ eventLine }}</span>
      </span>
    </div>

    <Transition name="fade">
      <RouterLink
        class="absolute top-4 right-4 text-white p-2 transition-opacity"
        :class="[
          cogHidden ? 'opacity-0 duration-1000' : 'transition-opacity'
        ]"
        to="settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#e8eaed"
        ><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" /></svg>
      </RouterLink>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useSettingsStore } from '../stores/settingsStore'
import textFit from '@/util/textfit.js'
import FontFaceObserver from 'fontfaceobserver'
import { format, formatDistanceToNow } from 'date-fns'
import later from '@breejs/later'

const settingsStore = useSettingsStore()

const firstLine = ref('')
const secondLine = ref('')
const eventLine = ref('')
const clockElement = ref(null)
const wakeLock = ref(null)
const wakeLockActivated = ref(false)
const cogHidden = ref(false)
const fontLoaded = ref(false)
const localeLoaded = ref(false)

// Computed styles for the clock
const clockStyle = computed(() => ({
  color: settingsStore.color,
  fontFamily: settingsStore.font
}))

// Update time every second
let userLocale
const updateTime = () => {
  const now = new Date()
  const formatSettings = {
    locale: userLocale,
    addSuffix: true
  }
  firstLine.value = settingsStore.firstLineFormatting
    ? format(now, settingsStore.firstLineFormatting, formatSettings)
    : settingsStore.firstLineFormatting
  secondLine.value = settingsStore.secondLineFormatting
    ? format(now, settingsStore.secondLineFormatting, formatSettings)
    : ''

  const time = now.getTime()
  eventLine.value = events.filter(e => e.minTime < time && e.maxTime > time).slice(0, 1).map(e => {
    return e.name + ': ' + formatDistanceToNow(e.date, formatSettings)
  })[0]
}

// Handle tap and request wake lock
const handleTap = async () => {
  if (!wakeLockActivated.value) {
    await requestWakeLock()
  }
  handleCogTap()
}

const requestWakeLock = async () => {
  try {
    if ('wakeLock' in navigator) {
      wakeLock.value = await navigator.wakeLock.request('screen')
      wakeLockActivated.value = true
    }
  } catch (err) {
    console.error('Wake Lock error:', err)
  }
}

// Toggle full-screen on double-click
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

// Fit text to the container
const fitText = () => {
  const el = clockElement.value
  if (!el) return

  textFit(el, {
    alignVert: true,
    alignHoriz: true,
    scaleFactor: settingsStore.scaleFactor
  })
  resizeDebounced = null
}

let resizeDebounced
const handleResize = () => {
  if (resizeDebounced) clearTimeout(resizeDebounced)
  resizeDebounced = setTimeout(fitText, 250)
}

let clockInterval
onMounted(() => {
  later.date.localTime()
  updateTime()
  clockInterval = setInterval(updateTime, 1000)

  fitText()
  window.addEventListener('resize', handleResize)

  handleCogTap()
})

onUnmounted(() => {
  clearInterval(clockInterval)
  window.removeEventListener('resize', handleResize)
})

let hideCogTimeout
const handleCogTap = () => {
  if (hideCogTimeout) clearTimeout(hideCogTimeout)
  cogHidden.value = false
  hideCogTimeout = setTimeout(() => {
    cogHidden.value = true
    hideCogTimeout = null
  }, 5000)
}

watch(() => settingsStore.font, loadGoogleFont, { immediate: true })
function loadGoogleFont (fontName) {
  if (!fontName) return
  const fontLink = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}&display=block`
  const existingLink = document.querySelector(`link[href="${fontLink}"]`)

  const fontObserver = new FontFaceObserver(fontName)
  fontLoaded.value = false
  fontObserver.load().catch(() => {}).then(() => {
    fitText()
    fontLoaded.value = true
  })

  if (!existingLink) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = fontLink
    document.head.appendChild(link)
  }
}

let events = []
watch(() => settingsStore.recurringEvents, handleEvents, { immediate: true })
function handleEvents (eventsStr) {
  const newEventsArray = []
  for (const eventStr of eventsStr.split('\n')) {
    const [name, ...specParts] = eventStr.trim().split(':')
    if (!name) continue
    const spec = specParts.join(':')
    const parsed = later.parse.text(spec)
    if (parsed.error >= 0) continue

    const date = later.schedule(parsed).next()
    if (!date) continue
    const minTime = date.getTime() - 60 * 60 * 1000
    const maxTime = date.getTime() + 60 * 1000

    newEventsArray.push({
      name: name.trim(),
      date,
      minTime,
      maxTime
    })
  }
  newEventsArray.sort((a, b) => a.minTime - b.minTime)
  events = newEventsArray
}

watch(() => settingsStore.language, handleLocale, { immediate: true })
async function handleLocale (language) {
  localeLoaded.value = false
  if (language) {
    const locales = await import('@/util/date-fns-locales.js')
    const localeModule = locales[language]
    if (localeModule) {
      userLocale = await localeModule()
      updateTime()
      await nextTick()
      fitText()
    }
  }
  localeLoaded.value = true
}
</script>

<style scoped>
.anti-burn-in {
  animation: move 3600s linear infinite alternate;
}

@keyframes move {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-30px);
  }
}
.second-line {
  @apply block;
  font-size: 0.4em;
}
.event-line {
  @apply block;
  font-size: 0.2em;
}
</style>
