import { ref, onMounted, onUnmounted } from 'vue'
import { WEDDING } from '@/constants/wedding'

export function useBackgroundMusic() {
  const isPlaying = ref(false)
  let audio: HTMLAudioElement | null = null
  let hasInteracted = false

  const EVENTS = ['click', 'touchstart', 'keydown', 'wheel'] as const

  async function tryAutoplay() {
    if (hasInteracted || !audio) return
    hasInteracted = true
    removeListeners()
    try {
      await audio.play()
      isPlaying.value = true
    } catch {
      // Autoplay Policy blocked — silent fail, button remains visible
    }
  }

  function removeListeners() {
    EVENTS.forEach((e) => document.removeEventListener(e, tryAutoplay))
  }

  function toggle() {
    if (!audio) return
    if (isPlaying.value) {
      audio.pause()
      isPlaying.value = false
    } else {
      hasInteracted = true
      removeListeners()
      audio
        .play()
        .then(() => {
          isPlaying.value = true
        })
        .catch(() => {})
    }
  }

  onMounted(() => {
    audio = new Audio(WEDDING.music.src)
    audio.loop = true
    audio.preload = 'none'
    EVENTS.forEach((e) => document.addEventListener(e, tryAutoplay, { once: true }))
  })

  onUnmounted(() => {
    removeListeners()
    if (audio) {
      audio.pause()
      audio = null
    }
  })

  return { isPlaying, toggle }
}
