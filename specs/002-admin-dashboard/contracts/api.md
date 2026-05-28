# API 合約文件：後台管理介面

**Feature**: `002-admin-dashboard`
**Date**: 2026-05-29（RSVP v2 欄位更新）
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
      "adultCount": 2,
      "childCount": 1,
      "needsHighchair": true,
      "highchairCount": 1,
      "relationshipSide": "groom",
      "relationshipType": "friend",
      "dietaryPreference": "regular",
      "needsInvitation": false,
      "invitationName": null,
      "invitationPhone": null,
      "invitationAddress": null,
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

新增 RSVP 資料。需 JWT。使用 `adminCreateRsvpSchema`（非前台 schema）：`attending` 欄位不需傳入（後端固定為 `true`）；`adultCount` 可為 null（表示人數待確認）；不含 RSVP 前台所需的強制人數驗證。

### 請求

```json
{
  "name": "李小華",
  "phone": "0987654321",
  "adultCount": 2,
  "childCount": 1,
  "needsHighchair": true,
  "highchairCount": 1,
  "relationshipSide": "bride",
  "relationshipType": "relative",
  "dietaryPreference": "vegetarian",
  "needsInvitation": true,
  "invitationName": "李小華",
  "invitationPhone": "0987654321",
  "invitationAddress": "台北市中正區忠孝東路一段1號"
}
```

**欄位說明：**

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| name | string | ✅ | 賓客姓名 |
| phone | string | ✅ | 台灣手機（09開頭）或市話格式 |
| adultCount | number \| null | — | 大人人數（1–10）；null 表示待確認 |
| childCount | number | — | 小孩人數（0–10）；預設 0 |
| needsHighchair | boolean \| null | — | 是否需要兒童椅；childCount > 0 時有意義 |
| highchairCount | number \| null | — | 兒童椅張數（1–10）；needsHighchair = true 時有意義 |
| relationshipSide | "groom" \| "bride" | — | 賓桌歸屬 |
| relationshipType | "relative" \| "friend" | — | 關係類型；需先設定 relationshipSide |
| dietaryPreference | "regular" \| "vegetarian" | — | 飲食偏好；預設 "regular" |
| needsInvitation | boolean | — | 是否需要紙本喜帖；預設 false |
| invitationName | string | — | 收件人姓名；needsInvitation = true 時有意義 |
| invitationPhone | string | — | 收件人電話；needsInvitation = true 時有意義 |
| invitationAddress | string | — | 收件地址；needsInvitation = true 時有意義 |

### 回應

#### 201 Created

回傳完整 RSVPSubmission 物件：

```json
{
  "data": {
    "id": 3,
    "name": "李小華",
    "phone": "0987654321",
    "attending": true,
    "adultCount": 2,
    "childCount": 1,
    "needsHighchair": true,
    "highchairCount": 1,
    "relationshipSide": "bride",
    "relationshipType": "relative",
    "dietaryPreference": "vegetarian",
    "needsInvitation": true,
    "invitationName": "李小華",
    "invitationPhone": "0987654321",
    "invitationAddress": "台北市中正區忠孝東路一段1號",
    "notificationEmailSent": false,
    "notificationEmailSentAt": null,
    "notificationEmailError": null,
    "createdAt": "2026-05-29T10:00:00.000Z"
  }
}
```

#### 400 — 驗證失敗

```json
{
  "error": "VALIDATION_ERROR",
  "message": "請輸入台灣手機（09 開頭）或市話格式",
  "details": [{ "path": ["phone"], "message": "請輸入台灣手機（09 開頭）或市話格式" }]
}
```

#### 409 — 電話號碼重複

```json
{
  "error": "DUPLICATE_PHONE",
  "message": "此電話號碼已登記"
}
```

---

## PUT /api/admin/rsvp/:id

修改指定 RSVP。需 JWT。所有欄位均為選填（Partial update）；僅傳入需變更的欄位。

### 請求

```
PUT /api/admin/rsvp/3
```

```json
{
  "adultCount": 3,
  "childCount": 0,
  "needsHighchair": null,
  "highchairCount": null,
  "needsInvitation": false,
  "invitationName": null,
  "invitationPhone": null,
  "invitationAddress": null
}
```

可更新欄位：`name`、`phone`、`attending`、`adultCount`、`childCount`、`needsHighchair`、`highchairCount`、`relationshipSide`、`relationshipType`、`dietaryPreference`（"regular" | "vegetarian"）、`needsInvitation`、`invitationName`、`invitationPhone`、`invitationAddress`

### 回應

#### 200 OK — 回傳完整更新後的 RSVPSubmission 物件

```json
{
  "data": {
    "id": 3,
    "name": "李小華",
    "phone": "0987654321",
    "attending": true,
    "adultCount": 3,
    "childCount": 0,
    "needsHighchair": null,
    "highchairCount": null,
    "relationshipSide": "bride",
    "relationshipType": "relative",
    "dietaryPreference": "vegetarian",
    "needsInvitation": false,
    "invitationName": null,
    "invitationPhone": null,
    "invitationAddress": null,
    "notificationEmailSent": false,
    "notificationEmailSentAt": null,
    "notificationEmailError": null,
    "createdAt": "2026-05-29T10:00:00.000Z"
  }
}
```

#### 400 — 驗證失敗

```json
{ "error": "VALIDATION_ERROR", "details": [...] }
```

#### 404 Not Found

```json
{
  "error": "NOT_FOUND",
  "message": "找不到此 RSVP"
}
```

#### 409 — 電話號碼重複

```json
{
  "error": "DUPLICATE_PHONE",
  "message": "此電話號碼已登記"
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
