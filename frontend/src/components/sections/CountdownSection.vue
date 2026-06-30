<script setup lang="ts">
import { useCountdown } from "@/composables/useCountdown";

const { days, hours, minutes, seconds, isReached } = useCountdown();

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
</script>

<template>
  <section
    class="relative text-center px-6 bg-[url('/assets/gallery/photo-12.jpg')] bg-contain bg-center bg-no-repeat aspect-[1365/2048] md:max-w-[800px] md:mx-auto overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/25"
    ></div>
    <div class="absolute top-[10%] left-0 right-0 mx-auto max-w-4xl">
      <p class="font-script text-3xl text-wedding-gold mb-2">Count Down</p>
      <h2
        class="font-display text-3xl md:text-4xl text-wedding-gold-light font-light mb-2"
      >
        婚禮倒數
      </h2>
      <div class="gold-divider" />

      <div v-if="isReached" class="mt-16">
        <p class="font-script text-4xl md:text-5xl text-wedding-gold">
          今日大喜，恭賀新禧！
        </p>
      </div>

      <div v-else class="mt-16 flex items-start justify-center gap-8 md:gap-16">
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
          <span
            class="font-display text-5xl md:text-6xl lg:text-6xl text-white font-light tabular-nums"
          >
            {{ pad(unit.value) }}
          </span>
          <span
            class="text-white text-lg tracking-widest uppercase mt-3"
            >{{ unit.label }}</span
          >
        </div>
      </div>
    </div>
  </section>
</template>
