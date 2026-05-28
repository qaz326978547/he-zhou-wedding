<script setup lang="ts">
defineProps<{
  href: string
  label?: string
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex items-center gap-2 px-6 py-3 border border-wedding-gold text-wedding-gold font-display tracking-widest text-sm uppercase transition-all duration-300 hover:bg-wedding-gold hover:text-white rounded-sm"
    :aria-label="label ?? 'LINE 官方帳號'"
  >
    <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.065 2 11.13c0 4.532 3.616 8.335 8.5 9.002.33.07.78.22.895.5.102.255.066.654.032.912l-.144.864c-.044.255-.2 1 .874.545C13.6 22.4 20 17.8 20 11.13 20 6.065 17.523 2 12 2zm-2.5 12.5h-.5c-.275 0-.5-.225-.5-.5v-4c0-.275.225-.5.5-.5s.5.225.5.5v3.5h.5c.275 0 .5.225.5.5s-.225.5-.5.5zm1.5 0c-.275 0-.5-.225-.5-.5v-4c0-.275.225-.5.5-.5s.5.225.5.5v4c0 .275-.225.5-.5.5zm3.5 0h-1.5c-.275 0-.5-.225-.5-.5v-4c0-.275.225-.5.5-.5s.5.225.5.5v3.5h1c.275 0 .5.225.5.5s-.225.5-.5.5zm2.5 0c-.275 0-.5-.225-.5-.5v-4c0-.275.225-.5.5-.5s.5.225.5.5v4c0 .275-.225.5-.5.5z"/>
    </svg>
    {{ label ?? '加入 LINE 官方帳號' }}
  </a>
</template>
