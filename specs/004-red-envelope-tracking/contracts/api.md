# API 合約文件：紅包登記功能

**Feature**: `004-red-envelope-tracking`
**Date**: 2026-07-03
**Base URL**: `https://api.hezhouwedding.com`
**API Prefix**: `/api`（公開）／`/api/admin`（後台，需 JWT）

---

## 通用設定

### 請求標頭

```
Content-Type: application/json
```

後台 API MUST 攜帶：

```
Authorization: Bearer <JWT token>
```

（沿用 `002-admin-dashboard` 已簽發的 token，無需重新登入）

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
| `VALIDATION_ERROR` | 400 | 姓名為空或金額非正整數 |
| `UNAUTHORIZED` | 401 | 未攜帶 token 或 token 無效／過期 |
| `RATE_LIMITED` | 429 | 同一 IP 每小時提交超過 5 次 |
| `NOT_FOUND` | 404 | 指定 id 不存在 |
| `INTERNAL_ERROR` | 500 | 伺服器未預期錯誤 |

---

## POST /api/red-envelope

賓客提交紅包登記。**公開路由，無需登入**；掛載與 RSVP 相同的 IP rate limiter（每小時 5 次）。

### 請求

```json
{
  "name": "王大明",
  "amount": 3600
}
```

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| name | string | ✅ | 賓客姓名，trim 後 1–50 字元 |
| amount | number | ✅ | 紅包金額（新台幣），正整數 |

### 回應

#### 201 Created

```json
{
  "data": {
    "id": 1,
    "name": "王大明",
    "amount": 3600,
    "createdAt": "2026-07-03T10:00:00.000Z"
  }
}
```

#### 400 — 驗證失敗

```json
{
  "error": "VALIDATION_ERROR",
  "message": "金額須為正整數",
  "details": [{ "path": ["amount"], "message": "金額須為正整數" }]
}
```

#### 429 — 提交過於頻繁

```json
{
  "error": "RATE_LIMITED",
  "message": "提交過於頻繁，請稍後再試"
}
```

---

## GET /api/admin/red-envelope

查詢所有紅包登記紀錄，依 `createdAt` 降冪排序。需 JWT。

### 回應

#### 200 OK

```json
{
  "data": [
    {
      "id": 1,
      "name": "王大明",
      "amount": 3600,
      "createdAt": "2026-07-03T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "李小華",
      "amount": 1200,
      "createdAt": "2026-07-03T10:05:00.000Z"
    }
  ]
}
```

總筆數、總金額由前端依已載入的 `data` 陣列即時計算（比照 `002-admin-dashboard` FR-A005 模式），不需額外 API。

---

## PUT /api/admin/red-envelope/:id

修改指定紅包登記紀錄。需 JWT。

### 請求

```
PUT /api/admin/red-envelope/1
```

```json
{
  "name": "王大明",
  "amount": 3800
}
```

### 回應

#### 200 OK

```json
{
  "data": {
    "id": 1,
    "name": "王大明",
    "amount": 3800,
    "createdAt": "2026-07-03T10:00:00.000Z"
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
  "message": "找不到此紅包登記紀錄"
}
```

---

## DELETE /api/admin/red-envelope/:id

刪除指定紅包登記紀錄。需 JWT。

### 請求

```
DELETE /api/admin/red-envelope/1
```

### 回應

#### 204 No Content

（空回應主體）

#### 404 Not Found

```json
{
  "error": "NOT_FOUND",
  "message": "找不到此紅包登記紀錄"
}
```

---

## 匯出 Excel（前端純本地操作，無對應 API）

匯出功能比照 `002-admin-dashboard` FR-A011「匯出 CSV」模式：前端使用 `GET /api/admin/red-envelope` 已載入的列表資料，於瀏覽器端組出 CSV 字串（加 UTF-8 BOM）並觸發下載，**不新增後端匯出端點**。

檔案內容：

- 欄位標題列：編號、姓名、金額、登記時間
- 逐筆資料列
- 末段統計列：總筆數、總金額

檔名格式：`紅包登記_YYYYMMDD.csv`

---

## 前端整合說明

`/qr` 賓客端頁面沿用既有公開 `api` 實例（`frontend/src/services/api.ts`），呼叫方式與 RSVP 表單一致：

```typescript
import api from '@/services/api'

await api.post('/api/red-envelope', { name, amount })
```

後台頁面沿用既有 `adminApi` 實例（`frontend/src/services/adminApi.ts`，已處理 JWT 附加與 401 自動導向登入頁），呼叫方式：

```typescript
import adminApi from '@/services/adminApi'

const { data } = await adminApi.get('/api/admin/red-envelope')
await adminApi.put(`/api/admin/red-envelope/${id}`, { name, amount })
await adminApi.delete(`/api/admin/red-envelope/${id}`)
```
