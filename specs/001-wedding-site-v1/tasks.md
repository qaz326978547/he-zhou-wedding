# Tasks: 婚禮邀請網站 v1

**Input**: Design documents from `specs/001-wedding-site-v1/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/api.md ✅ quickstart.md ✅

**User Stories**:
- **US1** (P1)：賓客瀏覽婚禮資訊頁面（Hero、倒數、行事曆、故事、婚禮資訊、相片牆、Footer、音樂）
- **US2** (P2)：賓客提交 RSVP（表單、驗證、儲存、通知信、成功畫面、LINE 邀請）

**Format**: `- [ ] [TaskID] [P?] [Story?] 說明（含檔案路徑）`
- **[P]**: 可平行執行（不同檔案，無未完成相依）
- **[US1]/[US2]**: 任務所屬 User Story

---

## Phase 1：Setup（專案初始化）

**Purpose**: Monorepo 目錄結構與工具鏈設定

- [X] T001 建立 Monorepo 根目錄結構：`frontend/`、`backend/`、`specs/` 並確認 `.gitignore` 正確排除 `node_modules/`、`.env`、`dist/`
- [X] T002 [P] 在 `frontend/` 初始化 Vite + Vue 3 + TypeScript 專案（`npm create vite@latest`），安裝 Tailwind CSS 3.x、Axios、@vueuse/core
- [X] T003 [P] 在 `backend/` 初始化 Node.js + TypeScript 專案，安裝 Express、Prisma 5.x、Zod、express-rate-limit、Resend SDK、tsx（開發用）
- [X] T004 建立 `frontend/.env.example`（`VITE_API_BASE_URL`）與 `backend/.env.example`（`PORT`、`DATABASE_URL`、`RESEND_API_KEY`、`ADMIN_EMAIL`、`FRONTEND_URL`、`RSVP_ENABLED`）

**Checkpoint**: Monorepo 結構就緒，前後端均可執行 `npm install`

---

## Phase 2：Foundational（阻塞性前置）

**Purpose**: 後端核心基礎設施 + 前端共用配置；所有 User Story 均依賴本階段完成

**⚠️ CRITICAL**: 本階段完成前，不得開始任何 User Story 實作

### 後端基礎

- [X] T005 定義 `RSVPSubmission` model 於 `backend/prisma/schema.prisma`（欄位：id、name、phone @unique、attending、guestCount @default(0)、relationshipSide?、relationshipType?、dietaryPreference @default("regular")、notes @db.VarChar(300)?、notificationEmailSent @default(false)、notificationEmailSentAt?、notificationEmailError?、createdAt @default(now())）
- [X] T006 建立 Express 應用程式進入點 `backend/src/app.ts`（按序掛載：CORS → express.json → rateLimiter → routes → errorHandler）
- [X] T007 [P] 實作 CORS middleware 於 `backend/src/middleware/cors.ts`（允許 origin：`process.env.FRONTEND_URL`，methods: GET/POST/OPTIONS）
- [X] T008 [P] 實作 express-rate-limit middleware 於 `backend/src/middleware/rateLimiter.ts`（5 次/IP/小時；HTTP 429 回應含 `RATE_LIMITED` error code）
- [X] T009 [P] 實作全域錯誤處理 middleware 於 `backend/src/middleware/errorHandler.ts`（捕捉未預期錯誤，回傳統一 JSON 結構）
- [X] T010 實作 Zod 驗證 schema 於 `backend/src/validation/rsvpSchema.ts`（含台灣電話正規表達式 `/^09\d{8}$|^0[2-9]\d{7,8}$/`、guestCount 1–10 / attending=false 時為 0、relationshipType 依賴 relationshipSide、notes ≤ 300 字元）
- [X] T011 實作 `GET /api/health` 與 `GET /api/rsvp/status` 路由於 `backend/src/routes/rsvp.ts`（health 回傳 `{data:{status:"ok"}}`；rsvp/status 讀取 `process.env.RSVP_ENABLED` 回傳 `{data:{enabled:boolean}}`）

### 前端基礎

- [X] T012 建立 Axios API service 於 `frontend/src/services/api.ts`（`baseURL: import.meta.env.VITE_API_BASE_URL`，Content-Type: application/json）
- [X] T013 [P] 設定 Tailwind CSS 設計 Token 於 `frontend/tailwind.config.ts`（擴充 colors：`wedding-cream: #FAF8F5`、`wedding-gold: #C9A96E`、`wedding-charcoal: #2C2C2C`；字型：font-script / font-display（Great Vibes, cursive）、font-wedding-zh（Iansui, Noto Serif TC, serif）；斷點：sm 375、md 768、lg 1280）
- [X] T014 [P] 定義 TypeScript 型別於 `frontend/src/types/index.ts`（`RsvpPayload`、`ApiResponse<T>`、`RsvpStatus`、`DietaryPreference`、`RelationshipSide`、`RelationshipType`）
- [X] T015 [P] 定義婚禮靜態常數於 `frontend/src/constants/wedding.ts`（`WEDDING.countdownTarget = new Date('2026-11-14T04:00:00Z')`、venue 正式資料已填入（全國大飯店 2F / 台灣臺中市西區館前路 57 號 / https://maps.app.goo.gl/CQz5TGweR5N8CgsQA）、couple English names（HE Bean / Katherine Zhou）、LINE URL/description/qrCodePath、RSVP success 訊息文字）
- [X] T016 建立 `frontend/src/App.vue` shell，依序 import 並渲染：HeroSection、CountdownSection、CalendarSection、TimelineSection、InfoSection、GallerySection、RsvpSection、AppFooter；掛載 MusicToggle（全域浮動）
- [X] T017 建立 `frontend/public/assets/` 子目錄（hero/、story/、gallery/、music/、og/、line/、ui/）並各放置 `.gitkeep` 佔位檔案

**Checkpoint**: 後端可執行 `npm run dev`（`/api/health` 回傳 ok）；前端可執行 `npm run dev`（Vue App 渲染空白頁）

---

## Phase 3：User Story 1 — 賓客瀏覽婚禮資訊頁面（Priority: P1）🎯 MVP

**Goal**: 賓客可在手機或桌機完整瀏覽婚禮資訊頁面七個區塊 + Footer，背景音樂、音樂切換按鈕、LINE Footer 按鈕均正常運作

**Independent Test**: 開啟 `http://localhost:5173`，在 375px 與 1440px 視窗寬度下完整滾動所有區塊，確認：倒數計時每秒更新目標至 2026-11-14 12:00 UTC+8、行事曆標示 11/14、時間軸動畫觸發、音樂切換按鈕始終可見、Footer LINE 按鈕開啟新分頁

### Composables（可平行執行）

- [X] T018 [P] [US1] 實作 `useIntersectionObserver` composable 於 `frontend/src/composables/useIntersectionObserver.ts`（接受 `threshold`/`rootMargin` 參數，回傳 `isVisible` ref；元素離開後可選擇是否保持可見）
- [X] T019 [P] [US1] 實作 `useCountdown` composable 於 `frontend/src/composables/useCountdown.ts`（讀取 `WEDDING.countdownTarget`，每秒計算剩餘 days/hours/minutes/seconds；目標時刻到達後停止並回傳 `isReached: true`；`onUnmounted` 清除計時器）
- [X] T020 [P] [US1] 實作 `useBackgroundMusic` composable 於 `frontend/src/composables/useBackgroundMusic.ts`（監聽首次使用者互動事件 `click`/`touchstart`/`keydown`/`wheel`；首次互動後呼叫 `audio.play()` 並以 `.catch(() => {})` 靜默處理 Autoplay Policy 阻擋；`loop` 屬性；`preload="none"`；回傳 `isPlaying` ref 與 `toggle()` 方法；按鈕始終可見）

### UI 元件（可平行執行）

- [X] T021 [P] [US1] 建立 `MusicToggle` UI 元件於 `frontend/src/components/ui/MusicToggle.vue`（`position: fixed`，右下角，尺寸 ≥ 44×44px；圖示依 `isPlaying` 即時切換；白色明亮韓系配色；任何狀態下均可見）
- [X] T022 [P] [US1] 建立 `LineButton` UI 元件於 `frontend/src/components/ui/LineButton.vue`（`href` prop；`target="_blank" rel="noopener noreferrer"`；暖金色設計）

### Section 元件（可平行執行）

- [X] T023 [P] [US1] 建立 `HeroSection` 元件於 `frontend/src/components/sections/HeroSection.vue`（三段式排版，FR-002）：
  - **上方區**：大型手寫英文標題 "We got Married"（`font-script text-5xl md:text-6xl lg:text-7xl`），absolute top-0 固定於頂部，clip-path write-in 動畫由左至右顯現；`overflow: visible` + `pt-4 pb-3` 防書法字裁切
  - **中間區**：全螢幕清晰婚紗照片（`absolute inset-0 object-cover`），MUST NOT 大面積白霧遮蓋；底部僅保留極淡 4-stop 漸層（透明度 ≤ 5%）銜接名字區
  - **底部區**：absolute bottom-0，新人中英文左右並排（何啟賢／HE Bean  `/`  周羽薇／Katherine Zhou）；中文 `font-sans font-light text-2xl md:text-3xl`，英文 `font-display text-[10px] tracking-[0.38em] uppercase`；中文字級大於英文；`/` 分隔符採 `text-wedding-gold/55`；婚禮日期 `2026 · 11 · 14`；CTA 按鈕平滑捲動至 RsvpSection（`#rsvp`）
  - Hero 圖片使用 `:src` 動態綁定（避免 Vite 靜態分析）+ `fetchpriority="high"` + `decoding="async"`；柔和 fade-up + divider expand 進場動畫（staggered delay 0.25s–1.75s）；`prefers-reduced-motion` 無障礙支援
- [X] T024 [US1] 建立 `CountdownSection` 元件於 `frontend/src/components/sections/CountdownSection.vue`（使用 `useCountdown`；顯示天/時/分/秒四欄；目標到達後顯示慶賀訊息取代計時器）
- [X] T025 [P] [US1] 建立 `CalendarSection` 元件於 `frontend/src/components/sections/CalendarSection.vue`（2026 年 11 月完整日曆；11/14 以 SVG 心形輪廓框住數字標示；半透明玻璃感卡片；純前端計算，不依賴外部日曆套件）
- [X] T026 [P] [US1] 建立 `TimelineSection` 元件於 `frontend/src/components/sections/TimelineSection.vue`（**黑色電影沉浸式區塊**；背景 `#0D0D0D`～`#1A1A1A`；film grain texture overlay（opacity ≤ 0.08）；垂直時間軸四個里程碑：2019/2021/2024/2026，奇偶左右交錯；Kodak 底片框（含齒孔細節）包覆故事圖片；年份使用 `font-script` 淡金色；文字白色 / 灰白 / 淡金色；`useIntersectionObserver` 觸發 fade-in + slow slide-in（700ms）；圖片來源 `assets/story/`；FR-005）
- [X] T027 [P] [US1] 建立 `InfoSection` 元件於 `frontend/src/components/sections/InfoSection.vue`（婚禮日期 2026-11-14 12:00 UTC+8、地點名稱/地址/Google Maps 連結/交通資訊從 `WEDDING.venue` 讀取；**正式資料已填入**：全國大飯店 2F、台灣臺中市西區館前路 57 號、https://maps.app.goo.gl/CQz5TGweR5N8CgsQA；Maps 連結 `target="_blank" rel="noopener noreferrer"`）
- [X] T028 [P] [US1] 建立 `GallerySwiperSection` 元件於 `frontend/src/components/sections/GallerySwiperSection.vue`（安裝 `swiper` npm 套件；**黑色電影膠卷氛圍背景**；Swiper.js 輪播；Kodak 底片框外框（含齒孔）包覆圖片；手機觸控左右滑動；桌機 grab cursor + 箭頭切換；pagination dots 淡金色；loop mode；slidesPerView：手機 1、桌機 1.2；autoplay 關閉；`<img loading="lazy">`；圖片來源 `assets/gallery/`；MUST NOT 使用 coverflow/cube/flip；FR-007）；同步更新 `frontend/src/App.vue` 中 import 名稱

### Layout & 全域功能

- [X] T029 [US1] 建立 `AppFooter` 元件於 `frontend/src/components/layout/AppFooter.vue`（使用 `LineButton`；LINE URL 讀取自 `WEDDING.line.url`；白色明亮韓系設計；版權聲明）
- [X] T030 [US1] 在 `frontend/index.html` `<head>` 加入 Open Graph 與 Twitter Card meta tags（`og:title` 含新人姓名與婚禮日期、`og:description`、`og:image` 指向 `https://hezhouwedding.com/assets/og/og-cover.jpg`、`og:url`、`og:type`、`twitter:card: summary_large_image`；FR-018）
- [X] T031 [US1] 在 `frontend/src/App.vue` 整合 `useBackgroundMusic` 與 `MusicToggle`，設定 CSS `scroll-behavior: smooth`（FR-017、FR-020）

**Checkpoint**: 開啟網站可瀏覽七個區塊（RsvpSection 為空殼）、Footer、音樂功能與 LINE 按鈕均完整運作；US1 獨立測試通過

---

## Phase 4：User Story 2 — 賓客提交 RSVP（Priority: P2）

**Goal**: 賓客可完整填寫並提交 RSVP，系統驗證後儲存至資料庫、主辦人收到通知信、頁面顯示含 LINE 邀請區塊的成功確認畫面

**Independent Test**: 填寫姓名「王大明」、電話「0912345678」、出席 2 人，提交後：確認 Prisma Studio 有紀錄、主辦人信箱收到通知信（或 notificationEmailSent 欄位狀態）、前端顯示成功確認畫面含 LINE block；再次提交相同電話，確認回傳 409 並顯示「已收到您的回覆」

### 後端（可先平行開發）

- [X] T032 [P] [US2] 實作 `emailService` 於 `backend/src/services/emailService.ts`（Resend SDK；寄件人 `noreply@hezhouwedding.com`；收件人 `process.env.ADMIN_EMAIL`；通知信內容含完整 RSVP 欄位及 createdAt UTC+8 轉換；發送結果回寫 `notificationEmailSent`/`notificationEmailSentAt`/`notificationEmailError`；任何失敗不拋出 exception 至呼叫方）
- [X] T033 [US2] 執行 Prisma migration 建立 `RSVPSubmission` 資料表（`cd backend && npx prisma migrate dev --name init`）
- [X] T034 [US2] 實作 `POST /api/rsvp` 於 `backend/src/controllers/rsvpController.ts`（流程：Zod 驗證 → 檢查 RSVP_ENABLED → Prisma create → 201 → 非同步呼叫 emailService；Zod 失敗 → 400；P2002 unique 衝突 → 409；RSVP_ENABLED=false → 422；其他 → 500）
- [X] T035 [US2] 在 `backend/src/routes/rsvp.ts` 註冊 `POST /api/rsvp` 路由，掛載 `rateLimiter` middleware（T035 依賴 T033、T034 完成）

### 前端 UI 元件（可平行執行）

- [X] T036 [P] [US2] 建立 `Input` UI 元件於 `frontend/src/components/ui/Input.vue`（支援 label、placeholder、error 訊息、disabled 狀態；`aria-invalid` / `aria-describedby` 無障礙屬性）
- [X] T037 [P] [US2] 建立 `Button` UI 元件於 `frontend/src/components/ui/Button.vue`（variants：primary / disabled / loading；最小觸控區域 44×44px；loading 狀態顯示轉圈或「提交中…」）
- [X] T038 [P] [US2] 建立 `LoadingSpinner` UI 元件於 `frontend/src/components/ui/LoadingSpinner.vue`（奶油白配色，純 CSS 動畫）

### 前端業務邏輯

- [X] T039 [P] [US2] 實作 `useRsvp` composable 於 `frontend/src/composables/useRsvp.ts`（響應式表單狀態：name/phone/attending/guestCount/relationshipSide/relationshipType/dietaryPreference/notes；台灣電話前端驗證；attending=false 時自動設 guestCount=0 並隱藏欄位；notes 即時字數計算；loading/success/error 狀態；呼叫 `api.post('/api/rsvp', payload)` 並處理 201/400/409/422/429/500 各狀態；成功後設 submitted=true 保持 session 狀態）

### 前端 RSVP 區塊（依賴 composable）

- [X] T040 [US2] 建立 `RsvpSection` 元件於 `frontend/src/components/sections/RsvpSection.vue`（使用 `useRsvp`；按 FR-008 渲染所有欄位：姓名/電話/出席狀態/出席人數/賓桌歸屬/關係類型（FR-008 兩層聯動）/飲食偏好/備註計數；FR-019 loading 狀態：按鈕 disabled + spinner；頁面初始化時呼叫 GET /api/rsvp/status，`enabled=false` 時顯示「報名已截止」；T040 依賴 T036、T037、T038、T039）
- [X] T041 [US2] 在 `RsvpSection.vue` 內實作成功確認畫面（FR-012：`submitted=true` 時以成功畫面取代表單；內容：感謝訊息、婚禮日期 2026-11-14 星期六、宴客地點名稱與地址（讀取 `WEDDING.venue`）、平滑捲回頂端按鈕、LINE 邀請區塊含 QR Code 圖片（`WEDDING.line.qrCodePath`）/加入按鈕/說明文字（`WEDDING.line.description`）；T041 依賴 T040）

**Checkpoint**: 完整 RSVP 流程通過 US2 Independent Test；US1 功能不受影響

---

## Phase 5：Polish & 橫切關注點

**Purpose**: 跨功能優化、部署前驗證

- [X] T042 [P] 確認 `backend/src/middleware/cors.ts` 同時允許 `http://localhost:5173`（開發）與 `https://hezhouwedding.com`（生產）origin，避免本地開發 CORS 錯誤
- [X] T043 [P] 更新 `frontend/public/assets/` 各子目錄，補充 README 說明（預期檔案名稱、格式、尺寸規格），方便後續放入正式資產（hero WebP、OG 1200×630、LINE QR Code PNG 命名為 `qr-code.png`、背景音樂 MP3 命名為 `bg-music.mp3`）
- [X] T044 [P] 驗證所有環境變數均已記錄於 `frontend/.env.example` 與 `backend/.env.example`，與 `quickstart.md` 一致
- [X] T045 依照 `specs/001-wedding-site-v1/quickstart.md` 驗證清單執行本地端對端測試（`/api/health` ✅、`/api/rsvp/status` ✅、表單提交 201 ✅、Prisma Studio DB 紀錄確認 ✅、重複電話 409 ✅、RSVP_ENABLED=false 422 ✅、guestCount > 10 400 ✅；Chrome DevTools 4G 測試需瀏覽器手動驗證）
- [X] T046 確認 Zeabur 部署設定：frontend Static Site（build: `npm run build` ✅ dist/ 產生成功，output: `dist`），backend Node.js Service（start: `npm run start` → `node dist/app.js` ✅ TypeScript 編譯通過），依照 `quickstart.md` 執行首次部署與 Migration（⏳需 Zeabur 存取與 PostgreSQL）
- [X] T047 [P] 在 375px、768px、1440px 三個斷點手動驗證所有 Section 元件（HeroSection、CountdownSection、CalendarSection、TimelineSection、InfoSection、GallerySection、RsvpSection、AppFooter）：無橫向捲動、所有互動元素觸控區域 ≥ 44×44px（FR-016、SC-002）（✅ Playwright 375/768/1440 全通過：無橫向溢出、觸控目標均 ≥44px）

---

## Dependencies & Execution Order

### Phase 相依性

```
Phase 1 (Setup)
    └─► Phase 2 (Foundational) — 必須全部完成
              └─► Phase 3 (US1, P1)  ─┐
              └─► Phase 4 (US2, P2)  ─┴─► Phase 5 (Polish)
```

- **Phase 1**: 無相依，立即可開始
- **Phase 2**: 依賴 Phase 1 完成；**BLOCKS** 所有 User Story
- **Phase 3 (US1)** 與 **Phase 4 (US2)**: 均依賴 Phase 2；可在 Phase 2 完成後平行執行（若有兩人開發）
- **Phase 5**: 依賴 Phase 3 + Phase 4 均完成

### Phase 2 內部順序

```
T005 (schema) → T033 (migration, Phase 4 開始才需要)
T006 (app.ts) 依賴 T007/T008/T009/T010/T011 完成才能正確掛載 middleware
T016 (App.vue) 依賴 T014/T015 (types, constants) 完成
```

### Phase 4 內部順序

```
T033 (migration) → T034 (controller) → T035 (route 註冊)
T036/T037/T038/T039 (UI + composable) 可平行
T040 (RsvpSection) 依賴 T036/T037/T038/T039
T041 (成功畫面) 依賴 T040
```

---

## Parallel Execution Examples

### Phase 3 US1 — 可平行啟動的任務群

```bash
# 第一批：Composables（互相獨立）
Task: "T018 useIntersectionObserver"
Task: "T019 useCountdown"
Task: "T020 useBackgroundMusic"

# 第二批：UI 元件（互相獨立）
Task: "T021 MusicToggle"
Task: "T022 LineButton"

# 第三批：Section 元件（互相獨立）
Task: "T023 HeroSection"
Task: "T025 CalendarSection"
Task: "T026 TimelineSection"
Task: "T027 InfoSection"
Task: "T028 GallerySection"
```

### Phase 4 US2 — 可平行啟動的任務群

```bash
# 後端與前端可同步進行
Task: "T032 emailService（後端）"
Task: "T036 Input UI 元件（前端）"
Task: "T037 Button UI 元件（前端）"
Task: "T038 LoadingSpinner UI 元件（前端）"
Task: "T039 useRsvp composable（前端）"
```

---

## Implementation Strategy

### MVP First（US1 Only）

1. 完成 Phase 1：Setup
2. 完成 Phase 2：Foundational（**必須全部完成才能繼續**）
3. 完成 Phase 3：US1（賓客可瀏覽婚禮資訊、音樂、LINE Footer）
4. **STOP & VALIDATE**：在 375px + 1440px 執行 US1 獨立測試
5. 可部署至 Zeabur 展示給新人確認視覺風格

### Incremental Delivery

1. Phase 1 + Phase 2 → 基礎架構就緒
2. Phase 3 → US1 上線 → 展示 → 確認
3. Phase 4 → US2 上線 → 寄測試 RSVP → 確認通知信
4. Phase 5 → 上線前最終驗證
5. 正式資產（實景照片、音樂、OG 圖、LINE QR Code）部署前替換

---

## Notes

- **[P]** = 不同檔案、無未完成相依，可平行執行
- **[US1]/[US2]** = 追溯至 `spec.md` 對應 User Story
- v1 無自動化測試，以 Prisma Studio + 手動瀏覽器測試驗證
- RSVP section 在 Phase 3 中以空殼佔位（`<section id="rsvp" />`），Phase 4 實作
- 靜態資產（照片、音樂、OG 圖）為外部素材，不影響功能開發；可先以佔位圖測試
- 每個任務完成後 commit，保持 commit 粒度小且清晰（憲章原則 V）
