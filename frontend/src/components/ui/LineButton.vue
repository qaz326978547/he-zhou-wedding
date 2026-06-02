<script setup lang="ts">
defineProps<{
  href: string;
  label?: string;
  size?: "sm" | "md";
}>();
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex items-center gap-2 px-6 py-3 border border-wedding-gold text-wedding-gold font-display tracking-widest text-sm uppercase transition-all duration-300 hover:bg-wedding-gold hover:text-white rounded-sm"
    :aria-label="label ?? 'LINE 官方帳號'"
  >
    <img
      src="/assets/line/line-logo.png"
      alt="LINE Logo"
      class="w-[60px] object-contain flex-shrink-0 text-wedding-gold bg-inherit"
    />
    {{ label ?? "加入 LINE 官方帳號" }}
  </a>
</template>
