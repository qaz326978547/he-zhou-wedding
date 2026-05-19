# 本地開發快速入門：婚禮邀請網站 v1

**Feature**: `001-wedding-site-v1`
**Date**: 2026-05-17

---

## 前置需求

| 工具 | 版本 | 說明 |
|------|------|------|
| Node.js | 20 LTS | 前後端均需 |
| npm | 10+ | Node.js 20 附帶 |
| PostgreSQL | 16（本地）或 Zeabur 服務 | 資料庫 |
| Git | 任意版本 | 版本控制 |

---

## 專案初始化

```bash
# clone 後進入專案目錄
git clone <repo-url>
cd wedding-site
```

---

## Backend 設定

### 1. 安裝相依套件

```bash
cd backend
npm install
```

### 2. 設定環境變數

```bash
cp .env.example .env
```

編輯 `.env`：

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/wedding_dev
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=beanzhou921@gmail.com
FRONTEND_URL=http://localhost:5173
RSVP_ENABLED=true
```

> **注意**：`DATABASE_URL` 格式：`postgresql://<user>:<password>@<host>:<port>/<database>`
> 本地開發可使用 `postgresql://postgres:postgres@localhost:5432/wedding_dev`

### 3. 執行資料庫 Migration

確認 PostgreSQL 服務已啟動，且 `DATABASE_URL` 設定正確。

```bash
# 建立資料庫（若尚未建立）
npx prisma db push

# 或執行正式 migration
npx prisma migrate dev --name init
```

### 4. 啟動後端開發伺服器

```bash
npm run dev
```

後端服務啟動於 `http://localhost:3000`

**驗證**：

```bash
curl http://localhost:3000/api/health
# 期望回應：{"data":{"status":"ok"}}
```

---

## Frontend 設定

### 1. 安裝相依套件

```bash
cd frontend
npm install
```

### 2. 設定環境變數

```bash
cp .env.example .env
```

編輯 `.env`：

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. 啟動前端開發伺服器

```bash
npm run dev
```

前端服務啟動於 `http://localhost:5173`

---

## 靜態資產放置

在開始前端開發前，請確認以下資產目錄結構正確放置：

```
frontend/public/assets/
├── hero/          # 主視覺圖片（建議：WebP 格式，>1920px 寬）
├── story/         # 愛情故事圖片（4 張，對應 2019/2021/2024/2026）
├── gallery/       # 婚紗精選相片（任意數量）
├── music/         # 背景音樂（建議：bg-music.mp3）
├── og/            # OG 分享圖（og-cover.jpg，1200×630px）
├── line/          # LINE QR Code（qr-code.png）
└── ui/            # 介面圖示（視設計需求）
```

> **v1 開發提示**：靜態資產可暫時使用佔位圖片（placeholder），不影響功能開發。

---

## 資料庫管理（Prisma Studio）

主辦人可透過 Prisma Studio 直接查詢與修改 RSVP 資料（v1 Admin 工具，FR-015）：

```bash
cd backend
npx prisma studio
```

Prisma Studio 啟動於 `http://localhost:5555`

**常見操作**：
- 查看所有 RSVP 提交：點擊 `RSVPSubmission` 表格
- 修改賓客出席狀態：點擊對應紀錄 → 編輯欄位 → 儲存
- 查看通知信發送狀態：`notificationEmailSent` / `notificationEmailError` 欄位

---

## 本地開發驗證清單

啟動後請確認：

- [ ] `GET http://localhost:3000/api/health` 回傳 `{"data":{"status":"ok"}}`
- [ ] `GET http://localhost:3000/api/rsvp/status` 回傳 `{"data":{"enabled":true}}`
- [ ] 前端 `http://localhost:5173` 頁面正常載入
- [ ] 填寫 RSVP 表單並提交 → 後端回傳 201 → 前端顯示成功畫面
- [ ] Prisma Studio `http://localhost:5555` 顯示剛才提交的紀錄

---

## 建置與預覽（部署前驗證）

### Frontend Build

```bash
cd frontend
npm run build
npm run preview
```

預覽網址：`http://localhost:4173`

### Backend Build

```bash
cd backend
npm run build   # TypeScript 編譯
npm run start   # 啟動生產模式
```

---

## Zeabur 部署步驟

### 1. 環境變數設定

在 Zeabur Dashboard 設定以下環境變數（不提交至版本控制）：

**Backend Service**：
```
PORT=<由 Zeabur 注入>
DATABASE_URL=<由 Zeabur PostgreSQL 服務自動注入>
RESEND_API_KEY=re_xxxxxxxx
ADMIN_EMAIL=beanzhou921@gmail.com
FRONTEND_URL=https://hezhouwedding.com
RSVP_ENABLED=true
```

**Frontend Static Site**：
```
VITE_API_BASE_URL=https://api.hezhouwedding.com
```

### 2. 執行資料庫 Migration（首次部署）

```bash
# 透過 Zeabur 終端或本地連接 Zeabur PostgreSQL
DATABASE_URL=<zeabur-db-url> npx prisma migrate deploy
```

### 3. 確認部署

- Frontend：`https://hezhouwedding.com`
- Backend health check：`https://api.hezhouwedding.com/api/health`
- RSVP status：`https://api.hezhouwedding.com/api/rsvp/status`

---

## 常見問題（FAQ）

**Q: 後端無法連接 PostgreSQL？**
確認 `DATABASE_URL` 格式正確，且 PostgreSQL 服務正在執行。本地可用 `psql -U postgres` 測試連線。

**Q: 前端 RSVP 提交回傳 CORS 錯誤？**
確認後端 `FRONTEND_URL` 環境變數設定為前端實際網址（本地開發為 `http://localhost:5173`）。

**Q: Resend 發送失敗但 RSVP 已儲存？**
這是預期行為（FR-014：非同步發送，失敗不中斷 RSVP 流程）。透過 Prisma Studio 查看 `notificationEmailError` 欄位取得錯誤詳情。

**Q: 音樂無法播放？**
請確認 `frontend/public/assets/music/` 目錄下有音樂檔案，且 `useBackgroundMusic` composable 中的 `src` 路徑正確。瀏覽器 Autoplay Policy 限制是正常現象，等待首次使用者互動後會自動嘗試播放。

**Q: 如何關閉 RSVP 報名？**
在後端將環境變數 `RSVP_ENABLED` 設為 `false` 並重啟服務。前端初始化時呼叫 `GET /api/rsvp/status` 取得狀態後顯示「報名已截止」。
