# 實作計畫：紅包登記功能

**Branch**: `004-red-envelope-tracking` | **Date**: 2026-07-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/004-red-envelope-tracking/spec.md`

## 摘要

新增賓客端頁面 `/qr`（`frontend/src/views/QRcode.vue`），讓賓客登記姓名與紅包金額並送出至後端。
新增後台頁面 `/admin/red-envelope`（掛載於既有 `/admin` JWT 驗證機制下），顯示所有登記紀錄、總筆數與總金額，支援 inline 修改／刪除，並可匯出 CSV（UTF-8 BOM，Excel 相容，比照既有 RSVP 匯出模式）。
資料庫新增獨立資料表 `RedEnvelopeEntry`，不與 `RSVPSubmission` 關聯。完全沿用既有技術棧與既有後台身份驗證架構，不新增任何套件依賴。

---

## 技術環境

**Language/Version**: TypeScript 5.x；Node.js 20 LTS（同既有，不變更）
**Primary Dependencies（新增）**: 無；沿用既有 `express`、`zod`、`@prisma/client`、`express-rate-limit`、`jsonwebtoken`、`axios`、`vue-router@4`
**Storage**: PostgreSQL（既有），新增資料表 `RedEnvelopeEntry`
**Testing**: 無自動化測試（v1 同既有，手動驗證）
**Target Platform**: Zeabur（同既有）
**Performance Goals**: 後端 API 回應 < 500ms；後台列表一次全量載入（預期 < 300 筆）
**Constraints**: 金額 MUST 為正整數（新台幣）；姓名長度上限 50 字元
**Scale/Scope**: 140–180 位賓客規模（同 001 spec 假設），紅包登記筆數預估與賓客數同量級

---

## 憲章合規檢查（Constitution Check）

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 語言一致性 | ✅ 通過 | spec/plan/tasks/API 文件使用繁體中文；程式碼識別碼使用英文 |
| II. 全端 Monorepo 架構 | ✅ 通過 | 沿用 `frontend/` + `backend/` 結構；不新增子專案 |
| III. API 設計規範 | ✅ 通過 | 新路由統一掛在 `/api` 前綴（公開：`/api/red-envelope`；後台：`/api/admin/red-envelope`）；RESTful；CORS 沿用既有設定 |
| IV. 漸進式規格工作流 | ✅ 通過 | 已完成 specify（含 clarify）→ plan；待 tasks → analyze → implement |
| V. 模組化與最小化原則 | ✅ 通過 | 新增獨立 controller/routes/validation/view 檔案；既有檔案僅最小化修改（`schema.prisma`、`router/index.ts`、`admin.ts` 路由檔） |
| VI. 文件同步原則 | ✅ 通過 | 本次同步建立 spec/plan/research/data-model/contracts/quickstart；後續欄位或流程異動須同步更新對應文件 |

---

## 專案結構

### 規格文件（此 feature）

```text
specs/004-red-envelope-tracking/
├── plan.md              # 本文件
├── research.md          # Phase 0 研究記錄
├── data-model.md        # Phase 1 資料模型
├── quickstart.md        # Phase 1 本地開發入門
├── contracts/
│   └── api.md           # Phase 1 API 合約
└── tasks.md             # Phase 2 產出（/speckit-tasks）
```

### 原始碼新增／修改路徑

```text
backend/
├── prisma/
│   └── schema.prisma                       # 新增 model RedEnvelopeEntry（修改既有檔案）
└── src/
    ├── routes/
    │   ├── redEnvelope.ts                  # POST /api/red-envelope（新增，公開路由）
    │   └── admin.ts                        # 新增 GET/PUT/DELETE /red-envelope 路由（修改既有檔案）
    ├── controllers/
    │   ├── redEnvelopeController.ts        # 賓客提交（新增）
    │   └── adminController.ts              # 新增 listRedEnvelope/updateRedEnvelope/deleteRedEnvelope（修改既有檔案）
    ├── validation/
    │   └── redEnvelopeSchema.ts            # Zod schema：guest 提交 + admin 修改（新增）
    └── app.ts                              # 新增 import redEnvelopeRouter + app.use('/api', redEnvelopeRouter)（修改既有檔案）

frontend/
└── src/
    ├── views/
    │   ├── QRcode.vue                      # 賓客端登記頁（既有空殼檔案，本次補完實作）
    │   └── admin/
    │       └── AdminRedEnvelope.vue        # 後台紅包列表／統計／匯出頁（新增）
    ├── router/
    │   └── index.ts                        # 新增 /admin/red-envelope 路由（修改既有檔案，/qr 路由已存在）
    └── views/admin/AdminDashboard.vue      # 新增前往「紅包登記」頁面的導覽連結（修改既有檔案，最小化）
```

**結構決策**：沿用既有 Option 2（Web application）monorepo 結構；不新增任何頂層目錄，僅在既有 `backend/src/*` 與 `frontend/src/*` 子目錄下新增檔案。

---

## 實作規格補充

### Prisma model（新增，獨立資料表）

```prisma
model RedEnvelopeEntry {
  id        Int      @id @default(autoincrement())
  name      String
  amount    Int
  createdAt DateTime @default(now())
}
```

### 後端公開路由（賓客提交）

```typescript
// backend/src/routes/redEnvelope.ts
router.post('/red-envelope', rsvpRateLimiter, submitRedEnvelope)
```

沿用既有 `rsvpRateLimiter`（每 IP 每小時 5 次），比照 RSVP 表單的基本濫用防護，不新增獨立 rate limiter。

### 後端 admin 路由（修改 `admin.ts`，沿用 `adminAuth` middleware）

```typescript
router.get('/red-envelope', adminAuth, listRedEnvelope)
router.put('/red-envelope/:id', adminAuth, updateRedEnvelope)
router.delete('/red-envelope/:id', adminAuth, deleteRedEnvelope)
```

不提供 admin 新增 API（v1 僅賓客端可新增，符合 spec Out of Scope）。

### Zod 驗證規則

```typescript
// backend/src/validation/redEnvelopeSchema.ts
export const redEnvelopeSchema = z.object({
  name: z.string().trim().min(1, '請輸入姓名').max(50, '姓名過長'),
  amount: z.number().int().positive('金額須為正整數'),
})
```

賓客提交與後台修改共用同一組驗證規則。

### 前端 QRcode.vue（賓客端）

- 表單欄位：姓名（text input）、金額（number input）
- 送出呼叫 `api.post('/api/red-envelope', { name, amount })`
- 成功：顯示感謝訊息，2 秒後或按鈕觸發清空表單以便下一位登記
- 失敗：顯示錯誤訊息（400 顯示驗證錯誤內容；429 顯示「提交過於頻繁，請稍後再試」；其他顯示通用錯誤並保留已填內容）

### 前端 AdminRedEnvelope.vue（後台）

- 初始化呼叫 `GET /api/admin/red-envelope`（使用既有 `adminApi` axios 實例，自動帶 JWT 並處理 401）
- 列表上方顯示：總筆數、總金額（前端 computed 加總，無需額外 API，比照 002-admin-dashboard FR-A005 模式）
- Inline 編輯（比照 `AdminDashboard.vue` 既有模式）：點「修改」→ 姓名/金額變為 input → 「儲存」呼叫 `PUT /api/admin/red-envelope/:id` → 成功後恢復文字並更新總金額
- 刪除：`window.confirm()` 確認 → `DELETE /api/admin/red-envelope/:id` → 成功後從列表移除並重算總金額
- 匯出 CSV：比照 `AdminDashboard.vue` 既有 `exportCsv()` 邏輯（純前端，UTF-8 BOM，欄位：編號、姓名、金額、登記時間，末段附總筆數／總金額統計），檔名 `紅包登記_YYYYMMDD.csv`
- RWD：手機（< 768px）卡片佈局，桌機（≥ 768px）表格佈局，比照既有 `AdminDashboard.vue` 規範

### 前端路由（修改 `frontend/src/router/index.ts`）

```typescript
{
  path: '/admin/red-envelope',
  component: () => import('../views/admin/AdminRedEnvelope.vue'),
},
```

既有 `beforeEach` navigation guard 判斷條件為 `to.path.startsWith('/admin')`，`/admin/red-envelope` 自動被保護，不需修改 guard 邏輯。`/qr` 路由已存在於 `router/index.ts`，本次不需新增，僅需補完 `QRcode.vue` 內容。
