<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <h1 class="text-lg font-semibold text-gray-800">RSVP 管理後台</h1>
      <button @click="handleLogout" class="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5">
        登出
      </button>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <!-- Load error -->
      <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
        資料載入失敗，請重新整理頁面
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-gray-800">{{ rsvpList.length }}</div>
          <div class="text-xs text-gray-500 mt-1">總回覆筆數</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ stats.totalGuests }}</div>
          <div class="text-xs text-gray-500 mt-1">總出席人數（大人+小孩）</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 items-center flex-wrap">
        <input
          v-model="search"
          type="text"
          placeholder="搜尋姓名或電話..."
          class="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button @click="exportCsv" class="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-100 whitespace-nowrap transition">
          匯出 CSV
        </button>
        <button @click="showModal = true" class="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-700 whitespace-nowrap transition">
          新增 RSVP
        </button>
      </div>

      <!-- Mobile cards (< md) -->
      <div class="md:hidden space-y-3">
        <p v-if="filteredList.length === 0" class="text-center text-gray-400 text-sm py-8">找不到符合的紀錄</p>
        <div v-for="item in filteredList" :key="item.id" class="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <template v-if="editingId === item.id">
            <div class="grid grid-cols-2 gap-2">
              <div><label class="text-xs text-gray-400">姓名</label><input v-model="editForm.name" class="edit-input" /></div>
              <div><label class="text-xs text-gray-400">電話</label><input v-model="editForm.phone" class="edit-input" /></div>
              <div>
                <label class="text-xs text-gray-400">大人幾位</label>
                <select v-model="editForm.adultCount" class="edit-input">
                  <option value="">--</option>
                  <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-gray-400">小孩幾位</label>
                <select v-model="editForm.childCount" class="edit-input">
                  <option v-for="n in 11" :key="n-1" :value="n-1">{{ n-1 }}</option>
                </select>
              </div>
              <div v-if="editForm.childCount > 0">
                <label class="text-xs text-gray-400">兒童椅</label>
                <select v-model="editForm.needsHighchair" class="edit-input">
                  <option :value="null">--</option>
                  <option :value="true">需要</option>
                  <option :value="false">不需要</option>
                </select>
              </div>
              <div v-if="editForm.needsHighchair === true">
                <label class="text-xs text-gray-400">兒童椅幾張</label>
                <select v-model="editForm.highchairCount" class="edit-input">
                  <option v-for="n in (editForm.childCount || 0)" :key="n" :value="n">{{ n }} 張</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-gray-400">賓桌</label>
                <select v-model="editForm.relationshipSide" class="edit-input">
                  <option value="">--</option>
                  <option value="groom">新郎方</option>
                  <option value="bride">新娘方</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-gray-400">關係</label>
                <select v-model="editForm.relationshipType" class="edit-input" :disabled="!editForm.relationshipSide">
                  <option value="">--</option>
                  <option value="relative">親戚</option>
                  <option value="friend">朋友</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-gray-400">飲食</label>
                <select v-model="editForm.dietaryPreference" class="edit-input">
                  <option value="regular">葷食</option>
                  <option value="vegetarian">素食</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-gray-400">紙本喜帖</label>
                <select v-model="editForm.needsInvitation" class="edit-input">
                  <option :value="false">不需要</option>
                  <option :value="true">需要</option>
                </select>
              </div>
              <template v-if="editForm.needsInvitation">
                <div class="col-span-2"><label class="text-xs text-gray-400">收件人</label><input v-model="editForm.invitationName" class="edit-input" /></div>
                <div><label class="text-xs text-gray-400">收件電話</label><input v-model="editForm.invitationPhone" class="edit-input" /></div>
                <div><label class="text-xs text-gray-400">收件地址</label><input v-model="editForm.invitationAddress" class="edit-input" /></div>
              </template>
            </div>
            <p v-if="editError" class="text-red-500 text-xs">{{ editError }}</p>
            <div class="flex gap-2">
              <button @click="saveEdit(item.id)" :disabled="editLoading" class="flex-1 bg-gray-800 text-white rounded-lg py-2.5 text-sm min-h-[44px] disabled:opacity-50">
                {{ editLoading ? '儲存中...' : '儲存' }}
              </button>
              <button @click="cancelEdit" :disabled="editLoading" class="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm min-h-[44px]">
                取消
              </button>
            </div>
          </template>
          <template v-else>
            <div class="flex justify-between items-start">
              <span class="font-semibold text-gray-800">{{ item.name }}</span>
              <span class="text-xs text-gray-400">{{ formatDate(item.createdAt) }}</span>
            </div>
            <div class="text-sm text-gray-500 space-y-0.5">
              <div>電話：{{ item.phone }}</div>
              <div>大人：{{ item.adultCount ?? '--' }} 位　小孩：{{ item.childCount ?? '--' }} 位</div>
              <div v-if="item.childCount > 0">兒童椅：{{ item.needsHighchair === true ? `需要 ${item.highchairCount ?? 1} 張` : item.needsHighchair === false ? '不需要' : '--' }}</div>
              <div v-if="item.relationshipSide">
                賓桌：{{ item.relationshipSide === 'groom' ? '新郎方' : '新娘方' }}
                <template v-if="item.relationshipType">· {{ item.relationshipType === 'relative' ? '親戚' : '朋友' }}</template>
              </div>
              <div v-if="item.dietaryPreference === 'vegetarian'">飲食：素食</div>
              <div>紙本喜帖：{{ item.needsInvitation ? '需要' : '不需要' }}</div>
              <template v-if="item.needsInvitation">
                <div class="text-xs text-gray-400">收件：{{ item.invitationName }} · {{ item.invitationPhone }}</div>
                <div class="text-xs text-gray-400 truncate">{{ item.invitationAddress }}</div>
              </template>
              <div class="text-xs text-gray-400">通知信：{{ item.notificationEmailSent ? '已發送' : '未發送' }}</div>
            </div>
            <div class="flex gap-2 pt-1">
              <button @click="startEdit(item)" class="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm min-h-[44px] hover:bg-gray-50">修改</button>
              <button @click="handleDelete(item.id)" class="flex-1 border border-red-200 text-red-500 rounded-lg py-2.5 text-sm min-h-[44px] hover:bg-red-50">刪除</button>
            </div>
          </template>
        </div>
      </div>

      <!-- Desktop table (>= md) -->
      <div class="hidden md:block bg-white rounded-xl shadow-sm overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th class="px-4 py-3 text-left">姓名</th>
              <th class="px-4 py-3 text-left">電話</th>
              <th class="px-4 py-3 text-left">大人</th>
              <th class="px-4 py-3 text-left">小孩</th>
              <th class="px-4 py-3 text-left">兒童椅</th>
              <th class="px-4 py-3 text-left">賓桌</th>
              <th class="px-4 py-3 text-left">關係</th>
              <th class="px-4 py-3 text-left">飲食</th>
              <th class="px-4 py-3 text-left">喜帖</th>
              <th class="px-4 py-3 text-left">提交時間</th>
              <th class="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="filteredList.length === 0">
              <td colspan="11" class="px-4 py-8 text-center text-gray-400">找不到符合的紀錄</td>
            </tr>
            <tr v-for="item in filteredList" :key="item.id" class="hover:bg-gray-50 transition">
              <template v-if="editingId === item.id">
                <td class="px-2 py-2"><input v-model="editForm.name" class="edit-input w-24" /></td>
                <td class="px-2 py-2"><input v-model="editForm.phone" class="edit-input w-32" /></td>
                <td class="px-2 py-2">
                  <select v-model="editForm.adultCount" class="edit-input w-16">
                    <option value="">--</option>
                    <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                  </select>
                </td>
                <td class="px-2 py-2">
                  <select v-model="editForm.childCount" class="edit-input w-16">
                    <option v-for="n in 11" :key="n-1" :value="n-1">{{ n-1 }}</option>
                  </select>
                </td>
                <td class="px-2 py-2">
                  <select v-model="editForm.needsHighchair" class="edit-input w-20" :disabled="!editForm.childCount">
                    <option :value="null">--</option>
                    <option :value="true">需要</option>
                    <option :value="false">不需要</option>
                  </select>
                  <select v-if="editForm.needsHighchair === true" v-model="editForm.highchairCount" class="edit-input w-16 mt-1">
                    <option v-for="n in (editForm.childCount || 0)" :key="n" :value="n">{{ n }} 張</option>
                  </select>
                </td>
                <td class="px-2 py-2">
                  <select v-model="editForm.relationshipSide" class="edit-input w-24">
                    <option value="">--</option>
                    <option value="groom">新郎方</option>
                    <option value="bride">新娘方</option>
                  </select>
                </td>
                <td class="px-2 py-2">
                  <select v-model="editForm.relationshipType" class="edit-input w-20" :disabled="!editForm.relationshipSide">
                    <option value="">--</option>
                    <option value="relative">親戚</option>
                    <option value="friend">朋友</option>
                  </select>
                </td>
                <td class="px-2 py-2">
                  <select v-model="editForm.dietaryPreference" class="edit-input w-20">
                    <option value="regular">葷食</option>
                    <option value="vegetarian">素食</option>
                  </select>
                </td>
                <td class="px-2 py-2">
                  <select v-model="editForm.needsInvitation" class="edit-input w-20">
                    <option :value="false">不需要</option>
                    <option :value="true">需要</option>
                  </select>
                </td>
                <td class="px-4 py-2 text-gray-400 text-xs">{{ formatDate(item.createdAt) }}</td>
                <td class="px-2 py-2 whitespace-nowrap">
                  <p v-if="editError" class="text-red-500 text-xs mb-1">{{ editError }}</p>
                  <div class="flex gap-1">
                    <button @click="saveEdit(item.id)" :disabled="editLoading" class="text-xs bg-gray-800 text-white rounded px-2 py-1.5 disabled:opacity-50">
                      {{ editLoading ? '儲存中...' : '儲存' }}
                    </button>
                    <button @click="cancelEdit" :disabled="editLoading" class="text-xs border border-gray-300 text-gray-600 rounded px-2 py-1.5">取消</button>
                  </div>
                </td>
              </template>
              <template v-else>
                <td class="px-4 py-3 font-medium text-gray-800">{{ item.name }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.phone }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.adultCount ?? '--' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.childCount ?? '--' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.needsHighchair === true ? `需要 ${item.highchairCount ?? 1} 張` : item.needsHighchair === false ? '不需要' : '--' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.relationshipSide === 'groom' ? '新郎方' : item.relationshipSide === 'bride' ? '新娘方' : '--' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.relationshipType === 'relative' ? '親戚' : item.relationshipType === 'friend' ? '朋友' : '--' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.dietaryPreference === 'vegetarian' ? '素食' : '葷食' }}</td>
                <td class="px-4 py-3 text-gray-600">
                  <span v-if="item.needsInvitation" class="text-blue-600">需要</span>
                  <span v-else class="text-gray-400">不需要</span>
                </td>
                <td class="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{{ formatDate(item.createdAt) }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex gap-1">
                    <button @click="startEdit(item)" class="text-xs border border-gray-300 text-gray-600 rounded px-2 py-1.5 hover:bg-gray-50">修改</button>
                    <button @click="handleDelete(item.id)" class="text-xs border border-red-200 text-red-500 rounded px-2 py-1.5 hover:bg-red-50">刪除</button>
                  </div>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <RsvpModal :visible="showModal" @close="showModal = false" @saved="onRsvpSaved" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import adminApi from '../../services/adminApi'
import RsvpModal from '../../components/admin/RsvpModal.vue'

const router = useRouter()
const rsvpList = ref<any[]>([])
const search = ref('')
const showModal = ref(false)
const editingId = ref<number | null>(null)
const editForm = ref<any>({})
const editLoading = ref(false)
const editError = ref('')
const loadError = ref(false)

const stats = computed(() => ({
  totalGuests: rsvpList.value.reduce((sum, r) => sum + (r.adultCount || 0) + (r.childCount || 0), 0),
}))

const filteredList = computed(() => {
  const kw = search.value.trim().toLowerCase()
  if (!kw) return rsvpList.value
  return rsvpList.value.filter((r) => r.name?.toLowerCase().includes(kw) || r.phone?.includes(kw))
})

onMounted(loadList)

async function loadList() {
  loadError.value = false
  try {
    const res = await adminApi.get('/api/admin/rsvp')
    rsvpList.value = res.data.data
  } catch {
    loadError.value = true
  }
}

watch(() => editForm.value.childCount, (newCount) => {
  if (newCount > 0 && editForm.value.highchairCount > newCount) {
    editForm.value.highchairCount = newCount
  }
})

function startEdit(item: any) {
  editingId.value = item.id
  editError.value = ''
  editForm.value = {
    name: item.name,
    phone: item.phone,
    attending: item.attending,
    adultCount: item.adultCount ?? '',
    childCount: item.childCount ?? 0,
    needsHighchair: item.needsHighchair ?? null,
    highchairCount: item.highchairCount ?? 1,
    relationshipSide: item.relationshipSide ?? '',
    relationshipType: item.relationshipType ?? '',
    dietaryPreference: item.dietaryPreference ?? 'regular',
    needsInvitation: item.needsInvitation ?? false,
    invitationName: item.invitationName ?? '',
    invitationPhone: item.invitationPhone ?? '',
    invitationAddress: item.invitationAddress ?? '',
  }
}

function cancelEdit() {
  editingId.value = null
  editError.value = ''
}

async function saveEdit(id: number) {
  editError.value = ''
  editLoading.value = true
  try {
    const payload: any = {
      name: editForm.value.name,
      phone: editForm.value.phone,
      attending: editForm.value.attending,
      adultCount: editForm.value.adultCount === '' ? null : Number(editForm.value.adultCount),
      childCount: Number(editForm.value.childCount),
      needsHighchair: editForm.value.childCount > 0 ? editForm.value.needsHighchair : null,
      highchairCount: editForm.value.childCount > 0 && editForm.value.needsHighchair === true
        ? (editForm.value.highchairCount || 1) : null,
      dietaryPreference: editForm.value.dietaryPreference,
      needsInvitation: editForm.value.needsInvitation,
      relationshipSide: editForm.value.relationshipSide || null,
      relationshipType: editForm.value.relationshipSide && editForm.value.relationshipType
        ? editForm.value.relationshipType : null,
    }
    if (editForm.value.needsInvitation) {
      payload.invitationName = editForm.value.invitationName || null
      payload.invitationPhone = editForm.value.invitationPhone || null
      payload.invitationAddress = editForm.value.invitationAddress || null
    } else {
      payload.invitationName = null
      payload.invitationPhone = null
      payload.invitationAddress = null
    }

    const res = await adminApi.put(`/api/admin/rsvp/${id}`, payload)
    const idx = rsvpList.value.findIndex((r) => r.id === id)
    if (idx !== -1) rsvpList.value[idx] = res.data.data
    editingId.value = null
  } catch (err: any) {
    editError.value = err.response?.data?.message || '儲存失敗'
  } finally {
    editLoading.value = false
  }
}

async function handleDelete(id: number) {
  if (!window.confirm('確定刪除這筆 RSVP？')) return
  await adminApi.delete(`/api/admin/rsvp/${id}`)
  rsvpList.value = rsvpList.value.filter((r) => r.id !== id)
}

function onRsvpSaved(record: any) {
  rsvpList.value.unshift(record)
  showModal.value = false
}

function handleLogout() {
  localStorage.removeItem('admin_token')
  router.push('/admin/login')
}

function formatDate(iso: string) {
  if (!iso) return '--'
  return new Date(iso).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false })
}

function csvEscape(val: any): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"` : str
}

function exportCsv() {
  const headers = [
    '編號', '姓名', '電話', '大人幾位', '小孩幾位', '兒童椅',
    '賓桌歸屬', '關係類型', '飲食偏好',
    '紙本喜帖', '收件人', '收件電話', '收件地址',
    '提交時間（UTC+8）', '通知信已發送',
  ]

  const sideLabel = (v: string) => v === 'groom' ? '新郎方' : v === 'bride' ? '新娘方' : ''
  const typeLabel = (v: string) => v === 'relative' ? '親戚' : v === 'friend' ? '朋友' : ''
  const highchairLabel = (v: boolean | null, count?: number | null) =>
    v === true ? `需要 ${count ?? 1} 張` : v === false ? '不需要' : ''

  const rows = rsvpList.value.map((r) => [
    r.id, r.name, r.phone,
    r.adultCount ?? '', r.childCount ?? '', highchairLabel(r.needsHighchair, r.highchairCount),
    sideLabel(r.relationshipSide), typeLabel(r.relationshipType),
    r.dietaryPreference === 'vegetarian' ? '素食' : '葷食',
    r.needsInvitation ? '需要' : '不需要',
    r.invitationName ?? '', r.invitationPhone ?? '', r.invitationAddress ?? '',
    formatDate(r.createdAt),
    r.notificationEmailSent ? '是' : '否',
  ])

  const summaryRows = [
    [],
    ['【統計摘要】'],
    ['總回覆筆數', rsvpList.value.length],
    ['總出席人數（大人+小孩）', stats.value.totalGuests],
  ]

  const csv = [...[headers], ...rows, ...summaryRows].map((row) => row.map(csvEscape).join(',')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' }).replace(/\//g, '')
  a.href = url
  a.download = `RSVP_${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.edit-input {
  @apply border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 w-full;
}
</style>
