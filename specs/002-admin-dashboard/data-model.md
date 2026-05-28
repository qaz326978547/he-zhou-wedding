# 資料模型：後台管理介面

**Feature**: `002-admin-dashboard`
**Date**: 2026-05-28

---

## 實體一覽

| 實體 | 儲存位置 | 說明 |
|------|----------|------|
| AdminSession | 無（JWT 無狀態） | 主辦人登入憑證；JWT 儲存於前端 localStorage |
| RSVPSubmission | PostgreSQL（既有） | 複用現有 schema，後台新增 PUT / DELETE 操作 |
| AdminCredentials | 後端環境變數 | 帳號密碼對；不持久化至資料庫 |

---

## AdminSession（JWT Payload）

JWT 由後端簽發，前端儲存於 `localStorage`（key: `admin_token`）。

### JWT Payload 結構

```json
{
  "username": "bean",
  "iat": 1748400000,
  "exp": 1748486400
}
```

| 欄位 | 型別 | 說明 |
|------|------|------|
| `username` | string | 登入帳號（`bean` 或 `zhou`） |
| `iat` | number | 簽發時間（Unix timestamp） |
| `exp` | number | 過期時間（iat + 86400 秒 = 24 小時） |

### 簽名規格

| 項目 | 值 |
|------|-----|
| 演算法 | HS256 |
| Secret | `process.env.JWT_SECRET`（至少 32 字元隨機字串） |
| 有效期 | 24 小時 |

---

## AdminCredentials（環境變數）

```
ADMIN_CREDENTIALS={"bean":"bean","zhou":"zhou"}
```

- key：帳號名稱；value：明文密碼（v1）
- 後端以 `JSON.parse(process.env.ADMIN_CREDENTIALS)` 解析
- 驗證邏輯：`credentials[username] === password`

---

## RSVPSubmission（既有，無需變更 Schema）

後台新增以下操作，全部需 JWT 驗證：

| 操作 | 說明 |
|------|------|
| 查詢全部 | `prisma.rSVPSubmission.findMany({ orderBy: { createdAt: 'desc' } })` |
| 新增 | `prisma.rSVPSubmission.create()`，執行相同 Zod 驗證規則 |
| 修改 | `prisma.rSVPSubmission.update({ where: { id } })`，部分欄位可修改 |
| 刪除 | `prisma.rSVPSubmission.delete({ where: { id } })` |

### 新增 / 修改欄位允許範圍

| 欄位 | 新增 | 修改 | 驗證規則 |
|------|------|------|----------|
| `name` | ✅ 必填 | ✅ | 最少 1 字元 |
| `phone` | ✅ 必填 | ✅ | 台灣電話格式；唯一性驗證（Prisma P2002） |
| `attending` | ✅ 必填 | ✅ | boolean |
| `guestCount` | ✅ 必填 | ✅ | attending=true 時 1–10；false 時 0 |
| `relationshipSide` | ✅ 選填 | ✅ | `groom` / `bride` / null |
| `relationshipType` | ✅ 選填 | ✅ | `relative` / `friend` / null；需 relationshipSide |
| `dietaryPreference` | ✅ 選填 | ✅ | 五選一 enum，預設 `regular` |
| `notes` | ✅ 選填 | ✅ | 最多 300 字元 |
| `notificationEmailSent` | ❌ | ✅ | boolean（主辦人可手動標記） |

---

## 狀態轉換

### 前端登入狀態

```
未登入
  │
  ├─[POST /api/admin/login 成功]──► 已登入
  │                                  │ localStorage: admin_token = JWT
  │                                  │
  │                         [登出 / token 過期]
  │                                  │
  └─◄────────────────────────────── 未登入（清除 localStorage）
```

### 後台 API 請求流程

```
前端請求
  │
  ├─[Authorization: Bearer <token>]
  │
  ├─[adminAuth middleware]
  │   ├─[token 無效 / 過期]──► 401 Unauthorized
  │   └─[token 有效]──► controller 處理
  │
  └─[controller 回應 200 / 201 / 204 / 400 / 404 / 409 / 500]
```
