# API 合約文件：婚禮邀請網站 v1

**Feature**: `001-wedding-site-v1`
**Date**: 2026-05-17
**Base URL**: `https://api.hezhouwedding.com`
**API Prefix**: `/api`（所有路由統一使用）

---

## 通用設定

### 請求標頭

```
Content-Type: application/json
```

### 回應格式

所有回應均為 JSON 格式。

**成功回應結構**：
```json
{
  "data": { ... }
}
```

**錯誤回應結構**：
```json
{
  "error": "ERROR_CODE",
  "message": "人類可讀的錯誤訊息（繁體中文）"
}
```

### CORS 設定

| 設定項 | 值 |
|--------|-----|
| `Access-Control-Allow-Origin` | `https://hezhouwedding.com` |
| `Access-Control-Allow-Methods` | `GET, POST, OPTIONS` |
| `Access-Control-Allow-Headers` | `Content-Type` |

### 速率限制

RSVP 提交端點（`POST /api/rsvp`）實施 IP 速率限制：
- **限制**：每個 IP 每 1 小時最多提交 5 次
- **超過限制**：HTTP 429 + 回應標頭 `RateLimit-*`（standardHeaders: true）

---

## 端點列表

| Method | 路徑 | 說明 |
|--------|------|------|
| POST | `/api/rsvp` | 提交賓客 RSVP 回覆 |
| GET | `/api/rsvp/status` | 查詢 RSVP 開放狀態 |
| GET | `/api/health` | 服務健康檢查 |

---

## POST /api/rsvp

提交賓客 RSVP 回覆。若 `RSVP_ENABLED=false` 則拒絕所有新提交。

### 請求

```
POST /api/rsvp
Content-Type: application/json
```

**請求主體（Request Body）**：

```json
{
  "name": "王大明",
  "phone": "0912345678",
  "attending": true,
  "guestCount": 2,
  "relationshipSide": "groom",
  "relationshipType": "relative",
  "dietaryPreference": "no_beef",
  "notes": "需要輪椅座位，請安排靠走道桌位"
}
```

**欄位說明**：

| 欄位 | 型別 | 必填 | 驗證規則 |
|------|------|------|----------|
| `name` | string | ✅ | 最少 1 字元 |
| `phone` | string | ✅ | 台灣手機（`09` 開頭，10 碼）或市話（`0x` 8–9 碼）；regex: `/^09\d{8}$|^0[2-9]\d{7,8}$/` |
| `attending` | boolean | ✅ | `true`（出席）或 `false`（不克出席） |
| `guestCount` | integer | ✅（應用層） | `attending=true` 時範圍 1–10；`attending=false` 時固定為 `0` |
| `relationshipSide` | string \| null | ❌ | `"groom"` \| `"bride"` \| 省略 |
| `relationshipType` | string \| null | ❌ | `"relative"` \| `"friend"` \| 省略；若提供則 `relationshipSide` 不得為空 |
| `dietaryPreference` | string | ❌ | `"regular"` \| `"vegetarian"` \| `"no_beef"` \| `"no_pork"` \| `"other"`；預設 `"regular"` |
| `notes` | string \| null | ❌ | 最多 300 字元 |

### 回應

#### 201 Created — 成功

```json
{
  "data": {
    "id": 42,
    "message": "RSVP 已成功提交"
  }
}
```

#### 400 Bad Request — 驗證失敗

觸發條件：
- 必填欄位缺失或型別錯誤
- 電話號碼格式不符
- `attending=true` 且 `guestCount` 不在 1–10 範圍
- `relationshipType` 有值但 `relationshipSide` 為空

```json
{
  "error": "VALIDATION_ERROR",
  "message": "電話號碼格式錯誤，請輸入台灣手機（09 開頭）或市話格式",
  "fields": {
    "phone": "電話號碼格式錯誤"
  }
}
```

> `fields` 物件包含各欄位層級的錯誤訊息（可選，視前端需求）

#### 409 Conflict — 重複提交

```json
{
  "error": "DUPLICATE_PHONE",
  "message": "已收到您的回覆，感謝您！"
}
```

#### 422 Unprocessable Entity — RSVP 已關閉

觸發條件：後端環境變數 `RSVP_ENABLED=false`

```json
{
  "error": "RSVP_DISABLED",
  "message": "報名已截止"
}
```

#### 429 Too Many Requests — 速率限制

```json
{
  "error": "RATE_LIMITED",
  "message": "提交過於頻繁，請稍後再試"
}
```

#### 500 Internal Server Error — 伺服器錯誤

```json
{
  "error": "INTERNAL_ERROR",
  "message": "伺服器發生錯誤，請稍後再試"
}
```

---

## GET /api/rsvp/status

查詢 RSVP 目前是否開放提交（前端初始化時呼叫）。

### 請求

```
GET /api/rsvp/status
```

無請求主體。

### 回應

#### 200 OK

```json
{
  "data": {
    "enabled": true
  }
}
```

| 欄位 | 型別 | 說明 |
|------|------|------|
| `enabled` | boolean | `true` = RSVP 開放中；`false` = 報名已截止（`RSVP_ENABLED=false`） |

---

## GET /api/health

服務健康檢查，用於 Zeabur 部署監控。

### 請求

```
GET /api/health
```

無請求主體。

### 回應

#### 200 OK

```json
{
  "data": {
    "status": "ok"
  }
}
```

---

## 錯誤碼速查表

| 錯誤碼 | HTTP 狀態 | 觸發情境 |
|--------|-----------|----------|
| `VALIDATION_ERROR` | 400 | 輸入驗證失敗（欄位格式、範圍、相依性） |
| `DUPLICATE_PHONE` | 409 | 相同電話號碼已存在資料庫 |
| `RSVP_DISABLED` | 422 | `RSVP_ENABLED=false` |
| `RATE_LIMITED` | 429 | 超過 IP 速率限制（5 次/小時） |
| `INTERNAL_ERROR` | 500 | 資料庫連線失敗或未預期錯誤 |

---

## 前端整合說明

前端透過 `VITE_API_BASE_URL` 環境變數取得 API Base URL：

```typescript
// src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export default api
```

**RSVP 提交流程**：
1. 前端呼叫 `POST /api/rsvp`
2. 請求期間：提交按鈕 disabled + 顯示 loading
3. 201 → 切換至成功確認畫面（FR-012）
4. 409 → 顯示「已收到您的回覆」
5. 422 → 顯示「報名已截止」
6. 429 → 顯示「提交過於頻繁，請稍後再試」
7. 400/500 → 重新啟用按鈕 + 顯示錯誤訊息（不清空表單）
