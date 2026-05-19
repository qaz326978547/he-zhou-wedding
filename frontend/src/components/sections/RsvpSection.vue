<script setup lang="ts">
import { onMounted } from 'vue'
import { useRsvp } from '@/composables/useRsvp'
import { WEDDING } from '@/constants/wedding'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import LineButton from '@/components/ui/LineButton.vue'

const {
  form, errors, isLoading, isSubmitted, submitError, isRsvpEnabled,
  showGuestCount, showRelationshipType, notesLength,
  submit, checkRsvpStatus,
} = useRsvp()

onMounted(checkRsvpStatus)

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const DIETARY_OPTIONS = [
  { value: 'regular',    label: '一般' },
  { value: 'vegetarian', label: '素食' },
  { value: 'no_beef',    label: '不吃牛肉' },
  { value: 'no_pork',    label: '不吃豬肉' },
  { value: 'other',      label: '其他' },
]
</script>

<template>
  <section id="rsvp" class="py-24 md:py-32 bg-wedding-cream px-6">
    <div class="text-center mb-12">
      <p class="font-script text-3xl text-wedding-gold mb-2">RSVP</p>
      <h2 class="font-display text-3xl md:text-4xl text-wedding-charcoal font-light">出席回覆</h2>
      <div class="gold-divider" />
    </div>

    <!-- RSVP Disabled -->
    <div v-if="!isRsvpEnabled" class="max-w-lg mx-auto text-center py-16">
      <p class="font-display text-2xl text-wedding-mist tracking-widest">報名已截止</p>
    </div>

    <!-- Success Screen (FR-012) -->
    <div v-else-if="isSubmitted" class="max-w-2xl mx-auto text-center space-y-10">
      <div>
        <svg class="w-14 h-14 text-wedding-gold mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="font-display text-xl md:text-2xl text-wedding-charcoal font-light leading-relaxed mb-6">
          {{ WEDDING.rsvpSuccess.message }}
        </p>
        <p class="font-script text-2xl text-wedding-gold">
          {{ WEDDING.dateDisplay }}
        </p>
        <p class="text-wedding-charcoal/60 text-sm mt-2">{{ WEDDING.venue.name }}</p>
        <p class="text-wedding-mist text-xs mt-1">{{ WEDDING.venue.address }}</p>
      </div>

      <!-- LINE Invite Block (FR-021) -->
      <div class="bg-white rounded-xl shadow-card border border-wedding-stone p-8 space-y-6">
        <p class="text-wedding-gold font-display tracking-widest text-xs uppercase">加入 LINE 官方帳號</p>
        <p class="text-wedding-charcoal/70 text-sm">{{ WEDDING.line.description }}</p>
        <div class="flex flex-col items-center gap-4">
          <img
            :src="WEDDING.line.qrCodePath"
            alt="LINE QR Code"
            class="w-32 h-32 object-contain rounded-lg"
            loading="lazy"
          />
          <LineButton :href="WEDDING.line.url" label="加入 LINE 官方帳號" />
        </div>
      </div>

      <Button variant="outline" @click="scrollToTop">
        回到頁面頂端
      </Button>
    </div>

    <!-- RSVP Form -->
    <form v-else class="max-w-lg mx-auto space-y-8" @submit.prevent="submit">
      <!-- Submit error -->
      <div v-if="submitError" class="border border-red-300 bg-red-50 px-4 py-3 text-red-500 text-sm rounded-lg">
        {{ submitError }}
      </div>

      <!-- Name -->
      <Input
        v-model="form.name"
        label="姓名"
        placeholder="請填寫您的姓名"
        :error="errors.name"
        :disabled="isLoading"
        required
      />

      <!-- Phone -->
      <Input
        v-model="form.phone"
        label="電話"
        type="tel"
        placeholder="09xxxxxxxx 或 0xxxxxxxxx"
        :error="errors.phone"
        :disabled="isLoading"
        required
      />

      <!-- Attending -->
      <div>
        <p class="text-xs text-wedding-gold font-display tracking-widest uppercase mb-3">
          出席狀態 <span class="text-red-400">*</span>
        </p>
        <div class="flex gap-6">
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              :value="true"
              v-model="form.attending"
              class="accent-wedding-gold w-4 h-4"
              :disabled="isLoading"
            />
            <span class="text-wedding-charcoal">出席</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              :value="false"
              v-model="form.attending"
              class="accent-wedding-gold w-4 h-4"
              :disabled="isLoading"
            />
            <span class="text-wedding-charcoal">不克出席</span>
          </label>
        </div>
      </div>

      <!-- Guest Count (only when attending) -->
      <div v-if="showGuestCount">
        <label class="text-xs text-wedding-gold font-display tracking-widest uppercase block mb-2">
          出席人數 <span class="text-red-400">*</span>
        </label>
        <input
          v-model.number="form.guestCount"
          type="number"
          min="1"
          max="10"
          :disabled="isLoading"
          class="bg-transparent border-b border-wedding-stone px-0 py-3 text-wedding-charcoal w-24 focus:outline-none focus:border-wedding-gold transition-colors"
          :class="{ 'border-red-400': errors.guestCount }"
        />
        <p v-if="errors.guestCount" class="text-red-400 text-xs mt-1">{{ errors.guestCount }}</p>
      </div>

      <!-- Relationship Side (optional) -->
      <div>
        <p class="text-xs text-wedding-gold font-display tracking-widest uppercase mb-3">
          賓桌歸屬 <span class="text-wedding-mist/70 text-xs normal-case tracking-normal">（選填）</span>
        </p>
        <div class="flex gap-6">
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              value="groom"
              v-model="form.relationshipSide"
              class="accent-wedding-gold w-4 h-4"
              :disabled="isLoading"
            />
            <span class="text-wedding-charcoal">新郎方</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              value="bride"
              v-model="form.relationshipSide"
              class="accent-wedding-gold w-4 h-4"
              :disabled="isLoading"
            />
            <span class="text-wedding-charcoal">新娘方</span>
          </label>
        </div>
      </div>

      <!-- Relationship Type (only when side selected) -->
      <div v-if="showRelationshipType">
        <p class="text-xs text-wedding-gold font-display tracking-widest uppercase mb-3">
          關係類型 <span class="text-wedding-mist/70 text-xs normal-case tracking-normal">（選填）</span>
        </p>
        <div class="flex gap-6">
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              value="relative"
              v-model="form.relationshipType"
              class="accent-wedding-gold w-4 h-4"
              :disabled="isLoading"
            />
            <span class="text-wedding-charcoal">親屬</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              value="friend"
              v-model="form.relationshipType"
              class="accent-wedding-gold w-4 h-4"
              :disabled="isLoading"
            />
            <span class="text-wedding-charcoal">朋友</span>
          </label>
        </div>
      </div>

      <!-- Dietary Preference -->
      <div>
        <label class="text-xs text-wedding-gold font-display tracking-widest uppercase block mb-3">
          飲食偏好 <span class="text-wedding-mist/70 text-xs normal-case tracking-normal">（選填）</span>
        </label>
        <select
          v-model="form.dietaryPreference"
          :disabled="isLoading"
          class="w-full bg-transparent border-b border-wedding-stone py-3 text-wedding-charcoal focus:outline-none focus:border-wedding-gold transition-colors"
        >
          <option
            v-for="opt in DIETARY_OPTIONS"
            :key="opt.value"
            :value="opt.value"
            class="bg-wedding-cream"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Notes -->
      <div>
        <label class="text-xs text-wedding-gold font-display tracking-widest uppercase block mb-2">
          備註 <span class="text-wedding-mist/70 text-xs normal-case tracking-normal">（選填，最多 300 字元）</span>
        </label>
        <textarea
          v-model="form.notes"
          rows="3"
          maxlength="300"
          placeholder="嬰兒椅需求、素食細節、輪椅空間、提前離席、停車需求…"
          :disabled="isLoading"
          class="w-full bg-white/60 border border-wedding-stone rounded-lg p-3 text-wedding-charcoal placeholder-wedding-mist/50 focus:outline-none focus:border-wedding-gold transition-colors resize-none"
          :class="{ 'border-red-400': errors.notes }"
        />
        <div class="flex justify-between mt-1">
          <p v-if="errors.notes" class="text-red-400 text-xs">{{ errors.notes }}</p>
          <p class="text-wedding-mist/70 text-xs ml-auto" :class="{ 'text-red-400': notesLength > 300 }">
            {{ notesLength }} / 300
          </p>
        </div>
      </div>

      <!-- Submit Button (FR-019) -->
      <Button
        type="submit"
        :loading="isLoading"
        :disabled="isLoading"
        class="w-full"
      >
        {{ isLoading ? '提交中…' : '確認提交' }}
      </Button>
    </form>
  </section>
</template>
