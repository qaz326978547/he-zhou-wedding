<script setup lang="ts">
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import { WEDDING } from '@/constants/wedding'

const items = WEDDING.story.map(() => {
  const { target, isVisible } = useIntersectionObserver({ threshold: 0.15 })
  return { target, isVisible }
})

const SPROCKET_COUNT = 9
</script>

<template>
  <section class="relative py-24 md:py-32 bg-[#0D0D0D] overflow-hidden">

    <!-- Film grain overlay (SVG feTurbulence — static noise, no JS) -->
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none select-none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <filter id="grain-tl" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-tl)" opacity="0.065" />
    </svg>

    <!-- Section heading -->
    <div class="relative z-10 text-center mb-20 px-6">
      <p class="font-script text-4xl text-wedding-gold mb-1 leading-tight">Our Story</p>
      <h2 class="font-display text-3xl md:text-4xl text-white font-light">愛情故事</h2>
      <div class="w-16 h-px bg-wedding-gold/50 mx-auto mt-6" />
    </div>

    <!-- Timeline milestones -->
    <div class="relative z-10 max-w-4xl mx-auto px-6 space-y-24">
      <div
        v-for="(story, index) in WEDDING.story"
        :key="story.year"
        :ref="(el) => { if (el) items[index].target.value = el as Element }"
        class="transition-all ease-out"
        :style="{ transitionDuration: `${700 + index * 80}ms` }"
        :class="items[index].isVisible.value
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-12'"
      >
        <div
          class="flex flex-col md:flex-row items-center gap-10 md:gap-14"
          :class="{ 'md:flex-row-reverse': index % 2 !== 0 }"
        >
          <!-- Kodak film strip frame -->
          <div class="w-full md:w-1/2 flex-shrink-0">
            <div class="bg-[#1C1C1C] shadow-[0_0_0_1px_rgba(201,169,110,0.15)] transition-shadow duration-500 hover:shadow-[0_0_0_1px_rgba(201,169,110,0.4)]">
              <!-- Top sprocket strip -->
              <div class="flex justify-evenly items-center h-[18px] bg-[#1C1C1C] px-1">
                <div
                  v-for="i in SPROCKET_COUNT"
                  :key="`t-${i}`"
                  class="w-[10px] h-[10px] bg-[#0D0D0D] rounded-[2px]"
                />
              </div>
              <!-- Image -->
              <div class="mx-2 overflow-hidden aspect-[4/3] bg-[#111]">
                <img
                  :src="story.image"
                  :alt="`${story.year} — ${story.title}`"
                  loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>
              <!-- Bottom sprocket strip -->
              <div class="flex justify-evenly items-center h-[18px] bg-[#1C1C1C] px-1">
                <div
                  v-for="i in SPROCKET_COUNT"
                  :key="`b-${i}`"
                  class="w-[10px] h-[10px] bg-[#0D0D0D] rounded-[2px]"
                />
              </div>
            </div>
          </div>

          <!-- Text block -->
          <div class="flex-1 text-center md:text-left">
            <p class="font-script text-6xl md:text-7xl text-wedding-gold leading-none mb-3">
              {{ story.year }}
            </p>
            <h3 class="font-display text-2xl text-white font-light mb-4 tracking-wide">
              {{ story.title }}
            </h3>
            <div
              class="w-10 h-px bg-wedding-gold/50 mb-4 mx-auto md:mx-0"
              :class="{ 'md:ml-auto md:mr-0': index % 2 !== 0 }"
            />
            <p class="text-white/65 leading-relaxed text-sm md:text-base">
              {{ story.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>
