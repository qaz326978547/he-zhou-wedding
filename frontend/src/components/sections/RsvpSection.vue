<script setup lang="ts">
import { onMounted } from "vue";
import { useRsvp } from "@/composables/useRsvp";
import { WEDDING } from "@/constants/wedding";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";
import LineButton from "@/components/ui/LineButton.vue";

const {
  form,
  errors,
  isLoading,
  isSubmitted,
  submitError,
  isRsvpEnabled,
  showGuestFields,
  showHighchair,
  showRelationshipType,
  showInvitationFields,
  submit,
  checkRsvpStatus,
} = useRsvp();

onMounted(checkRsvpStatus);

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const ADULT_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);
const CHILD_OPTIONS = Array.from({ length: 11 }, (_, i) => i);
</script>

<template>
  <section id="rsvp" class="py-24 md:py-32 bg-wedding-cream px-6">
    <div class="text-center mb-12">
      <p class="font-script text-3xl text-wedding-gold mb-2">RSVP</p>
      <h2
        class="font-display text-3xl md:text-4xl text-wedding-charcoal font-light"
      >
        出席回覆
      </h2>
      <div class="gold-divider" />
    </div>

    <!-- RSVP Disabled -->
    <div v-if="!isRsvpEnabled" class="max-w-lg mx-auto text-center py-16">
      <p class="font-display text-2xl text-wedding-mist tracking-widest">
        報名已截止
      </p>
    </div>

    <!-- Success Screen -->
    <div
      v-else-if="isSubmitted"
      class="max-w-2xl mx-auto text-center space-y-10"
    >
      <div>
        <svg
          class="w-14 h-14 text-wedding-gold mx-auto mb-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p
          class="font-display text-xl md:text-2xl text-wedding-charcoal font-light leading-relaxed mb-6"
        >
          {{ WEDDING.rsvpSuccess.message }}
        </p>
        <p class="font-script text-2xl text-wedding-gold">
          {{ WEDDING.dateDisplay }}
        </p>
        <p class="text-wedding-charcoal/60 text-sm mt-2">
          {{ WEDDING.venue.name }}
        </p>
        <p class="text-wedding-mist text-xs mt-1">
          {{ WEDDING.venue.address }}
        </p>
      </div>

      <div
        class="bg-white rounded-xl shadow-card border border-wedding-stone p-8 space-y-6"
      >
        <p
          class="text-wedding-gold font-display tracking-widest text-xs uppercase"
        >
          加入 LINE 官方帳號
        </p>
        <p class="text-wedding-charcoal/70 text-sm">
          {{ WEDDING.line.description }}
        </p>
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

      <Button variant="outline" @click="scrollToTop">回到頁面頂端</Button>
    </div>

    <!-- RSVP Form -->
    <form v-else class="max-w-lg mx-auto space-y-8" @submit.prevent="submit">
      <!-- Submit error -->
      <div
        v-if="submitError"
        class="border border-red-300 bg-red-50 px-4 py-3 text-red-500 text-sm rounded-lg"
      >
        {{ submitError }}
      </div>

      <!-- Name -->
      <Input
        v-model="form.name"
        label="姓名"
        placeholder="請填寫您的真實姓名"
        :error="errors.name"
        :disabled="isLoading"
        required
      />

      <!-- Phone -->
      <Input
        v-model="form.phone"
        label="電話"
        type="tel"
        placeholder="聯絡電話"
        :error="errors.phone"
        :disabled="isLoading"
        required
      />

      <!-- Attending — card-style radio, above guest count -->
      <div>
        <div class="grid grid-cols-1 gap-3">
          <label
            class="relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 min-h-[44px]"
            :class="
              form.attending === true
                ? 'border-wedding-gold bg-wedding-gold/5 shadow-sm'
                : 'border-wedding-stone bg-white/60 hover:border-wedding-gold/40'
            "
          >
            <input
              type="radio"
              :value="true"
              v-model="form.attending"
              class="sr-only"
              :disabled="isLoading"
            />
            <span
              class="mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
              :class="
                form.attending === true
                  ? 'border-wedding-gold'
                  : 'border-wedding-stone'
              "
            >
              <span
                v-if="form.attending === true"
                class="w-2 h-2 rounded-full bg-wedding-gold"
              />
            </span>
            <div>
              <p
                class="font-display text-wedding-charcoal text-sm tracking-wide"
              >
                開心出席
              </p>
              <p class="text-wedding-charcoal/55 text-xs mt-1 leading-relaxed">
                開心出席～婚禮當天見啦～～♡⸜(｡˃ ᵕ ˂ )⸝
              </p>
            </div>
          </label>

          <label
            class="relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 min-h-[44px]"
            :class="
              form.attending === false
                ? 'border-wedding-gold bg-wedding-gold/5 shadow-sm'
                : 'border-wedding-stone bg-white/60 hover:border-wedding-gold/40'
            "
          >
            <input
              type="radio"
              :value="false"
              v-model="form.attending"
              class="sr-only"
              :disabled="isLoading"
            />
            <span
              class="mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
              :class="
                form.attending === false
                  ? 'border-wedding-gold'
                  : 'border-wedding-stone'
              "
            >
              <span
                v-if="form.attending === false"
                class="w-2 h-2 rounded-full bg-wedding-gold"
              />
            </span>
            <div>
              <p
                class="font-display text-wedding-charcoal text-sm tracking-wide"
              >
                不克出席
              </p>
              <p class="text-wedding-charcoal/55 text-xs mt-1 leading-relaxed">
                不克出席，但會在遠方為你們感到開心˚ʚ♡ɞ˚
              </p>
            </div>
          </label>
        </div>
      </div>

      <!-- Guest counts (only when attending) -->
      <template v-if="showGuestFields">
        <!-- Adult count -->
        <div>
          <label
            class="text-xs text-wedding-gold font-display tracking-widest uppercase block mb-2"
          >
            大人幾位 <span class="text-red-400">*</span>
          </label>
          <select
            v-model.number="form.adultCount"
            :disabled="isLoading"
            class="w-full bg-transparent border-b border-wedding-stone py-3 text-wedding-charcoal focus:outline-none focus:border-wedding-gold transition-colors"
            :class="{ 'border-red-400': errors.adultCount }"
          >
            <option
              v-for="n in ADULT_OPTIONS"
              :key="n"
              :value="n"
              class="bg-wedding-cream"
            >
              {{ n }} 位
            </option>
          </select>
          <p v-if="errors.adultCount" class="text-red-400 text-xs mt-1">
            {{ errors.adultCount }}
          </p>
        </div>

        <!-- Child count -->
        <div>
          <label
            class="text-xs text-wedding-gold font-display tracking-widest uppercase block mb-2"
          >
            小孩幾位
            <span
              class="text-wedding-mist/70 text-xs normal-case tracking-normal"
              >（12 歲以下）</span
            >
          </label>
          <select
            v-model.number="form.childCount"
            :disabled="isLoading"
            class="w-full bg-transparent border-b border-wedding-stone py-3 text-wedding-charcoal focus:outline-none focus:border-wedding-gold transition-colors"
            :class="{ 'border-red-400': errors.childCount }"
          >
            <option
              v-for="n in CHILD_OPTIONS"
              :key="n"
              :value="n"
              class="bg-wedding-cream"
            >
              {{ n }} 位
            </option>
          </select>
          <p v-if="errors.childCount" class="text-red-400 text-xs mt-1">
            {{ errors.childCount }}
          </p>
        </div>

        <!-- Highchair (conditional: childCount > 0) -->
        <div v-if="showHighchair">
          <p
            class="text-xs text-wedding-gold font-display tracking-widest uppercase mb-3"
          >
            是否需要兒童椅 <span class="text-red-400">*</span>
          </p>
          <div class="flex flex-col gap-3">
            <label class="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input
                type="radio"
                :value="true"
                v-model="form.needsHighchair"
                class="accent-wedding-gold w-4 h-4"
                :disabled="isLoading"
              />
              <span class="text-wedding-charcoal text-sm">需要</span>
              <template v-if="form.needsHighchair === true">
                <select
                  v-model.number="form.highchairCount"
                  :disabled="isLoading"
                  class="bg-transparent border-b border-wedding-gold py-1 text-wedding-charcoal text-sm focus:outline-none w-20"
                >
                  <option
                    v-for="n in form.childCount"
                    :key="n"
                    :value="n"
                    class="bg-wedding-cream"
                  >
                    {{ n }} 張
                  </option>
                </select>
              </template>
            </label>
            <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
              <input
                type="radio"
                :value="false"
                v-model="form.needsHighchair"
                class="accent-wedding-gold w-4 h-4"
                :disabled="isLoading"
              />
              <span class="text-wedding-charcoal text-sm">不需要</span>
            </label>
          </div>
          <p v-if="errors.needsHighchair" class="text-red-400 text-xs mt-1">
            {{ errors.needsHighchair }}
          </p>
        </div>
      </template>

      <!-- Relationship Side -->
      <div>
        <p
          class="text-xs text-wedding-gold font-display tracking-widest uppercase mb-3"
        >
          賓桌歸屬
          <span class="text-wedding-mist/70 text-xs normal-case tracking-normal"
            >（選填）</span
          >
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
            <span class="text-wedding-charcoal text-sm">新郎方</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              value="bride"
              v-model="form.relationshipSide"
              class="accent-wedding-gold w-4 h-4"
              :disabled="isLoading"
            />
            <span class="text-wedding-charcoal text-sm">新娘方</span>
          </label>
        </div>
      </div>

      <!-- Relationship Type -->
      <div v-if="showRelationshipType">
        <p
          class="text-xs text-wedding-gold font-display tracking-widest uppercase mb-3"
        >
          關係類型
          <span class="text-wedding-mist/70 text-xs normal-case tracking-normal"
            >（選填）</span
          >
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
            <span class="text-wedding-charcoal text-sm">親屬</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              value="friend"
              v-model="form.relationshipType"
              class="accent-wedding-gold w-4 h-4"
              :disabled="isLoading"
            />
            <span class="text-wedding-charcoal text-sm">朋友</span>
          </label>
        </div>
      </div>

      <!-- Dietary Preference -->
      <div>
        <p
          class="text-xs text-wedding-gold font-display tracking-widest uppercase mb-3"
        >
          飲食偏好
          <span class="text-wedding-mist/70 text-xs normal-case tracking-normal"
            >（選填）</span
          >
        </p>
        <div class="flex gap-6">
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              value="regular"
              v-model="form.dietaryPreference"
              class="accent-wedding-gold w-4 h-4"
              :disabled="isLoading"
            />
            <span class="text-wedding-charcoal text-sm">葷食</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              value="vegetarian"
              v-model="form.dietaryPreference"
              class="accent-wedding-gold w-4 h-4"
              :disabled="isLoading"
            />
            <span class="text-wedding-charcoal text-sm">素食</span>
          </label>
        </div>
      </div>

      <!-- Paper invitation -->
      <div>
        <p
          class="text-xs text-wedding-gold font-display tracking-widest uppercase mb-3"
        >
          是否需要紙本喜帖
        </p>
        <div class="flex gap-6">
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              :value="true"
              v-model="form.needsInvitation"
              class="accent-wedding-gold w-4 h-4"
              :disabled="isLoading"
            />
            <span class="text-wedding-charcoal text-sm">需要</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              :value="false"
              v-model="form.needsInvitation"
              class="accent-wedding-gold w-4 h-4"
              :disabled="isLoading"
            />
            <span class="text-wedding-charcoal text-sm">不需要</span>
          </label>
        </div>
      </div>

      <!-- Invitation address fields (conditional) -->
      <template v-if="showInvitationFields">
        <Input
          v-model="form.invitationName"
          label="收件人姓名"
          placeholder="請填寫收件人姓名"
          :error="errors.invitationName"
          :disabled="isLoading"
          required
        />
        <Input
          v-model="form.invitationPhone"
          label="收件人電話"
          type="tel"
          placeholder="09xxxxxxxx 或 0xxxxxxxxx"
          :error="errors.invitationPhone"
          :disabled="isLoading"
          required
        />
        <Input
          v-model="form.invitationAddress"
          label="收件地址"
          placeholder="請填寫完整收件地址"
          :error="errors.invitationAddress"
          :disabled="isLoading"
          required
        />
      </template>

      <!-- Submit -->
      <Button
        type="submit"
        :loading="isLoading"
        :disabled="isLoading"
        class="w-full"
      >
        {{ isLoading ? "提交中…" : "確認提交" }}
      </Button>
    </form>
  </section>
</template>
