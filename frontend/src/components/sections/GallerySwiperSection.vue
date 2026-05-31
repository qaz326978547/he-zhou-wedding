<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, A11y } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const GALLERY_IMAGES = [
  '/assets/gallery/photo-1.jpg',
  '/assets/gallery/photo-2.jpg',
  '/assets/gallery/photo-3.jpg',
  '/assets/gallery/photo-4.jpg',
  '/assets/gallery/photo-5.jpg',
  '/assets/gallery/photo-6.jpg',
]

const SPROCKET_COUNT = 10

const modules = [Navigation, Pagination, A11y]

const breakpoints = {
  1024: { slidesPerView: 1.2, centeredSlides: true },
}

const pagination = { clickable: true }
const navigation = true
</script>

<template>
  <section class="relative py-24 md:py-32 bg-[#0D0D0D] overflow-hidden">

    <!-- Film grain overlay -->
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none select-none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <filter id="grain-gl" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-gl)" opacity="0.065" />
    </svg>

    <!-- Section heading -->
    <div class="relative z-10 text-center mb-12 px-6">
      <p class="font-script text-3xl text-wedding-gold mb-1 leading-tight">Gallery</p>
      <h2 class="font-display text-3xl md:text-4xl text-white font-light">相片牆</h2>
      <div class="w-16 h-px bg-wedding-gold/50 mx-auto mt-6" />
    </div>

    <!-- Swiper carousel -->
    <div class="relative z-10">
      <Swiper
        :modules="modules"
        :slides-per-view="1"
        :loop="true"
        :grab-cursor="true"
        :centered-slides="false"
        :pagination="pagination"
        :navigation="navigation"
        :breakpoints="breakpoints"
        :space-between="16"
        class="gallery-swiper !pb-14 !overflow-visible"
      >
        <SwiperSlide
          v-for="(src, idx) in GALLERY_IMAGES"
          :key="idx"
          class="!h-auto px-4"
        >
          <!-- Kodak film strip frame (matches TimelineSection style) -->
          <div class="bg-[#1C1C1C] shadow-[0_0_0_1px_rgba(201,169,110,0.15)] max-w-2xl mx-auto">
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
                :src="src"
                :alt="`婚紗照 ${idx + 1}`"
                loading="lazy"
                class="w-full h-full object-cover"
                style="object-position: center 70%"
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
        </SwiperSlide>
      </Swiper>
    </div>

  </section>
</template>

<style scoped>
/* Gold-themed navigation arrows */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #C9A96E;
  opacity: 0.85;
  transition: opacity 0.2s;
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  opacity: 1;
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 1.1rem;
  font-weight: 700;
}

/* Gold-themed pagination dots — 44×44 touch target via transparent container */
:deep(.swiper-pagination-bullet) {
  background-color: transparent !important;
  opacity: 1;
  width: 44px;
  height: 44px;
  border-radius: 0;
  transition: all 0.25s;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Visual dot rendered via ::before */
:deep(.swiper-pagination-bullet)::before {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: rgba(201, 169, 110, 0.35);
  transition: all 0.25s;
  flex-shrink: 0;
}

:deep(.swiper-pagination-bullet-active)::before {
  background-color: #C9A96E;
  width: 18px;
  border-radius: 3px;
}
</style>
