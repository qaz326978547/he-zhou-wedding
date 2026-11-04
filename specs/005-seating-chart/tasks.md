# Tasks: 婚宴座位安排

**Input**: `specs/005-seating-chart/`（spec.md、plan.md、data-model.md、contracts/api.md）

## Phase 1：Setup（資料庫）

- [X] T001 於 `backend/prisma/schema.prisma` 新增 `SeatTable`、`SeatGuest` model
- [X] T002 新增 migration `backend/prisma/migrations/20261105000000_add_seating/migration.sql`

## Phase 2：Backend

- [X] T003 [P] 建立 `backend/src/validation/seatingSchema.ts`（桌號 1–17、人數 1–10、姓名 1–50、備註 ≤ 100、桌名 ≤ 20）
- [X] T004 建立 `backend/src/controllers/seatingController.ts`（list / updateTableLabel / createGuest / updateGuest / deleteGuest，容量檢查於 transaction 內）
- [X] T005 更新 `backend/src/routes/admin.ts` 掛載 seating 路由（`adminAuth`）

## Phase 3：Frontend — US1 / US2 / US3（P1–P2）

- [X] T006 [P] 建立 `frontend/src/constants/seating.ts`（17 桌座標、容量 10）
- [X] T007 建立 `frontend/src/views/admin/AdminSeating.vue`：SVG 座位圖、統計、桌面板（新增 / 修改 / 換桌 / 刪除 / 桌名）
- [X] T008 更新 `frontend/src/router/index.ts` 新增 `/admin/seating`
- [X] T009 [P] 於 `AdminDashboard.vue`、`AdminRedEnvelope.vue` header 加入「座位安排」連結

## Phase 4：US4 — RSVP 未安排名單（P2）

- [X] T010 於 `AdminSeating.vue` 載入 `/api/admin/rsvp`，列出已參加且未安排者，可一鍵加入目前桌

## Phase 5：US5 — 匯出（P3）

- [X] T011 於 `AdminSeating.vue` 新增 CSV 匯出（UTF-8 BOM，含每桌小計）

## Phase 6：驗證

- [X] T012 backend `tsc --noEmit`、frontend `vue-tsc` / `vite build` 通過
