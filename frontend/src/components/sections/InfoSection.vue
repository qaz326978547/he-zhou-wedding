<script setup lang="ts">
import { WEDDING } from '@/constants/wedding'
</script>

<template>
  <section class="py-24 md:py-32 bg-wedding-cream px-6 text-center">
    <p class="font-script text-3xl text-wedding-gold mb-2">Wedding Day</p>
    <h2 class="font-display text-3xl md:text-4xl text-wedding-charcoal font-light mb-2">
      婚禮資訊
    </h2>
    <div class="gold-divider" />

    <div class="mt-12 max-w-2xl mx-auto grid md:grid-cols-2 gap-6 text-left">
      <!-- Date & Time -->
      <div class="bg-white rounded-xl shadow-card border border-wedding-stone/50 p-8">
        <p class="text-wedding-gold font-display tracking-widest text-xs uppercase mb-4">日期 &amp; 時間</p>
        <p class="text-wedding-charcoal font-display text-xl mb-2">{{ WEDDING.dateDisplay }}</p>
        <p class="text-wedding-mist text-sm">宴客開始時間 {{ WEDDING.time }}</p>
      </div>

      <!-- Venue -->
      <div class="bg-white rounded-xl shadow-card border border-wedding-stone/50 p-8">
        <p class="text-wedding-gold font-display tracking-widest text-xs uppercase mb-4">宴客地點</p>
        <p class="text-wedding-charcoal font-display text-xl mb-2">{{ WEDDING.venue.name }}</p>
        <p class="text-wedding-mist text-sm mb-4">{{ WEDDING.venue.address }}</p>
        <a
          :href="WEDDING.venue.googleMapsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center min-h-[44px] text-wedding-gold text-sm underline underline-offset-2 hover:text-wedding-gold-dark transition-colors"
        >
          Google Maps 導航
        </a>
      </div>

      <!-- Transport -->
      <div class="bg-white rounded-xl shadow-card border border-wedding-stone/50 p-8 md:col-span-2">
        <p class="text-wedding-gold font-display tracking-widest text-xs uppercase mb-4">交通資訊</p>
        <p class="text-wedding-charcoal/70 text-sm leading-relaxed whitespace-pre-line">{{ WEDDING.venue.transport }}</p>
      </div>

      <!-- Notes -->
      <div v-if="WEDDING.venue.notes" class="bg-wedding-gold/5 rounded-xl border border-wedding-gold/20 p-8 md:col-span-2">
        <p class="text-wedding-gold font-display tracking-widest text-xs uppercase mb-4">注意事項</p>
        <p class="text-wedding-charcoal/70 text-sm leading-relaxed whitespace-pre-line">{{ WEDDING.venue.notes }}</p>
      </div>
    </div>
  </section>
</template>
