<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <h1 class="text-lg font-semibold text-gray-800">RSVP 管理後台</h1>
      <button
        @click="handleLogout"
        class="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5"
      >
        登出
      </button>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.attending }}</div>
          <div class="text-xs text-gray-500 mt-1">出席</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-red-400">{{ stats.notAttending }}</div>
          <div class="text-xs text-gray-500 mt-1">不克出席</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ stats.totalGuests }}</div>
          <div class="text-xs text-gray-500 mt-1">總出席人數</div>
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
        <button
          @click="exportCsv"
          class="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-100 whitespace-nowrap transition"
        >
          匯出 CSV
        </button>
        <button
          @click="showModal = true"
          class="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-700 whitespace-nowrap transition"
        >
          新增 RSVP
        </button>
      </div>

      <!-- Mobile cards (< md) -->
      <div class="md:hidden space-y-3">
        <template v-if="filteredList.length === 0">
          <p class="text-center text-gray-400 text-sm py-8">找不到符合的紀錄</p>
        </template>
        <div
          v-for="item in filteredList"
          :key="item.id"
          class="bg-white rounded-xl shadow-sm p-4 space-y-3"
        >
          <template v-if="editingId === item.id">
            <!-- Inline edit fields (mobile) -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs text-gray-400">姓名</label>
                <input v-model="editForm.name" class="edit-input" />
              </div>
              <div>
                <label class="text-xs text-gray-400">電話</label>
                <input v-model="editForm.phone" class="edit-input" />
              </div>
              <div>
                <label class="text-xs text-gray-400">出席</label>
                <select v-model="editForm.attending" class="edit-input">
                  <option :value="true">出席</option>
                  <option :value="false">不克出席</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-gray-400">人數</label>
                <input v-model.number="editForm.guestCount" type="number" min="0" max="10" class="edit-input" />
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
                  <option value="regular">一般</option>
                  <option value="vegetarian">素食</option>
                  <option value="no_beef">不吃牛</option>
                  <option value="no_pork">不吃豬</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="text-xs text-gray-400">備註</label>
                <input v-model="editForm.notes" class="edit-input" />
              </div>
            </div>
            <p v-if="editError" class="text-red-500 text-xs">{{ editError }}</p>
            <div class="flex gap-2">
              <button
                @click="saveEdit(item.id)"
                :disabled="editLoading"
                class="flex-1 bg-gray-800 text-white rounded-lg py-2.5 text-sm min-h-[44px] disabled:opacity-50"
              >
                {{ editLoading ? '儲存中...' : '儲存' }}
              </button>
              <button
                @click="cancelEdit"
                :disabled="editLoading"
                class="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm min-h-[44px]"
              >
                取消
              </button>
            </div>
          </template>
          <template v-else>
            <div class="flex justify-between items-start">
              <div>
                <span class="font-semibold text-gray-800">{{ item.name }}</span>
                <span
                  class="ml-2 text-xs px-1.5 py-0.5 rounded"
                  :class="item.attending ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'"
                >
                  {{ item.attending ? '出席' : '不克出席' }}
                </span>
              </div>
              <span class="text-xs text-gray-400">{{ formatDate(item.createdAt) }}</span>
            </div>
            <div class="text-sm text-gray-500 space-y-0.5">
              <div>電話：{{ item.phone }}</div>
              <div>人數：{{ item.guestCount }} 人</div>
              <div v-if="item.relationshipSide">
                賓桌：{{ item.relationshipSide === 'groom' ? '新郎方' : '新娘方' }}
                <template v-if="item.relationshipType">
                  · {{ item.relationshipType === 'relative' ? '親戚' : '朋友' }}
                </template>
              </div>
              <div v-if="item.dietaryPreference && item.dietaryPreference !== 'regular'">
                飲食：{{ dietaryLabel(item.dietaryPreference) }}
              </div>
              <div v-if="item.notes" class="truncate">備註：{{ item.notes }}</div>
            </div>
            <div class="flex gap-2 pt-1">
              <button
                @click="startEdit(item)"
                class="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm min-h-[44px] hover:bg-gray-50"
              >
                修改
              </button>
              <button
                @click="handleDelete(item.id)"
                class="flex-1 border border-red-200 text-red-500 rounded-lg py-2.5 text-sm min-h-[44px] hover:bg-red-50"
              >
                刪除
              </button>
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
              <th class="px-4 py-3 text-left">出席</th>
              <th class="px-4 py-3 text-left">人數</th>
              <th class="px-4 py-3 text-left">賓桌</th>
              <th class="px-4 py-3 text-left">關係</th>
              <th class="px-4 py-3 text-left">飲食</th>
              <th class="px-4 py-3 text-left">備註</th>
              <th class="px-4 py-3 text-left">提交時間</th>
              <th class="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="filteredList.length === 0">
              <td colspan="10" class="px-4 py-8 text-center text-gray-400">找不到符合的紀錄</td>
            </tr>
            <tr
              v-for="item in filteredList"
              :key="item.id"
              class="hover:bg-gray-50 transition"
            >
              <template v-if="editingId === item.id">
                <td class="px-2 py-2"><input v-model="editForm.name" class="edit-input w-24" /></td>
                <td class="px-2 py-2"><input v-model="editForm.phone" class="edit-input w-32" /></td>
                <td class="px-2 py-2">
                  <select v-model="editForm.attending" class="edit-input w-24">
                    <option :value="true">出席</option>
                    <option :value="false">不克出席</option>
                  </select>
                </td>
                <td class="px-2 py-2"><input v-model.number="editForm.guestCount" type="number" min="0" max="10" class="edit-input w-16" /></td>
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
                  <select v-model="editForm.dietaryPreference" class="edit-input w-24">
                    <option value="regular">一般</option>
                    <option value="vegetarian">素食</option>
                    <option value="no_beef">不吃牛</option>
                    <option value="no_pork">不吃豬</option>
                    <option value="other">其他</option>
                  </select>
                </td>
                <td class="px-2 py-2"><input v-model="editForm.notes" class="edit-input w-32" /></td>
                <td class="px-4 py-2 text-gray-400 text-xs">{{ formatDate(item.createdAt) }}</td>
                <td class="px-2 py-2 whitespace-nowrap">
                  <p v-if="editError" class="text-red-500 text-xs mb-1">{{ editError }}</p>
                  <div class="flex gap-1">
                    <button
                      @click="saveEdit(item.id)"
                      :disabled="editLoading"
                      class="text-xs bg-gray-800 text-white rounded px-2 py-1.5 disabled:opacity-50"
                    >
                      {{ editLoading ? '儲存中...' : '儲存' }}
                    </button>
                    <button
                      @click="cancelEdit"
                      :disabled="editLoading"
                      class="text-xs border border-gray-300 text-gray-600 rounded px-2 py-1.5"
                    >
                      取消
                    </button>
                  </div>
                </td>
              </template>
              <template v-else>
                <td class="px-4 py-3 font-medium text-gray-800">{{ item.name }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.phone }}</td>
                <td class="px-4 py-3">
                  <span
                    class="text-xs px-1.5 py-0.5 rounded"
                    :class="item.attending ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'"
                  >
                    {{ item.attending ? '出席' : '不克出席' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ item.guestCount }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.relationshipSide === 'groom' ? '新郎方' : item.relationshipSide === 'bride' ? '新娘方' : '--' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.relationshipType === 'relative' ? '親戚' : item.relationshipType === 'friend' ? '朋友' : '--' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ dietaryLabel(item.dietaryPreference) }}</td>
                <td class="px-4 py-3 text-gray-500 max-w-xs truncate">{{ item.notes || '--' }}</td>
                <td class="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{{ formatDate(item.createdAt) }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex gap-1">
                    <button
                      @click="startEdit(item)"
                      class="text-xs border border-gray-300 text-gray-600 rounded px-2 py-1.5 hover:bg-gray-50"
                    >
                      修改
                    </button>
                    <button
                      @click="handleDelete(item.id)"
                      class="text-xs border border-red-200 text-red-500 rounded px-2 py-1.5 hover:bg-red-50"
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <RsvpModal
      :visible="showModal"
      @close="showModal = false"
      @saved="onRsvpSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import adminApi from '../../services/adminApi'
import RsvpModal from '../../components/admin/RsvpModal.vue'

const router = useRouter()
const rsvpList = ref<any[]>([])
const search = ref('')
const showModal = ref(false)
const editingId = ref<string | null>(null)
const editForm = ref<any>({})
const editLoading = ref(false)
const editError = ref('')

const stats = computed(() => ({
  attending: rsvpList.value.filter((r) => r.attending).length,
  notAttending: rsvpList.value.filter((r) => !r.attending).length,
  totalGuests: rsvpList.value.filter((r) => r.attending).reduce((sum, r) => sum + (r.guestCount || 0), 0),
}))

const filteredList = computed(() => {
  const kw = search.value.trim().toLowerCase()
  if (!kw) return rsvpList.value
  return rsvpList.value.filter(
    (r) => r.name?.toLowerCase().includes(kw) || r.phone?.includes(kw)
  )
})

onMounted(async () => {
  await loadList()
})

async function loadList() {
  const res = await adminApi.get('/api/admin/rsvp')
  rsvpList.value = res.data.data
}

function startEdit(item: any) {
  editingId.value = item.id
  editError.value = ''
  editForm.value = {
    name: item.name,
    phone: item.phone,
    attending: item.attending,
    guestCount: item.guestCount,
    relationshipSide: item.relationshipSide ?? '',
    relationshipType: item.relationshipType ?? '',
    dietaryPreference: item.dietaryPreference ?? 'regular',
    notes: item.notes ?? '',
  }
}

function cancelEdit() {
  editingId.value = null
  editError.value = ''
}

async function saveEdit(id: string) {
  editError.value = ''
  editLoading.value = true
  try {
    const payload: any = {
      name: editForm.value.name,
      phone: editForm.value.phone,
      attending: editForm.value.attending,
      guestCount: editForm.value.guestCount,
      dietaryPreference: editForm.value.dietaryPreference,
    }
    if (editForm.value.relationshipSide) payload.relationshipSide = editForm.value.relationshipSide
    else payload.relationshipSide = null
    if (editForm.value.relationshipType && editForm.value.relationshipSide) {
      payload.relationshipType = editForm.value.relationshipType
    } else {
      payload.relationshipType = null
    }
    payload.notes = editForm.value.notes || null

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

async function handleDelete(id: string) {
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
  const d = new Date(iso)
  return d.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false })
}

function dietaryLabel(val: string) {
  const map: Record<string, string> = {
    regular: '一般',
    vegetarian: '素食',
    no_beef: '不吃牛',
    no_pork: '不吃豬',
    other: '其他',
  }
  return map[val] ?? val
}

function csvEscape(val: any): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

function exportCsv() {
  const headers = [
    '編號', '姓名', '電話', '出席狀態', '出席人數',
    '賓桌歸屬', '關係類型', '飲食偏好', '備註',
    '提交時間（UTC+8）', '通知信已發送',
  ]

  const sideLabel = (v: string | null) =>
    v === 'groom' ? '新郎方' : v === 'bride' ? '新娘方' : ''
  const typeLabel = (v: string | null) =>
    v === 'relative' ? '親戚' : v === 'friend' ? '朋友' : ''

  const rows = rsvpList.value.map((r) => [
    r.id,
    r.name,
    r.phone,
    r.attending ? '出席' : '不克出席',
    r.guestCount,
    sideLabel(r.relationshipSide),
    typeLabel(r.relationshipType),
    dietaryLabel(r.dietaryPreference),
    r.notes ?? '',
    formatDate(r.createdAt),
    r.notificationEmailSent ? '是' : '否',
  ])

  const s = stats.value
  const summaryRows = [
    [],
    ['【統計摘要】'],
    ['出席筆數', s.attending],
    ['不克出席筆數', s.notAttending],
    ['總出席人數', s.totalGuests],
    ['總回覆筆數', rsvpList.value.length],
  ]

  const allRows = [headers, ...rows, ...summaryRows]
  const csv = allRows.map((row) => row.map(csvEscape).join(',')).join('\r\n')

  // BOM for Excel to display Chinese correctly
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
