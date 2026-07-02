# Tasks: 紅包登記功能

**Input**: Design documents from `specs/004-red-envelope-tracking/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/api.md ✅ quickstart.md ✅

**User Stories**:
- **US1** (P1)：賓客端登記紅包（`/qr` 頁面填寫姓名/金額並送出）
- **US2** (P2)：主辦人查看、管理紅包列表與總計（後台列表、統計、inline 編輯、刪除）
- **US3** (P3)：主辦人匯出 Excel（前端 CSV + UTF-8 BOM）

**Format**: `- [ ] [TaskID] [P?] [Story?] 說明（含檔案路徑）`
- **[P]**: 可平行執行（不同檔案，無未完成相依）
- **[US1]/[US2]/[US3]**: 任務所屬 User Story

---

## Phase 1：Setup（資料庫準備）

**Purpose**: 建立本 feature 所需的資料表，無新增套件依賴

- [X] T001 於 `backend/prisma/schema.prisma` 新增 `RedEnvelopeEntry` model（`id Int @id @default(autoincrement())`、`name String`、`amount Int`、`createdAt DateTime @default(now())`）
- [X] T002 執行 migration：`cd backend && npx prisma migrate dev --name add_red_envelope_entry`（T002 依賴 T001）

**Checkpoint**: `RedEnvelopeEntry` 資料表已建立，`npx prisma studio` 可見空表

---

## Phase 2：Foundational（共用驗證邏輯與路由骨架）

**Purpose**: 建立 US1、US2 共用的驗證規則與路由掛載；本階段完成前不得開始任何 User Story 實作

**⚠️ CRITICAL**: 本階段完成前，不得開始任何 User Story 實作

- [X] T003 [P] 建立 Zod schema 於 `backend/src/validation/redEnvelopeSchema.ts`（`redEnvelopeSchema = z.object({ name: z.string().trim().min(1).max(50), amount: z.number().int().positive() })`；賓客提交與後台修改共用同一組規則）
- [X] T004 [P] 建立公開路由檔 `backend/src/routes/redEnvelope.ts`（`POST /red-envelope` 掛載既有 `rsvpRateLimiter`；controller 先以 stub 函式 `res.status(201).json({ data: {} })` 佔位，待 Phase 3 補全）
- [X] T005 更新 `backend/src/app.ts`，新增 `import redEnvelopeRouter from './routes/redEnvelope'` 與 `app.use('/api', redEnvelopeRouter)`（T005 依賴 T004）
- [X] T006 [P] 更新 `backend/src/routes/admin.ts`，新增 `GET /red-envelope`、`PUT /red-envelope/:id`、`DELETE /red-envelope/:id` 三條路由，掛載既有 `adminAuth` middleware；controller 先以 stub 函式佔位，待 Phase 4 補全

**Checkpoint**: 後端可啟動；`POST /api/red-envelope` 與 `GET/PUT/DELETE /api/admin/red-envelope`（帶 token）均回傳 stub 回應，無 500 錯誤

---

## Phase 3：User Story 1 — 賓客端登記紅包（Priority: P1）🎯 MVP

**Goal**: 賓客在 `/qr` 頁面填寫姓名與紅包金額並送出，資料成功儲存至資料庫，並取得成功或錯誤回饋。

**Independent Test**: 開啟 `http://localhost:5173/qr`，填寫姓名「王大明」與金額「3600」送出，確認頁面顯示成功提示、表單清空；以 `npx prisma studio` 或後台 API 確認該筆資料已寫入；留空欄位或輸入 0/負數金額時顯示對應錯誤提示且不送出；連續送出超過 5 次/小時觸發 429 提示。

- [X] T007 [US1] 實作 `submitRedEnvelope` controller 於 `backend/src/controllers/redEnvelopeController.ts`（以 `redEnvelopeSchema` 驗證 `req.body` → 驗證失敗回傳 `{ error: 'VALIDATION_ERROR', details }` HTTP 400 → 驗證成功 `prisma.redEnvelopeEntry.create({ data: result.data })` → 回傳 `{ data: record }` HTTP 201）（T007 依賴 T003）
- [X] T008 [US1] 更新 `backend/src/routes/redEnvelope.ts`，將 T004 的 stub 替換為 T007 實作的 `submitRedEnvelope`（T008 依賴 T007）
- [X] T009 [P] [US1] 補完 `frontend/src/views/QRcode.vue`（表單欄位：姓名 text input、金額 number input **以 `v-model.number` 綁定（或送出前以 `Number(amount)` 轉換），確保送出的 `amount` 為 number 型別，符合後端 `z.number().int().positive()` 驗證**；前端基本驗證（姓名非空、金額為正整數）；送出呼叫 `api.post('/api/red-envelope', { name, amount })`；成功 → 顯示感謝訊息並清空表單以便下一位登記；400 → 於對應欄位顯示錯誤訊息；429 → 顯示「提交過於頻繁，請稍後再試」；其他錯誤 → 顯示通用錯誤並保留已填內容，允許重新送出）

**Checkpoint**: US1 Independent Test 完整通過；`RedEnvelopeEntry` 資料表出現對應紀錄

---

## Phase 4：User Story 2 — 主辦人查看、管理紅包列表與總計（Priority: P2）

**Goal**: 主辦人登入後台後可在新頁面看到所有登記紀錄、總筆數、總金額，並可 inline 修改或刪除紀錄。

**Independent Test**: 登入後台（`bean`/`bean`）並前往 `/admin/red-envelope`，確認列表顯示所有 `/qr` 送出的紀錄且總金額等於手動加總；修改某筆金額後總金額即時更新；刪除某筆後該筆從列表與總金額消失；未登入直接訪問路由會被導向登入頁。

- [X] T010 [US2] 於 `backend/src/controllers/adminController.ts` 新增三個函式（T010 依賴 T003）：
  - `listRedEnvelope`：`prisma.redEnvelopeEntry.findMany({ orderBy: { createdAt: 'desc' } })` → `{ data: [...] }`
  - `updateRedEnvelope`：以 `redEnvelopeSchema` 解析 body → `prisma.redEnvelopeEntry.update({ where: { id }, data: result.data })` → 回傳更新後物件；id 不存在（P2025）→ 404 `NOT_FOUND`
  - `deleteRedEnvelope`：`prisma.redEnvelopeEntry.delete({ where: { id } })`；id 不存在（P2025）→ 404；成功回傳 204
- [X] T011 [US2] 更新 `backend/src/routes/admin.ts`，將 T006 的 stub 替換為 T010 實作的正式 controller 函式（T011 依賴 T010）
- [X] T012 [P] [US2] 建立 `frontend/src/views/admin/AdminRedEnvelope.vue`：
  - **資料載入**：`onMounted` 呼叫 `adminApi.get('/api/admin/red-envelope')`，結果存入 `entries` reactive ref；失敗顯示「資料載入失敗，請重新整理頁面」錯誤提示
  - **統計摘要**：computed 計算總筆數與總金額（`entries` 加總），顯示於列表上方
  - **空狀態**：`entries` 為空時顯示「尚無紅包登記紀錄」，總金額顯示為 0
  - **Inline 編輯**：點「修改」→ 該列姓名/金額變為 `<input>`，顯示「儲存」「取消」；「儲存」呼叫 `adminApi.put('/api/admin/red-envelope/:id', { name, amount })`，成功後更新 `entries` 對應項目並恢復文字顯示；金額輸入非正整數時前端阻擋提交並提示
  - **刪除**：點「刪除」→ `window.confirm('確定刪除？')` → 確認後呼叫 `adminApi.delete('/api/admin/red-envelope/:id')`，成功從 `entries` 移除
  - **RWD**：手機（Tailwind `md:hidden`）卡片佈局，桌機（`hidden md:table`）表格佈局，操作按鈕觸控區域 ≥ 44×44px
- [X] T013 [US2] 於 `frontend/src/router/index.ts` 新增路由 `{ path: '/admin/red-envelope', component: () => import('../views/admin/AdminRedEnvelope.vue') }`（既有 `beforeEach` guard 依 `to.path.startsWith('/admin')` 自動保護，無需修改 guard 邏輯）（T013 依賴 T012）
- [X] T014 [P] [US2] 於 `frontend/src/views/admin/AdminDashboard.vue` 新增一個導覽連結／按鈕，使用 `<RouterLink to="/admin/red-envelope">`，讓主辦人可從既有 RSVP 後台頁面前往紅包登記頁面（最小化修改，僅新增連結，不變更既有版面邏輯）

**Checkpoint**: US2 Independent Test 完整通過；既有 RSVP 後台功能不受影響

---

## Phase 5：User Story 3 — 主辦人匯出 Excel（Priority: P3）

**Goal**: 主辦人在紅包登記頁面點擊「匯出 Excel」，下載包含所有登記紀錄與總計的 CSV 檔案，可用 Excel 正常開啟且中文不亂碼。

**Independent Test**: 在 `/admin/red-envelope` 點擊「匯出 Excel」，確認下載檔名為 `紅包登記_YYYYMMDD.csv`；以 Excel 開啟確認中文姓名正確顯示、欄位包含編號/姓名/金額/登記時間，末段統計筆數與金額與頁面顯示一致；無資料時仍可下載僅含標題與總計 0 的檔案。

- [X] T015 [US3] 於 `frontend/src/views/admin/AdminRedEnvelope.vue` 新增 `exportCsv()` 函式與「匯出 Excel」按鈕（比照 `AdminDashboard.vue` 既有 `exportCsv()` 邏輯：純前端由 `entries` 組出 CSV 字串，加 UTF-8 BOM `'﻿'`；欄位：編號、姓名、金額、登記時間（UTC+8）；末段附總筆數、總金額統計列；檔名 `紅包登記_YYYYMMDD.csv`；以 `Blob` + `<a download>` 觸發下載）（T015 依賴 T012）

**Checkpoint**: 三個 User Story 皆可獨立運作；匯出檔案內容與後台頁面顯示一致

---

## Phase 6：Polish & 部署確認

**Purpose**: 跨功能驗證、生產環境確認

- [X] T016 依照 `specs/004-red-envelope-tracking/quickstart.md` 執行本地驗證清單（賓客提交全流程、後台 CRUD 全流程、匯出驗證）
- [ ] T017 [P] 手動測試生產環境 `https://hezhouwedding.com/qr` 與 `https://hezhouwedding.com/admin/red-envelope` 完整流程；分別在手機（375px）與桌機（1440px）確認 RWD 佈局正確
- [X] T018 [P] 回歸測試：確認前台婚禮網站（`https://hezhouwedding.com`）與既有 `/admin`（RSVP 管理）功能完全不受影響

---

## Dependencies & Execution Order

### Phase 相依性

```
Phase 1 (Setup)
    └─► Phase 2 (Foundational) — 全部完成才能繼續
              └─► Phase 3 (US1, P1) 🎯 MVP
                        └─► Phase 4 (US2, P2)
                                  └─► Phase 5 (US3, P3)
                                            └─► Phase 6 (Polish)
```

### Phase 2 內部順序

```
T003 (redEnvelopeSchema) ─┐
T004 (public route stub) ─┤─ 可平行
T006 (admin route stub)  ─┘
T005 (app.ts 掛載)         ─ 依賴 T004
```

### Phase 3 內部順序

```
T007 (submitRedEnvelope controller) ─ 依賴 T003
T008 (路由替換 stub)                 ─ 依賴 T007
T009 (QRcode.vue)                    ─ 可與 T007/T008 平行進行（前後端獨立開發）
```

### Phase 4 內部順序

```
T010 (adminController 新增函式) ─ 依賴 T003
T011 (admin.ts 替換 stub)       ─ 依賴 T010
T012 (AdminRedEnvelope.vue)     ─ 可與 T010/T011 平行進行
T013 (router 新增路由)          ─ 依賴 T012
T014 (AdminDashboard.vue 連結)  ─ 可平行
```

---

## Parallel Execution Examples

### Phase 2 — 可平行啟動

```bash
Task: "T003 redEnvelopeSchema"
Task: "T004 建立 redEnvelope.ts 公開路由（stub）"
Task: "T006 admin.ts 新增紅包路由（stub）"
```

### Phase 3 US1 — 可平行啟動

```bash
Task: "T007 submitRedEnvelope controller"
Task: "T009 QRcode.vue 表單實作"
```

### Phase 4 US2 — 第一批可平行啟動

```bash
Task: "T010 adminController 新增 listRedEnvelope/updateRedEnvelope/deleteRedEnvelope"
Task: "T012 AdminRedEnvelope.vue"
Task: "T014 AdminDashboard.vue 導覽連結"
```

---

## Implementation Strategy

### MVP First（US1 Only）

1. 完成 Phase 1：Setup（資料表建立）
2. 完成 Phase 2：Foundational（**必須全部完成才能繼續**）
3. 完成 Phase 3：US1（賓客端登記可用）
4. **STOP & VALIDATE**：US1 Independent Test 通過後即可讓賓客開始於 `/qr` 登記
5. 繼續 Phase 4：US2（主辦人可查看與管理）

### Incremental Delivery

1. Phase 1 + Phase 2 → 基礎架構就緒
2. Phase 3 → 賓客端登記功能上線（MVP，可先讓現場開始收禮登記）
3. Phase 4 → 後台查看與管理功能上線
4. Phase 5 → 匯出 Excel 功能上線
5. Phase 6 → 生產環境驗證完成

---

## Notes

- **[P]** = 不同檔案、無未完成相依，可平行執行
- **[US1]/[US2]/[US3]** = 追溯至 `spec.md` 對應 User Story
- v1 無自動化測試，以手動瀏覽器測試驗證（同既有專案慣例）
- 每個任務完成後 commit，保持 commit 粒度小且清晰
- 後台身份驗證（`adminAuth`）、JWT 簽發、`adminApi` 前端實例、navigation guard 均為 `002-admin-dashboard` 既有實作，本 feature 直接複用，不重新實作
- CSV 匯出邏輯直接參考 `frontend/src/views/admin/AdminDashboard.vue` 既有 `exportCsv()` 函式的實作模式（UTF-8 BOM、Blob 下載）
