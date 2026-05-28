# Tasks: 後台管理介面

**Input**: Design documents from `specs/002-admin-dashboard/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/api.md ✅ quickstart.md ✅

**User Stories**:
- **US1** (P1)：主辦人登入後台（JWT 認證、Session 保持、登出）
- **US2** (P2)：查看與管理 RSVP 資料（列表、統計、搜尋、新增 Modal、Inline 編輯、刪除、Mobile-First）

**Format**: `- [ ] [TaskID] [P?] [Story?] 說明（含檔案路徑）`
- **[P]**: 可平行執行（不同檔案，無未完成相依）
- **[US1]/[US2]**: 任務所屬 User Story

---

## Phase 1：Setup（套件安裝與環境準備）

**Purpose**: 安裝新相依套件、更新環境變數範本

- [x] T001 在 `backend/` 安裝新相依套件：`npm install jsonwebtoken && npm install --save-dev @types/jsonwebtoken`
- [x] T002 [P] 在 `frontend/` 安裝 Vue Router：`npm install vue-router@4`
- [x] T003 [P] 更新 `backend/.env.example`，新增 `JWT_SECRET=your-random-secret-at-least-32-chars` 與 `ADMIN_CREDENTIALS={"bean":"bean","zhou":"zhou"}` 兩個欄位
- [x] T003a [P] 更新 `backend/prisma/schema.prisma` 至 RSVP v2：移除 `guestCount`、`notes` 欄位；新增 `adultCount Int?`、`childCount Int?`、`needsHighchair Boolean?`、`highchairCount Int?`、`needsInvitation Boolean @default(false)`、`invitationName String?`、`invitationPhone String?`、`invitationAddress String?`；執行對應 migration（`20260529000001_add_highchair_count`）；後台 admin 路由允許 adultCount 為 null，公開前台驗證規則不變

**Checkpoint**: `backend/node_modules/jsonwebtoken` 與 `frontend/node_modules/vue-router` 均存在；`.env.example` 包含新欄位

---

## Phase 2：Foundational（阻塞性前置基礎）

**Purpose**: 後端 JWT middleware、前端 Router + adminApi；所有 User Story 均依賴本階段完成

**⚠️ CRITICAL**: 本階段完成前，不得開始任何 User Story 實作

- [x] T004 實作 JWT 驗證 middleware 於 `backend/src/middleware/adminAuth.ts`（讀取 `Authorization: Bearer <token>` header；以 `process.env.JWT_SECRET` 驗證 HS256 JWT；token 無效或過期時回傳 `{ error: 'UNAUTHORIZED', message: '請先登入' }` HTTP 401；驗證通過則呼叫 `next()`）
- [x] T005 [P] 建立 Vue Router 於 `frontend/src/router/index.ts`（`createWebHistory()`；三條路由：`/`→`App.vue` 現有根元件、`/admin`→`AdminDashboard.vue`、`/admin/login`→`AdminLogin.vue`；navigation guard：`/admin/*` 路由在 `localStorage.admin_token` 不存在時自動導向 `/admin/login`）
- [x] T006 [P] 建立 adminApi Axios 實例於 `frontend/src/services/adminApi.ts`（`baseURL: import.meta.env.VITE_API_BASE_URL`；request interceptor：自動附加 `Authorization: Bearer <token>`；response interceptor：收到 401 時清除 `localStorage.admin_token` 並 `window.location.href = '/admin/login'`）
- [x] T007 建立 `frontend/src/Root.vue`（僅包含 `<RouterView />`，作為 SPA 的 Router outlet），並更新 `frontend/src/main.ts`：掛載目標從 `App.vue` 改為 `Root.vue`，加入 `import router from './router'` 與 `app.use(router)`；`App.vue` 改為路由 `/` 的頁面元件（C3 追蹤補充，T007 依賴 T005 完成）

**Checkpoint**: 後端可啟動；前端可啟動，訪問 `http://localhost:5173/admin` 被導向 `/admin/login`（空白頁，無元件錯誤）

---

## Phase 3：User Story 1 — 主辦人登入後台（Priority: P1）🎯 MVP

**Goal**: 主辦人可透過 `/admin/login` 以 bean/bean 或 zhou/zhou 登入，成功後進入後台首頁；直接訪問 `/admin` 未登入時自動導向登入頁；支援登出。

**Independent Test**: 前往 `http://localhost:5173/admin` 確認導向登入頁；輸入 `bean/bean` 登入，確認跳轉至 `/admin`（AdminDashboard 空殼）；重新整理確認 session 保持；點擊登出確認回到登入頁；輸入錯誤帳密確認顯示錯誤訊息。

- [x] T008 [P] [US1] 實作 admin login controller 於 `backend/src/controllers/adminController.ts`（`loginAdmin` 函式：讀取並 `JSON.parse(process.env.ADMIN_CREDENTIALS!)`；比對 `credentials[username] === password`；不符合回傳 HTTP 401 `INVALID_CREDENTIALS`；符合則以 `jwt.sign({ username }, process.env.JWT_SECRET!, { expiresIn: '24h' })` 簽發 token，回傳 `{ data: { token, username } }` HTTP 200）
- [x] T009 [P] [US1] 建立 admin 路由檔案 `backend/src/routes/admin.ts`（`POST /login` → `loginAdmin`，不掛 adminAuth；`GET /rsvp`、`POST /rsvp`、`PUT /rsvp/:id`、`DELETE /rsvp/:id` 先以 `adminAuth` middleware 保護，controller 函式佔位 stub 回傳 `{ data: {} }` HTTP 200，待 Phase 4 補全）
- [x] T010 [US1] 更新 `backend/src/app.ts`，在 `app.use('/api', apiRouter)` 之後新增 `import adminRouter from './routes/admin'` 與 `app.use('/api/admin', adminRouter)`（T010 依賴 T009 完成）
- [x] T011 [P] [US1] 建立 `frontend/src/views/admin/AdminLogin.vue`（登入表單：username input、password input、登入按鈕；點擊登入呼叫 `adminApi.post('/api/admin/login', { username, password })`；成功 → 將 token 存入 `localStorage.admin_token`，`router.push('/admin')`；失敗 → 顯示「帳號或密碼錯誤」錯誤訊息；按鈕提交中顯示 disabled + 載入文字；樣式簡潔置中，支援手機版）

**Checkpoint**: US1 Independent Test 完整通過；`POST /api/admin/login` 以無效 token 呼叫 `/api/admin/rsvp` 回傳 401

---

## Phase 4：User Story 2 — 查看與管理 RSVP 資料（Priority: P2）

**Goal**: 主辦人登入後可查看所有 RSVP（含統計摘要、搜尋）；新增（Modal 彈窗）、Inline 編輯、刪除；手機卡片佈局、桌機表格佈局。

**Independent Test**: 登入後台，確認列表顯示全部 RSVP；統計摘要出席人數正確；搜尋輸入姓名 / 電話可即時篩選；點「新增」開啟 Modal 填寫後送出，確認新資料出現；點「修改」進入 inline 編輯，儲存確認更新；點「刪除」確認後消失；手機（375px）以卡片呈現，桌機（1440px）以表格呈現。

- [x] T012 [P] [US2] 建立 admin Zod schema 於 `backend/src/validation/adminRsvpSchema.ts`：`adminCreateRsvpSchema`（POST 用，name/phone 必填，adultCount 可 null，不含出席強制驗證，attending 固定由後端注入）與 `adminRsvpSchema`（PUT 用，所有欄位選填 Partial）；兩者均包含電話格式驗證、adultCount/childCount 範圍（1–10 / 0–10）、highchairCount 範圍（1–10）、relationshipType 依賴 relationshipSide 的驗證邏輯；飲食偏好限 "regular" | "vegetarian"；支援 needsInvitation 相關欄位
- [x] T013 [P] [US2] 建立新增 RSVP Modal 元件於 `frontend/src/components/admin/RsvpModal.vue`（props：`visible: boolean`、`emit: close / saved`；表單欄位：name、phone、adultCount（可留空=null，顯示「待確認」）、childCount（預設 0）、needsHighchair（childCount > 0 時顯示）、highchairCount（needsHighchair = true 時顯示，1–10 張）、relationshipSide、relationshipType、dietaryPreference（葷食/素食）、needsInvitation、invitationName/invitationPhone/invitationAddress（needsInvitation = true 時顯示）；**attending 欄位不顯示，後端固定注入 true**；送出呼叫 `adminApi.post('/api/admin/rsvp', payload)`；成功 emit `saved(newRecord)` 並由父元件關閉 Modal；失敗在 Modal 內顯示錯誤訊息；點擊 Modal 外部或「取消」emit `close`；支援手機版全寬顯示）
- [x] T014 [US2] 補全 admin RSVP controller 函式於 `backend/src/controllers/adminController.ts`（T014 依賴 T012 完成）：
  - `listRsvp`：`prisma.rSVPSubmission.findMany({ orderBy: { createdAt: 'desc' } })` → `{ data: [...] }`
  - `createRsvp`：以 `adminCreateRsvpSchema`（不含前台強制出席驗證）解析 body → `prisma.rSVPSubmission.create({ data: { attending: true, ...result.data } })` → 回傳完整 RSVPSubmission 物件 → 201；P2002 → 409
  - `updateRsvp`：以 `adminRsvpSchema`（partial）解析 body → `prisma.rSVPSubmission.update({ where: { id }, data: result.data })` → 回傳完整更新後物件；id 不存在 → 404；P2002 → 409
  - `deleteRsvp`：`prisma.rSVPSubmission.delete({ where: { id } })`；id 不存在 → 404 → 成功回傳 204
- [x] T015 [US2] 更新 `backend/src/routes/admin.ts`，將 Phase 3 的 stub 函式替換為 T014 實作的正式 controller 函式（`listRsvp`、`createRsvp`、`updateRsvp`、`deleteRsvp`）（T015 依賴 T014 完成）
- [x] T016 [US2] 建立 `frontend/src/views/admin/AdminDashboard.vue`（T016 依賴 T013 完成）：
  - **資料載入**：`onMounted` 呼叫 `adminApi.get('/api/admin/rsvp')`，結果存入 `rsvpList` reactive ref；API 失敗時設 `loadError=true`，顯示「資料載入失敗，請重新整理頁面」錯誤 banner，搜尋框與「新增 RSVP」按鈕仍保持可用（C4 追蹤補充）
  - **統計摘要**：computed 計算**總回覆筆數**（所有記錄數）與**總出席人數**（adultCount + childCount 加總，null 視為 0），顯示於列表上方兩格卡片；**不顯示出席筆數 / 不克出席筆數**（attending 欄位隱藏）
  - **即時搜尋**：搜尋 input，computed `filteredList` 依姓名或電話 keyword 篩選；無結果顯示「找不到符合的紀錄」
  - **RWD 佈局**：
    - 手機（Tailwind `md:hidden`）：每筆 RSVP 以卡片呈現（姓名、電話、大人幾位 / 小孩幾位（null 顯示「--」）、兒童椅（需要 N 張 / 不需要）、賓桌歸屬、關係類型、飲食偏好、紙本喜帖（needsInvitation + 收件資訊）、提交時間 UTC+8、通知信狀態）；**不顯示出席狀態、不顯示備註**；卡片底部「修改」「刪除」按鈕，觸控區域 ≥ 44px
    - 桌機（Tailwind `hidden md:table`）：完整 `<table>`，所有欄位一覽
  - **Inline 編輯**：點「修改」→ 該列（或卡片）各欄位切換為 `<input>`/`<select>`，顯示「儲存」「取消」；「儲存」呼叫 `adminApi.put('/api/admin/rsvp/:id', payload)`，成功更新 `rsvpList` 對應項目；「取消」回復原始值；操作中按鈕 disabled
  - **刪除**：點「刪除」→ `window.confirm('確定刪除？')` → 確認後呼叫 `adminApi.delete('/api/admin/rsvp/:id')`，成功從 `rsvpList` 移除
  - **新增 Modal**：「新增 RSVP」按鈕控制 `showModal: boolean`；`<RsvpModal>` 接收 `visible` prop；收到 `saved` event 時將新資料插入 `rsvpList` 頂端並重算統計；收到 `close` 時關閉 Modal
  - **登出**：「登出」按鈕清除 `localStorage.admin_token` → `router.push('/admin/login')`
  - **CSV 匯出**（FR-A011）：「匯出 CSV」按鈕以 `rsvpList`（完整列表，非 filteredList）為資料源，純前端產生；UTF-8 BOM 確保 Excel 正確顯示中文；欄位：編號、姓名、電話、大人幾位、小孩幾位、兒童椅（含張數）、賓桌歸屬、關係類型、飲食偏好、紙本喜帖、收件人、收件電話、收件地址、提交時間 UTC+8、通知信已發送；**不含出席狀態、不含備註欄位**；檔案末段附統計摘要（總回覆筆數、總出席人數 = adultCount + childCount）；檔名格式 `RSVP_YYYYMMDD.csv`

**Checkpoint**: US2 Independent Test 完整通過；前台 `https://hezhouwedding.com` 功能不受影響（SC-A004）

---

## Phase 5：Polish & 部署確認

**Purpose**: 部署環境設定確認、跨功能驗證

- [x] T017 在 Zeabur Dashboard → backend 服務 → Variables 新增 `JWT_SECRET`（≥ 32 字元隨機字串，以 `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 產生）與 `ADMIN_CREDENTIALS={"bean":"bean","zhou":"zhou"}`，並確認服務重新部署成功
- [x] T018 [P] 確認 Zeabur frontend 服務 SPA fallback 設定：直接訪問 `https://hezhouwedding.com/admin` 不出現 404（若出現，至 Zeabur Dashboard → frontend → Settings 開啟 SPA mode）
- [x] T019 依照 `specs/002-admin-dashboard/quickstart.md` 執行本地驗證清單（`POST /api/admin/login` 正確帳密 → 200；錯誤帳密 → 401；無 token 訪問 `/api/admin/rsvp` → 401；CRUD 全流程通過；前台不受影響）
- [x] T021 [P] [US2] 修正 highchairCount 上限邏輯（不可超過 childCount）：後端 `rsvpSchema.ts`、`adminRsvpSchema.ts` 加入 refine（highchairCount ≤ childCount）；前端 `useRsvp.ts` 加入 watch 自動修正；`RsvpSection.vue`、`RsvpModal.vue`、`AdminDashboard.vue` 改 v-for 選項動態限制為 childCount；同步更新 spec.md / data-model.md / contracts/api.md
- [ ] T020 [P] 手動測試生產環境 `https://hezhouwedding.com/admin` 完整流程：登入 → 列表顯示 → 統計摘要 → 搜尋 → 新增（Modal）→ 修改（Inline）→ 刪除；分別在手機（375px）與桌機（1440px）確認 RWD 佈局正確

---

## Dependencies & Execution Order

### Phase 相依性

```
Phase 1 (Setup)
    └─► Phase 2 (Foundational) — 全部完成才能繼續
              └─► Phase 3 (US1, P1) 🎯 MVP
                        └─► Phase 4 (US2, P2)
                                  └─► Phase 5 (Polish)
```

### Phase 2 內部順序

```
T004 (adminAuth) ─┐
T005 (router)    ─┤─ 可平行
T006 (adminApi)  ─┘
T007 (main.ts)    ─ 依賴 T005
```

### Phase 3 內部順序

```
T008 (loginAdmin controller) ─┐
T009 (admin routes)          ─┤─ 可平行
T011 (AdminLogin.vue)        ─┘
T010 (app.ts mount)           ─ 依賴 T009
```

### Phase 4 內部順序

```
T012 (adminRsvpSchema)  ─┐ 可平行
T013 (RsvpModal.vue)    ─┘
T014 (RSVP controller)    ─ 依賴 T012
T015 (routes 補全)        ─ 依賴 T014
T016 (AdminDashboard.vue) ─ 依賴 T013
```

---

## Parallel Execution Examples

### Phase 2 — 可平行啟動

```bash
Task: "T004 adminAuth middleware"
Task: "T005 Vue Router index.ts"
Task: "T006 adminApi service"
```

### Phase 3 US1 — 可平行啟動

```bash
Task: "T008 loginAdmin controller"
Task: "T009 admin routes"
Task: "T011 AdminLogin.vue"
```

### Phase 4 US2 — 第一批可平行啟動

```bash
Task: "T012 adminRsvpSchema"
Task: "T013 RsvpModal.vue"
```

---

## Implementation Strategy

### MVP First（US1 Only）

1. 完成 Phase 1：Setup
2. 完成 Phase 2：Foundational（**必須全部完成才能繼續**）
3. 完成 Phase 3：US1（登入 / 登出 / Session 保持）
4. **STOP & VALIDATE**：US1 Independent Test 通過後部署至 Zeabur 確認 `/admin` 可存取
5. 繼續 Phase 4：US2

### Incremental Delivery

1. Phase 1 + Phase 2 → 基礎架構就緒
2. Phase 3 → 登入流程完整上線
3. Phase 4 → RSVP 管理功能上線
4. Phase 5 → 生產環境驗證完成

---

## Notes

- **[P]** = 不同檔案、無未完成相依，可平行執行
- **[US1]/[US2]** = 追溯至 `spec.md` 對應 User Story
- v1 無自動化測試，以手動瀏覽器測試驗證
- 每個任務完成後 commit，保持 commit 粒度小且清晰
- `App.vue` 與現有所有 Section 元件不需修改（`/` 路由直接渲染現有 App.vue）
- 前台路由 `/` 在 Vue Router 中設為 `component: () => import('./App.vue')` 的 lazy import，或直接 import
