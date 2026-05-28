<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div class="flex justify-between items-center mb-5">
          <h2 class="text-lg font-semibold text-gray-800">新增 RSVP</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">姓名 *</label>
              <input v-model="form.name" type="text" required class="input-field" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">電話 *</label>
              <input v-model="form.phone" type="tel" required class="input-field" />
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-500 mb-1">出席人數 <span class="text-gray-400">（可留空）</span></label>
            <input v-model="form.guestCount" type="number" min="0" max="10" placeholder="留空表示待確認" class="input-field" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">賓桌歸屬</label>
              <select v-model="form.relationshipSide" class="input-field">
                <option value="">-- 未指定 --</option>
                <option value="groom">新郎方</option>
                <option value="bride">新娘方</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">關係類型</label>
              <select v-model="form.relationshipType" class="input-field" :disabled="!form.relationshipSide">
                <option value="">-- 未指定 --</option>
                <option value="relative">親戚</option>
                <option value="friend">朋友</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-500 mb-1">飲食偏好</label>
            <select v-model="form.dietaryPreference" class="input-field">
              <option value="regular">一般</option>
              <option value="vegetarian">素食</option>
              <option value="no_beef">不吃牛</option>
              <option value="no_pork">不吃豬</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div>
            <label class="block text-xs text-gray-500 mb-1">備註</label>
            <textarea v-model="form.notes" rows="2" maxlength="300" class="input-field resize-none"></textarea>
          </div>

          <p v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</p>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-gray-800 text-white rounded-lg py-2.5 text-sm hover:bg-gray-700 disabled:opacity-50 transition"
            >
              {{ loading ? '送出中...' : '新增' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import adminApi from '../../services/adminApi'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  close: []
  saved: [record: any]
}>()

const defaultForm = () => ({
  name: '',
  phone: '',
  attending: true,
  guestCount: '' as number | '',
  relationshipSide: '',
  relationshipType: '',
  dietaryPreference: 'regular',
  notes: '',
})

const form = ref(defaultForm())
const loading = ref(false)
const errorMsg = ref('')

watch(() => props.visible, (v) => {
  if (v) {
    form.value = defaultForm()
    errorMsg.value = ''
  }
})

async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    const payload: any = {
      name: form.value.name,
      phone: form.value.phone,
      attending: form.value.attending,
      guestCount: form.value.guestCount === '' ? null : Number(form.value.guestCount),
      dietaryPreference: form.value.dietaryPreference,
    }
    if (form.value.relationshipSide) payload.relationshipSide = form.value.relationshipSide
    if (form.value.relationshipType && form.value.relationshipSide) payload.relationshipType = form.value.relationshipType
    if (form.value.notes) payload.notes = form.value.notes

    const res = await adminApi.post('/api/admin/rsvp', payload)
    emit('saved', res.data.data)
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = msg || '新增失敗，請確認資料格式'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400;
}
</style>
