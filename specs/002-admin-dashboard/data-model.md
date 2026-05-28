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

## RSVPSubmission（RSVP v2 後更新）

> Schema 已於 RSVP v2 重構（migration `20260529000001_add_highchair_count`）：移除 `guestCount`、`notes`；新增人數、兒童椅、紙本喜帖相關欄位。

後台新增以下操作，全部需 JWT 驗證：

| 操作 | 說明 |
|------|------|
| 查詢全部 | `prisma.rSVPSubmission.findMany({ orderBy: { createdAt: 'desc' } })` |
| 新增 | `prisma.rSVPSubmission.create()`，使用 `adminCreateRsvpSchema`（attending 後端注入 true） |
| 修改 | `prisma.rSVPSubmission.update({ where: { id } })`，使用 `adminRsvpSchema`（所有欄位 Partial） |
| 刪除 | `prisma.rSVPSubmission.delete({ where: { id } })` |

### RSVP v2 欄位一覽

| 欄位 | 型別 | 新增（POST） | 修改（PUT） | 驗證規則 |
|------|------|-------------|-------------|----------|
| `name` | String | ✅ 必填 | ✅ | 最少 1 字元 |
| `phone` | String | ✅ 必填 | ✅ | 台灣手機（09 開頭）或市話格式；唯一性驗證（Prisma P2002） |
| `attending` | Boolean | ❌ 後端注入 true | ✅ | 後台 POST 固定為 true；PUT 可修改 |
| `adultCount` | Int? | ✅ 選填 | ✅ | 1–10；**null 表示人數待確認**（admin 路由允許；前台路由出席時必填） |
| `childCount` | Int? | ✅ 選填 | ✅ | 0–10；預設 0 |
| `needsHighchair` | Boolean? | ✅ 選填 | ✅ | childCount > 0 時有意義；null 表示未確認 |
| `highchairCount` | Int? | ✅ 選填 | ✅ | 1–10；needsHighchair = true 時有意義 |
| `relationshipSide` | String? | ✅ 選填 | ✅ | `groom` / `bride` / null |
| `relationshipType` | String? | ✅ 選填 | ✅ | `relative` / `friend` / null；需先設定 relationshipSide |
| `dietaryPreference` | String | ✅ 選填 | ✅ | `regular` / `vegetarian` 兩選一；預設 `regular` |
| `needsInvitation` | Boolean | ✅ 選填 | ✅ | 預設 false |
| `invitationName` | String? | ✅ 選填 | ✅ | needsInvitation = true 時有意義 |
| `invitationPhone` | String? | ✅ 選填 | ✅ | needsInvitation = true 時有意義 |
| `invitationAddress` | String? | ✅ 選填 | ✅ | needsInvitation = true 時有意義 |
| `notificationEmailSent` | Boolean | ❌ | ✅ | 主辦人可手動標記；預設 false |

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
