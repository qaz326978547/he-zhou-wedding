# 資料模型：婚禮邀請網站 v1

**Feature**: `001-wedding-site-v1`
**Date**: 2026-05-17

---

## 實體一覽

| 實體 | 儲存位置 | 說明 |
|------|----------|------|
| RSVPSubmission | PostgreSQL（Prisma） | 賓客出席回覆記錄 |
| WeddingConfig | 前端常數 / 環境變數 | 婚禮靜態資訊（日期、地點），v1 無資料庫儲存 |

---

## RSVPSubmission

### Prisma Schema

```prisma
model RSVPSubmission {
  id                      Int       @id @default(autoincrement())
  name                    String
  phone                   String    @unique
  attending               Boolean
  guestCount              Int       @default(0)
  relationshipSide        String?
  relationshipType        String?
  dietaryPreference       String    @default("regular")
  notes                   String?   @db.VarChar(300)
  notificationEmailSent   Boolean   @default(false)
  notificationEmailSentAt DateTime?
  notificationEmailError  String?
  createdAt               DateTime  @default(now())
}
```

### 欄位說明

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | Int | 系統生成 | 自動遞增主鍵；用於通知信 RSVP 編號 |
| `name` | String | ✅ | 賓客姓名；最小長度 1；無最大長度限制（DB 層） |
| `phone` | String (unique) | ✅ | 台灣電話；UNIQUE 約束用於重複偵測（FR-011） |
| `attending` | Boolean | ✅ | `true`=出席；`false`=不克出席 |
| `guestCount` | Int | ✅（應用層） | 出席人數；`attending=true` 時 1–10；`attending=false` 時固定為 0 |
| `relationshipSide` | String? | ❌ | 賓桌歸屬：`groom`（新郎方）、`bride`（新娘方）、`null`（未填） |
| `relationshipType` | String? | ❌ | 關係類型：`relative`（親屬）、`friend`（朋友）、`null`（未填）；僅在 `relationshipSide` 非空時有效 |
| `dietaryPreference` | String | ❌ | 飲食偏好；預設 `regular`；見枚舉值 |
| `notes` | String? | ❌ | 備註；最大 300 字元（`@db.VarChar(300)`）；見範例 |
| `notificationEmailSent` | Boolean | 系統管理 | 通知信是否發送成功；預設 `false` |
| `notificationEmailSentAt` | DateTime? | 系統管理 | 通知信發送成功時間 |
| `notificationEmailError` | String? | 系統管理 | 發送失敗時的錯誤訊息 |
| `createdAt` | DateTime | 系統生成 | 提交時間；`@default(now())`；台灣時區（UTC+8）於應用層轉換顯示 |

### 枚舉值

**`dietaryPreference`**：
| 值 | 顯示文字 |
|----|----------|
| `regular` | 一般 |
| `vegetarian` | 素食 |
| `no_beef` | 不吃牛肉 |
| `no_pork` | 不吃豬肉 |
| `other` | 其他 |

**`relationshipSide`**：
| 值 | 顯示文字 |
|----|----------|
| `groom` | 新郎方 |
| `bride` | 新娘方 |
| `null` | （未填寫） |

**`relationshipType`**：
| 值 | 顯示文字 |
|----|----------|
| `relative` | 親屬 |
| `friend` | 朋友 |
| `null` | （未填寫） |

---

## 應用層驗證規則

這些驗證在 Zod schema 中執行（後端），前端亦同步實作以提供即時回饋。

| 規則 | 層級 | 描述 |
|------|------|------|
| `name` 非空 | 前端 + 後端 | 最少 1 字元 |
| `phone` 格式驗證 | 前端 + 後端 | `/^09\d{8}$|^0[2-9]\d{7,8}$/`；手機 10 碼或市話 8–9 碼 |
| `attending=true` 時 `guestCount` 範圍 | 前端 + 後端 | `1 ≤ guestCount ≤ 10`；後端違反回 HTTP 400 |
| `attending=false` 時 `guestCount` 固定 | 前端 | 前端自動帶入 `0`，不顯示輸入欄位；後端接受 0 |
| `notes` 長度 | 前端（即時）+ 後端 | 最多 300 字元；超限前端阻止提交並顯示計數提示 |
| `relationshipType` 依賴 `relationshipSide` | 前端 UX + 後端 refine | 若 `relationshipType` 有值但 `relationshipSide` 為空 → 後端回 HTTP 400 |
| 重複電話偵測 | 後端（DB unique） | Prisma 拋出 `P2002`（unique constraint violation） → 後端回 HTTP 409 |

---

## 狀態轉換

```
初始（表單待填寫）
    │
    ├─[必填欄位填完，驗證通過]──► 可提交狀態
    │                              │
    │                     [按下提交]
    │                              │
    │                     提交中（按鈕 disabled）
    │                              │
    │              ┌───────────────┴───────────────┐
    │         [API 成功 201]                 [API 失敗 / 網路錯誤]
    │              │                               │
    │         成功確認畫面                    錯誤提示 + 按鈕重新啟用
    │         （session 持續）                （表單內容保留）
    │
    └─[頁面重新整理]──► 初始（表單待填寫）
```

**電子郵件狀態轉換（非同步，獨立追蹤）**：
```
RSVP 儲存成功
    │
    └─[非同步]──► 嘗試發送通知信
                      │
           ┌──────────┴──────────┐
      [成功]                 [失敗]
    notificationEmailSent=true   notificationEmailSent=false
    notificationEmailSentAt=now  notificationEmailError=錯誤訊息
```

---

## 索引策略

| 欄位 | 索引類型 | 理由 |
|------|----------|------|
| `phone` | UNIQUE | 重複提交偵測（FR-011）；Prisma `@unique` 自動建立 |
| `createdAt` | 無（v1） | 預估筆數 < 200，全表掃描已足夠；未來可加 B-tree index |

---

## WeddingConfig（靜態常數）

v1 婚禮靜態資訊以前端常數管理，無需資料庫儲存。

```typescript
// src/constants/wedding.ts
export const WEDDING = {
  date: '2026-11-14',
  time: '12:00',
  timezone: 'Asia/Taipei', // UTC+8
  countdownTarget: new Date('2026-11-14T04:00:00Z'), // 12:00 UTC+8 = 04:00 UTC
  venue: {
    name: '', // 部署前填入
    address: '', // 部署前填入
    googleMapsUrl: '', // 部署前填入
  },
  couple: {
    groom: 'HE Bean',
    bride: 'Katherine Zhou',
  },
  line: {
    url: 'https://line.me/R/ti/p/@516hdace',
    qrCodePath: '/assets/line/qr-code.png',
    description: '婚禮流程、座位資訊、當日通知將透過 LINE 官方帳號發布',
  },
} as const
```

---

## 備忘錄欄位範例（`notes`）

規格提供的範例說明（用於佔位文字）：
- 嬰兒椅需求
- 素食細節（例：不吃蛋奶）
- 輪椅空間
- 提前離席
- 停車需求
