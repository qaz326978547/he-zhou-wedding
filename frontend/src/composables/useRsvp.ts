import { ref, computed, reactive } from 'vue'
import api from '@/services/api'
import type { RsvpPayload } from '@/types'

const TAIWAN_PHONE = /^09\d{8}$|^0[2-9]\d{7,8}$/

export function useRsvp() {
  const form = reactive({
    name: '',
    phone: '',
    attending: true as boolean,
    guestCount: 1,
    relationshipSide: '' as '' | 'groom' | 'bride',
    relationshipType: '' as '' | 'relative' | 'friend',
    dietaryPreference: 'regular' as RsvpPayload['dietaryPreference'],
    notes: '',
  })

  const errors = reactive<Record<string, string>>({})
  const isLoading = ref(false)
  const isSubmitted = ref(false)
  const submitError = ref('')
  const isRsvpEnabled = ref(true)

  const showGuestCount = computed(() => form.attending === true)
  const showRelationshipType = computed(() => !!form.relationshipSide)
  const notesLength = computed(() => form.notes.length)

  function clearErrors() {
    Object.keys(errors).forEach((k) => delete errors[k])
  }

  function validate(): boolean {
    clearErrors()
    let valid = true

    if (!form.name.trim()) {
      errors.name = '請填寫姓名'
      valid = false
    }
    if (!form.phone.trim()) {
      errors.phone = '請填寫電話號碼'
      valid = false
    } else if (!TAIWAN_PHONE.test(form.phone)) {
      errors.phone = '請輸入台灣手機（09 開頭）或市話格式'
      valid = false
    }
    if (form.attending && (form.guestCount < 1 || form.guestCount > 10)) {
      errors.guestCount = '出席人數需在 1–10 之間'
      valid = false
    }
    if (form.notes.length > 300) {
      errors.notes = '備註最多 300 字元'
      valid = false
    }

    return valid
  }

  async function checkRsvpStatus() {
    try {
      const res = await api.get<{ data: { enabled: boolean } }>('/api/rsvp/status')
      isRsvpEnabled.value = res.data.data.enabled
    } catch {
      isRsvpEnabled.value = true
    }
  }

  async function submit() {
    if (!validate()) return
    isLoading.value = true
    submitError.value = ''

    const payload: RsvpPayload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      attending: form.attending,
      guestCount: form.attending ? form.guestCount : 0,
      dietaryPreference: form.dietaryPreference,
    }
    if (form.relationshipSide) payload.relationshipSide = form.relationshipSide
    if (form.relationshipSide && form.relationshipType)
      payload.relationshipType = form.relationshipType
    if (form.notes.trim()) payload.notes = form.notes.trim()

    try {
      await api.post('/api/rsvp', payload)
      isSubmitted.value = true
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { error?: string; message?: string } } }
      const status = e.response?.status
      if (status === 409) {
        submitError.value = '已收到您的回覆，感謝您！'
      } else if (status === 422) {
        submitError.value = '報名已截止'
      } else if (status === 429) {
        submitError.value = '提交過於頻繁，請稍後再試'
      } else if (status === 400) {
        submitError.value = e.response?.data?.message ?? '表單資料有誤，請重新檢查'
      } else {
        submitError.value = '提交失敗，請稍後再試'
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    form,
    errors,
    isLoading,
    isSubmitted,
    submitError,
    isRsvpEnabled,
    showGuestCount,
    showRelationshipType,
    notesLength,
    submit,
    checkRsvpStatus,
  }
}
