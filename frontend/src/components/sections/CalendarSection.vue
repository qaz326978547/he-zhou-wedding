<script setup lang="ts">
// November 2026: starts on Sunday (Nov 1 = Sunday)
const DAYS_HEADER = ['日', '一', '二', '三', '四', '五', '六']
const WEDDING_DAY = 14

// Generate calendar rows for November 2026 (starts Sunday)
const rows: (number | null)[][] = []
let day = 1
let currentRow: (number | null)[] = []

for (let col = 0; col < 7 && day <= 30; col++) {
  currentRow.push(day++)
}
rows.push(currentRow)

while (day <= 30) {
  currentRow = []
  for (let col = 0; col < 7 && day <= 30; col++) {
    currentRow.push(day++)
  }
  while (currentRow.length < 7) currentRow.push(null)
  rows.push(currentRow)
}
</script>

<template>
  <section class="py-24 md:py-32 bg-wedding-cream text-center px-6">
    <p class="font-script text-3xl text-wedding-gold mb-2">Save The Date</p>
    <h2 class="font-display text-3xl md:text-4xl text-wedding-charcoal font-light mb-2">
      2026 年 11 月
    </h2>
    <div class="gold-divider" />

    <!-- Glass morphism calendar card -->
    <div class="mt-10 max-w-sm mx-auto bg-white/70 backdrop-blur-md rounded-2xl shadow-soft border border-wedding-stone/50 p-8">
      <!-- Header row -->
      <div class="grid grid-cols-7 mb-2">
        <div
          v-for="d in DAYS_HEADER"
          :key="d"
          class="text-center text-wedding-gold/80 text-xs tracking-widest py-2"
        >
          {{ d }}
        </div>
      </div>

      <!-- Calendar days -->
      <div v-for="(row, ri) in rows" :key="ri" class="grid grid-cols-7">
        <div
          v-for="(d, ci) in row"
          :key="`${ri}-${ci}`"
          class="flex items-center justify-center h-10 text-sm"
          :class="{
            'text-wedding-charcoal/70': d !== null && d !== WEDDING_DAY,
            'text-transparent select-none': d === null,
          }"
        >
          <!-- Wedding day: SVG heart outline frames the number -->
          <template v-if="d === WEDDING_DAY">
            <span class="relative inline-flex items-center justify-center w-10 h-10">
              <svg
                class="absolute inset-0 w-full h-full text-wedding-gold"
                viewBox="0 0 40 40"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
              >
                <path d="M20,34 C20,34 5,24 5,14 C5,9 8.5,6 12.5,6 C15.5,6 17.5,7.5 20,11 C22.5,7.5 24.5,6 27.5,6 C31.5,6 35,9 35,14 C35,24 20,34 20,34Z" />
              </svg>
              <span class="relative z-10 font-display font-semibold text-wedding-gold text-xs leading-none mt-[-2px]">
                14
              </span>
            </span>
          </template>
          <template v-else>{{ d ?? '' }}</template>
        </div>
      </div>
    </div>

    <div class="mt-12 space-y-2 text-center">
      <p class="text-wedding-charcoal/70 font-display tracking-[0.15em] text-sm">
        Nov 14, 2026｜Saturday
      </p>
      <p class="text-wedding-gold font-display tracking-[0.2em] text-xs">
        12:30 PM
      </p>
    </div>
  </section>
</template>
