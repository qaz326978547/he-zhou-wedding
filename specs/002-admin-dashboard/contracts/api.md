# API 合約文件：後台管理介面

**Feature**: `002-admin-dashboard`
**Date**: 2026-05-28
**Base URL**: `https://api.hezhouwedding.com`
**API Prefix**: `/api/admin`

---

## 通用設定

### 請求標頭

```
Content-Type: application/json
```

後台 API（除 `/api/admin/login` 外）MUST 攜帶：

```
Authorization: Bearer <JWT token>
```

### 回應格式

**成功回應**：
```json
{ "data": { ... } }
```

**錯誤回應**：
```json
{ "error": "ERROR_CODE", "message": "人類可讀錯誤訊息" }
```

### 錯誤碼速查

| 錯誤碼 | HTTP | 觸發情境 |
|--------|------|----------|
| `INVALID_CREDENTIALS` | 401 | 帳號或密碼錯誤 |
| `UNAUTHORIZED` | 401 | 未攜帶 token 或 token 無效 / 過期 |
| `VALIDATION_ERROR` | 400 | 輸入驗證失敗 |
| `DUPLICATE_PHONE` | 409 | 電話號碼重複 |
| `NOT_FOUND` | 404 | 指定 id 不存在 |
| `INTERNAL_ERROR` | 500 | 伺服器未預期錯誤 |

---

## POST /api/admin/login

登入並取得 JWT token。

### 請求

```json
{
  "username": "bean",
  "password": "bean"
}
```

### 回應

#### 200 OK — 成功

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "bean"
  }
}
```

#### 401 Unauthorized — 帳密錯誤

```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "帳號或密碼錯誤"
}
```

---

## GET /api/admin/rsvp

查詢所有 RSVP 資料，依 `createdAt` 降冪排序。需 JWT。

### 回應

#### 200 OK

```json
{
  "data": [
    {
      "id": 1,
      "name": "王大明",
      "phone": "0912345678",
      "attending": true,
      "guestCount": 2,
      "relationshipSide": "groom",
      "relationshipType": "friend",
      "dietaryPreference": "regular",
      "notes": null,
      "notificationEmailSent": true,
      "notificationEmailSentAt": "2026-05-28T10:00:00.000Z",
      "notificationEmailError": null,
      "createdAt": "2026-05-28T10:00:00.000Z"
    }
  ]
}
```

---

## POST /api/admin/rsvp

新增 RSVP 資料。需 JWT。驗證規則與前台 `POST /api/rsvp` 相同。

### 請求

```json
{
  "name": "李小華",
  "phone": "0987654321",
  "attending": true,
  "guestCount": 1,
  "relationshipSide": "bride",
  "relationshipType": "relative",
  "dietaryPreference": "vegetarian",
  "notes": null
}
```

### 回應

#### 201 Created

```json
{
  "data": {
    "id": 3,
    "message": "RSVP 已成功新增"
  }
}
```

#### 400 / 409 — 驗證失敗 / 重複電話

與前台 `POST /api/rsvp` 相同格式。

---

## PUT /api/admin/rsvp/:id

修改指定 RSVP。需 JWT。支援部分欄位更新（Partial）。

### 請求

```
PUT /api/admin/rsvp/3
```

```json
{
  "attending": false,
  "guestCount": 0,
  "notes": "臨時無法出席"
}
```

### 回應

#### 200 OK

```json
{
  "data": {
    "id": 3,
    "message": "RSVP 已成功更新"
  }
}
```

#### 404 Not Found

```json
{
  "error": "NOT_FOUND",
  "message": "找不到指定的 RSVP 記錄"
}
```

---

## DELETE /api/admin/rsvp/:id

刪除指定 RSVP。需 JWT。

### 請求

```
DELETE /api/admin/rsvp/3
```

### 回應

#### 204 No Content

（空回應主體）

#### 404 Not Found

```json
{
  "error": "NOT_FOUND",
  "message": "找不到指定的 RSVP 記錄"
}
```

---

## 前端整合說明

```typescript
// src/services/adminApi.ts
import axios from 'axios'

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// 自動附加 JWT
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 → 自動導向登入頁
adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export default adminApi
```
