import { ref, computed, onMounted, onUnmounted } from 'vue'
import { WEDDING } from '@/constants/wedding'

export function useCountdown() {
  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | null = null

  const target = WEDDING.countdownTarget.getTime()

  const remaining = computed(() => Math.max(0, target - now.value))
  const isReached = computed(() => remaining.value === 0)

  const days = computed(() => Math.floor(remaining.value / 86_400_000))
  const hours = computed(() => Math.floor((remaining.value % 86_400_000) / 3_600_000))
  const minutes = computed(() => Math.floor((remaining.value % 3_600_000) / 60_000))
  const seconds = computed(() => Math.floor((remaining.value % 60_000) / 1000))

  onMounted(() => {
    timer = setInterval(() => {
      now.value = Date.now()
      if (isReached.value && timer) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return { days, hours, minutes, seconds, isReached }
}
