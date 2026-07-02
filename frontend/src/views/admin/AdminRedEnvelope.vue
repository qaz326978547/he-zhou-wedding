<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <h1 class="text-lg font-semibold text-gray-800">紅包登記後台</h1>
      <div class="flex items-center gap-3">
        <RouterLink to="/admin" class="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5">
          RSVP 管理
        </RouterLink>
        <button @click="handleLogout" class="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5">
          登出
        </button>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <!-- Load error -->
      <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
        資料載入失敗，請重新整理頁面
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-gray-800">{{ entries.length }}</div>
          <div class="text-xs text-gray-500 mt-1">總筆數</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ totalAmount.toLocaleString() }}</div>
          <div class="text-xs text-gray-500 mt-1">總金額（新台幣）</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 items-center flex-wrap justify-end">
        <button @click="exportCsv" class="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-100 whitespace-nowrap transition">
          匯出 Excel
        </button>
      </div>

      <!-- Empty state -->
      <p v-if="entries.length === 0" class="text-center text-gray-400 text-sm py-12">尚無紅包登記紀錄</p>

      <template v-else>
        <!-- Mobile cards (< md) -->
        <div class="md:hidden space-y-3">
          <div v-for="item in entries" :key="item.id" class="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <template v-if="editingId === item.id">
              <div class="grid grid-cols-2 gap-2">
                <div><label class="text-xs text-gray-400">姓名</label><input v-model="editForm.name" class="edit-input" /></div>
                <div><label class="text-xs text-gray-400">金額</label><input v-model.number="editForm.amount" type="number" class="edit-input" /></div>
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
              <div class="text-sm text-gray-600">金額：{{ item.amount.toLocaleString() }}</div>
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
                <th class="px-4 py-3 text-left">編號</th>
                <th class="px-4 py-3 text-left">姓名</th>
                <th class="px-4 py-3 text-left">金額</th>
                <th class="px-4 py-3 text-left">登記時間</th>
                <th class="px-4 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in entries" :key="item.id" class="hover:bg-gray-50 transition">
                <template v-if="editingId === item.id">
                  <td class="px-4 py-2 text-gray-400">{{ item.id }}</td>
                  <td class="px-2 py-2"><input v-model="editForm.name" class="edit-input w-32" /></td>
                  <td class="px-2 py-2"><input v-model.number="editForm.amount" type="number" class="edit-input w-24" /></td>
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
                  <td class="px-4 py-3 text-gray-400">{{ item.id }}</td>
                  <td class="px-4 py-3 font-medium text-gray-800">{{ item.name }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ item.amount.toLocaleString() }}</td>
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
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import adminApi from '../../services/adminApi'

const router = useRouter()
const entries = ref<any[]>([])
const editingId = ref<number | null>(null)
const editForm = ref<any>({})
const editLoading = ref(false)
const editError = ref('')
const loadError = ref(false)

const totalAmount = computed(() => entries.value.reduce((sum, e) => sum + (e.amount || 0), 0))

onMounted(loadList)

async function loadList() {
  loadError.value = false
  try {
    const res = await adminApi.get('/api/admin/red-envelope')
    entries.value = res.data.data
  } catch {
    loadError.value = true
  }
}

function startEdit(item: any) {
  editingId.value = item.id
  editError.value = ''
  editForm.value = { name: item.name, amount: item.amount }
}

function cancelEdit() {
  editingId.value = null
  editError.value = ''
}

async function saveEdit(id: number) {
  editError.value = ''
  editLoading.value = true
  try {
    const res = await adminApi.put(`/api/admin/red-envelope/${id}`, {
      name: editForm.value.name,
      amount: Number(editForm.value.amount),
    })
    const idx = entries.value.findIndex((e) => e.id === id)
    if (idx !== -1) entries.value[idx] = res.data.data
    editingId.value = null
  } catch (err: any) {
    editError.value = err.response?.data?.message || '儲存失敗'
  } finally {
    editLoading.value = false
  }
}

async function handleDelete(id: number) {
  if (!window.confirm('確定刪除這筆紅包登記？')) return
  await adminApi.delete(`/api/admin/red-envelope/${id}`)
  entries.value = entries.value.filter((e) => e.id !== id)
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
  const headers = ['編號', '姓名', '金額', '登記時間（UTC+8）']

  const rows = entries.value.map((e) => [e.id, e.name, e.amount, formatDate(e.createdAt)])

  const summaryRows = [
    [],
    ['【統計摘要】'],
    ['總筆數', entries.value.length],
    ['總金額', totalAmount.value],
  ]

  const csv = [...[headers], ...rows, ...summaryRows].map((row) => row.map(csvEscape).join(',')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value
  const date = `${get('year')}${get('month')}${get('day')}`
  a.href = url
  a.download = `紅包登記_${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.edit-input {
  @apply border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 w-full;
}
</style>
