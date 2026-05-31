<script setup lang="ts">
// Gallery images are placed in frontend/public/assets/gallery/
const GALLERY_IMAGES = [
  '/assets/gallery/photo-1.jpg',
  '/assets/gallery/photo-2.jpg',
  '/assets/gallery/photo-3.jpg',
  '/assets/gallery/photo-4.jpg',
  '/assets/gallery/photo-5.jpg',
  '/assets/gallery/photo-6.jpg',
]
</script>

<template>
  <section class="py-24 md:py-32 bg-wedding-linen px-6">
    <div class="text-center mb-12">
      <p class="font-script text-3xl text-wedding-gold mb-2">Gallery</p>
      <h2 class="font-display text-3xl md:text-4xl text-wedding-charcoal font-light">
        相片牆
      </h2>
      <div class="gold-divider" />
    </div>

    <div class="max-w-5xl mx-auto columns-2 md:columns-3 gap-3 space-y-3">
      <div
        v-for="(src, idx) in GALLERY_IMAGES"
        :key="idx"
        class="break-inside-avoid overflow-hidden rounded-lg shadow-card"
      >
        <img
          :src="src"
          :alt="`婚紗照 ${idx + 1}`"
          loading="lazy"
          class="w-full object-cover transition-all duration-500 hover:scale-105"
          style="object-position: center 70%"
        />
      </div>
    </div>
  </section>
</template>
