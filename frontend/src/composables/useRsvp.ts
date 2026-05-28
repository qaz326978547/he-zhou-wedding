import { ref, computed, reactive, watch } from 'vue'
import api from '@/services/api'
import type { RsvpPayload } from '@/types'

const TAIWAN_PHONE = /^09\d{8}$|^0[2-9]\d{7,8}$/

export function useRsvp() {
  const form = reactive({
    name: '',
    phone: '',
    attending: true as boolean,
    adultCount: 1,
    childCount: 0,
    needsHighchair: null as boolean | null,
    highchairCount: 1,
    relationshipSide: '' as '' | 'groom' | 'bride',
    relationshipType: '' as '' | 'relative' | 'friend',
    dietaryPreference: 'regular' as 'regular' | 'vegetarian',
    needsInvitation: false,
    invitationName: '',
    invitationPhone: '',
    invitationAddress: '',
  })

  const errors = reactive<Record<string, string>>({})
  const isLoading = ref(false)
  const isSubmitted = ref(false)
  const submitError = ref('')
  const isRsvpEnabled = ref(true)

  const showGuestFields = computed(() => form.attending === true)
  const showHighchair = computed(() => form.attending && form.childCount > 0)
  const showRelationshipType = computed(() => !!form.relationshipSide)
  const showInvitationFields = computed(() => form.needsInvitation)

  watch(() => form.childCount, (newCount) => {
    if (newCount > 0 && form.highchairCount > newCount) {
      form.highchairCount = newCount
    }
  })

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
    if (form.attending) {
      if (!form.adultCount || form.adultCount < 1 || form.adultCount > 10) {
        errors.adultCount = '請選擇大人人數（1–10）'
        valid = false
      }
      if (form.childCount < 0 || form.childCount > 10) {
        errors.childCount = '小孩人數請選 0–10'
        valid = false
      }
      if (form.childCount > 0 && form.needsHighchair === null) {
        errors.needsHighchair = '請選擇是否需要兒童椅'
        valid = false
      }
    }
    if (form.needsInvitation) {
      if (!form.invitationName.trim()) {
        errors.invitationName = '請填寫收件人姓名'
        valid = false
      }
      if (!form.invitationPhone.trim() || !TAIWAN_PHONE.test(form.invitationPhone.trim())) {
        errors.invitationPhone = '請填寫有效的收件人電話'
        valid = false
      }
      if (!form.invitationAddress.trim()) {
        errors.invitationAddress = '請填寫收件地址'
        valid = false
      }
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
      dietaryPreference: form.dietaryPreference,
      needsInvitation: form.needsInvitation,
    }

    if (form.attending) {
      payload.adultCount = form.adultCount
      payload.childCount = form.childCount
      if (form.childCount > 0) {
        payload.needsHighchair = form.needsHighchair
        if (form.needsHighchair === true) payload.highchairCount = form.highchairCount
      }
    }
    if (form.relationshipSide) payload.relationshipSide = form.relationshipSide
    if (form.relationshipSide && form.relationshipType) payload.relationshipType = form.relationshipType
    if (form.needsInvitation) {
      payload.invitationName = form.invitationName.trim()
      payload.invitationPhone = form.invitationPhone.trim()
      payload.invitationAddress = form.invitationAddress.trim()
    }

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
    showGuestFields,
    showHighchair,
    showRelationshipType,
    showInvitationFields,
    submit,
    checkRsvpStatus,
  }
}
