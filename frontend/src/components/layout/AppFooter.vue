<script setup lang="ts">
import LineButton from "@/components/ui/LineButton.vue";
import { WEDDING } from "@/constants/wedding";
</script>

<template>
  <footer
    class="bg-wedding-linen border-t border-wedding-stone py-16 px-6 text-center"
  >
    <p class="font-script text-3xl text-wedding-gold mb-2">Stay Connected</p>
    <p
      class="font-display text-wedding-mist text-xs tracking-[0.3em] uppercase mb-6"
    >
      保持聯繫
    </p>
    <p class="text-wedding-charcoal/60 text-sm mb-8 max-w-md mx-auto">
      婚禮流程、座位資訊、當日通知將透過 LINE 官方帳號發布
    </p>
    <LineButton :href="WEDDING.line.url" label="加入 LINE 官方帳號" />

    <div class="gold-divider mt-12" />

  </footer>
</template>
