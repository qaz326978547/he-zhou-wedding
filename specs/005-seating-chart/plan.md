# Implementation Plan: 婚宴座位安排

**Branch**: `005-seating-chart` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

## Summary

新增後台頁面 `/admin/seating`，以 SVG 重繪「草悟廳」平面圖（舞台、柱子、入口、17 張圓桌），點選桌子開啟明細面板進行賓客新增 / 修改 / 換桌 / 刪除，並可從 RSVP 未安排名單一鍵加入。後端新增 `SeatTable`、`SeatGuest` 兩張表與 `/api/admin/seating*` 端點，容量檢查於 transaction 內執行。

## Technical Context

- **Frontend**: Vue 3 + Vite + Tailwind，沿用 `adminApi`（axios + token interceptor）
- **Backend**: Express + Prisma + Zod，沿用 `adminAuth`
- **DB**: PostgreSQL，新增 migration `add_seating`
- **無新增套件**

## Project Structure（本 feature 異動）

```txt
backend/
  prisma/schema.prisma                         # + SeatTable, SeatGuest
  prisma/migrations/<ts>_add_seating/          # 新 migration
  src/validation/seatingSchema.ts              # 新
  src/controllers/seatingController.ts         # 新
  src/routes/admin.ts                          # + seating 路由
frontend/
  src/constants/seating.ts                     # 新：17 桌座標與容量
  src/views/admin/AdminSeating.vue             # 新：座位圖頁面
  src/router/index.ts                          # + /admin/seating
  src/views/admin/AdminDashboard.vue           # header 加入「座位安排」連結
  src/views/admin/AdminRedEnvelope.vue         # header 加入「座位安排」連結
```

## 設計決策

- **桌位座標放前端常數**：場地固定，不需資料庫管理；SVG viewBox 直接沿用平面圖像素座標，確保比例一致且可縮放（RWD）。
- **桌號編排**：舞台正前方為「主桌」，不編號（內部 `tableNo = 0`）；其餘 16 桌由最左側一欄開始、每欄由上往下編號，再往右一欄；最左欄最下方為預備桌，編為第 16 桌（原第 5–16 桌依序遞補為第 4–15 桌）。可透過桌名另加自訂名稱。
- **重新編號**：migration `renumber_seating` 清空舊編號下的座位資料（經主辦人同意）；migration `move_reserve_table_to_16` 將預備桌改為第 16 桌，賓客與桌設定跟著實體位置換號。
- **容量強制於後端**：新增 / 修改時於 `prisma.$transaction` 內加總該桌其他紀錄，超過 10 回傳 409。
- **換桌 = PUT 修改 tableNo**：不另開端點。
- **RSVP 連結**：`rsvpId` 不設 FK，避免刪除 RSVP 時連帶影響座位。
