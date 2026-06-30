<script setup lang="ts">
// November 2026: starts on Sunday
const DAYS_HEADER = ["日", "一", "二", "三", "四", "五", "六"];
const WEDDING_DAY = 14;

// Generate calendar rows for November 2026
const rows: (number | null)[][] = [];
let day = 1;

while (day <= 30) {
  const currentRow: (number | null)[] = [];

  for (let col = 0; col < 7; col++) {
    if (day <= 30) {
      currentRow.push(day++);
    } else {
      currentRow.push(null);
    }
  }

  rows.push(currentRow);
}
</script>

<template>
  <section class="py-24 md:py-32 bg-wedding-cream text-center px-6">
    <p class="font-script text-3xl md:text-4xl text-wedding-gold mb-2">
      Save The Date
    </p>


    <div class="gold-divider" />

    <!-- Polaroid / Magazine calendar card -->
    <div
      class="relative mt-12 mx-auto max-w-[600px] bg-[#1f1f1f] p-4 pb-8 shadow-2xl"
    >


      <!-- photo area -->
      <div class="relative aspect-[3/4] overflow-hidden bg-black">
        <img
          src="/assets/gallery/photo-8.jpg"
          alt="新人婚紗照"
          class="h-full w-full object-cover object-center opacity-85"
        />

        <!-- 暗色遮罩，讓日曆更清楚 -->
        <div class="absolute inset-0 bg-black/15"></div>

        <!-- 大年份背景 -->
        <div
          class="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span
            class="font-display text-[96px] font-light text-white/10 tracking-widest"
          >
            2026
          </span>
        </div>

        <!-- calendar content -->
        <div class="absolute inset-x-6 top-[28%] z-10 text-white">
          <div class="mb-8 text-left">
            <p class="font-display text-5xl font-light tracking-[0.12em]">
              11 / 14
            </p>
          </div>

          <!-- Header row -->
          <div class="grid grid-cols-7 mb-4">
            <div
              v-for="d in DAYS_HEADER"
              :key="d"
              class="text-center text-sm font-medium tracking-widest text-white/90"
            >
              {{ d }}
            </div>
          </div>

          <!-- Calendar days -->
          <div v-for="(row, ri) in rows" :key="ri" class="grid grid-cols-7">
            <div
              v-for="(d, ci) in row"
              :key="`${ri}-${ci}`"
              class="flex h-9 items-center justify-center text-sm md:text-base text-white/90"
              :class="{
                'text-transparent select-none': d === null,
              }"
            >
              <template v-if="d === WEDDING_DAY">
                <span
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-sm"
                >
                  14
                </span>
              </template>

              <template v-else>
                {{ d ?? "" }}
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- bottom info -->
      <div class="pt-8 text-center text-white">
        <p class="font-display text-lg tracking-[0.2em]">
          2026年11月14日 星期六
        </p>
        <p class="mt-3 font-display text-base tracking-[0.2em] text-white/90">
          12:30 PM
        </p>
      </div>
    </div>
  </section>
</template>