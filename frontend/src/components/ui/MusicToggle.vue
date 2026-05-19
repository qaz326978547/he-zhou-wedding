<script setup lang="ts">
defineProps<{ isPlaying: boolean }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    class="group fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-wedding-stone shadow-soft transition-all duration-300 hover:bg-wedding-gold hover:border-wedding-gold focus:outline-none focus:ring-2 focus:ring-wedding-gold/50"
    :aria-label="isPlaying ? '關閉背景音樂' : '開啟背景音樂'"
    @click="$emit('toggle')"
  >
    <!-- Playing icon -->
    <svg
      v-if="isPlaying"
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5 text-wedding-gold group-hover:text-white transition-colors duration-300"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M9 9h2v6H9V9zm4 0h2v6h-2V9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    </svg>
    <!-- Muted icon -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5 text-wedding-gold group-hover:text-white transition-colors duration-300"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
    </svg>
  </button>
</template>
