<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'outline'
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 min-h-[44px] px-8 py-3 font-display tracking-widest text-sm uppercase transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-wedding-gold/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
    :class="{
      'bg-wedding-gold text-white hover:bg-wedding-gold-light': variant !== 'outline',
      'border border-wedding-gold text-wedding-gold hover:bg-wedding-gold hover:text-white': variant === 'outline',
    }"
  >
    <svg v-if="loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
    <slot />
    <span v-if="loading" class="sr-only">處理中…</span>
  </button>
</template>
