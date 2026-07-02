<script lang="ts" setup>
import { reactive, ref } from "vue";
import api from "@/services/api";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";

const form = reactive({
  name: "",
  amount: "",
});

const errors = reactive<{ name?: string; amount?: string }>({});
const isLoading = ref(false);
const submitError = ref("");
const showSuccess = ref(false);

function validate(): boolean {
  errors.name = undefined;
  errors.amount = undefined;

  if (!form.name.trim()) {
    errors.name = "請輸入姓名";
  }

  const amount = Number(form.amount);
  if (!form.amount || !Number.isInteger(amount) || amount <= 0) {
    errors.amount = "金額須為正整數";
  }

  return !errors.name && !errors.amount;
}

async function submit() {
  showSuccess.value = false;
  submitError.value = "";

  if (!validate()) return;

  isLoading.value = true;
  try {
    await api.post("/api/red-envelope", {
      name: form.name.trim(),
      amount: Number(form.amount),
    });
    form.name = "";
    form.amount = "";
    showSuccess.value = true;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 400) {
      submitError.value = err.response?.data?.message ?? "輸入資料有誤";
    } else if (status === 429) {
      submitError.value = "提交過於頻繁，請稍後再試";
    } else {
      submitError.value = "送出失敗，請稍後再試";
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <section
    class="min-h-screen bg-wedding-cream flex items-center justify-center px-6 py-16"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-10">
        <p class="font-script text-3xl text-wedding-gold mb-2">Gift</p>
        <h1 class="font-display text-2xl md:text-3xl text-wedding-charcoal font-light">
          紅包登記
        </h1>
        <div class="gold-divider" />
      </div>

      <div
        v-if="showSuccess"
        class="border border-wedding-gold/40 bg-wedding-gold/5 px-4 py-3 text-wedding-charcoal text-sm rounded-lg mb-6 text-center"
      >
        登記成功，感謝您的祝福！
      </div>

      <div
        v-if="submitError"
        class="border border-red-300 bg-red-50 px-4 py-3 text-red-500 text-sm rounded-lg mb-6"
      >
        {{ submitError }}
      </div>

      <form class="space-y-8" novalidate @submit.prevent="submit">
        <Input
          v-model="form.name"
          label="姓名"
          placeholder="請輸入姓名"
          :error="errors.name"
          :disabled="isLoading"
          required
        />

        <Input
          v-model="form.amount"
          label="紅包金額"
          type="number"
          placeholder="請輸入金額"
          :error="errors.amount"
          :disabled="isLoading"
          required
        />

        <Button type="submit" :loading="isLoading" :disabled="isLoading" class="w-full">
          {{ isLoading ? "送出中…" : "送出" }}
        </Button>
      </form>
    </div>
  </section>
</template>
