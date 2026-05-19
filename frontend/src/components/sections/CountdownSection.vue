<script setup lang="ts">
import { useCountdown } from '@/composables/useCountdown'

const { days, hours, minutes, seconds, isReached } = useCountdown()

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
</script>

<template>
  <section class="py-24 md:py-32 bg-wedding-linen text-center px-6">
    <p class="font-script text-3xl text-wedding-gold mb-2">Count Down</p>
    <h2 class="font-display text-3xl md:text-4xl text-wedding-charcoal font-light mb-2">
      婚禮倒數
    </h2>
    <div class="gold-divider" />

    <div v-if="isReached" class="mt-12">
      <p class="font-script text-4xl md:text-5xl text-wedding-gold">
        今日大喜，恭賀新禧！
      </p>
    </div>

    <div v-else class="mt-12 flex items-start justify-center gap-4 md:gap-10">
      <div
        v-for="(unit, idx) in [
          { value: days, label: '天' },
          { value: hours, label: '時' },
          { value: minutes, label: '分' },
          { value: seconds, label: '秒' },
        ]"
        :key="idx"
        class="flex flex-col items-center"
      >
        <span class="font-display text-4xl md:text-6xl lg:text-7xl text-wedding-charcoal font-light tabular-nums">
          {{ pad(unit.value) }}
        </span>
        <span class="text-wedding-gold text-xs tracking-widest uppercase mt-2">{{ unit.label }}</span>
      </div>
    </div>

    <p class="mt-10 text-wedding-mist text-sm font-display tracking-widest">
      2026 年 11 月 14 日 · 12:00（台灣時間）
    </p>
  </section>
</template>
