<script setup lang="ts">
defineProps<{
  modelValue: string | number
  label: string
  type?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label class="text-xs text-wedding-gold font-display tracking-widest uppercase">
      {{ label }} <span v-if="required" class="text-red-400">*</span>
    </label>
    <input
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${label}-error` : undefined"
      class="bg-transparent border-b border-wedding-stone px-0 py-3 text-wedding-charcoal placeholder-wedding-mist/60 focus:outline-none focus:border-wedding-gold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      :class="{ 'border-red-400': !!error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" :id="`${label}-error`" class="text-red-400 text-xs mt-1">{{ error }}</p>
  </div>
</template>
