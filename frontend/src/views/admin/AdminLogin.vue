<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
      <h1 class="text-2xl font-semibold text-center text-gray-800 mb-6">後台管理登入</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1" for="username">帳號</label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="輸入帳號"
            :disabled="loading"
          />
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1" for="password">密碼</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="輸入密碼"
            :disabled="loading"
          />
        </div>

        <p v-if="errorMsg" class="text-red-500 text-sm text-center">{{ errorMsg }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gray-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ loading ? '登入中...' : '登入' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import adminApi from '../../services/adminApi'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await adminApi.post('/api/admin/login', {
      username: username.value,
      password: password.value,
    })
    localStorage.setItem('admin_token', res.data.data.token)
    router.push('/admin')
  } catch {
    errorMsg.value = '帳號或密碼錯誤'
  } finally {
    loading.value = false
  }
}
</script>
