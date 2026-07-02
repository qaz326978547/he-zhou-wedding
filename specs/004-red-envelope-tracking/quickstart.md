# 本地開發快速入門：紅包登記功能

**Feature**: `004-red-envelope-tracking`
**Date**: 2026-07-03

---

## 前置需求

承繼 `001-wedding-site-v1` 與 `002-admin-dashboard` 的本地開發環境（Node.js 20、PostgreSQL、已完成既有 migration、已設定 `JWT_SECRET` / `ADMIN_CREDENTIALS`）。**本功能不新增任何套件依賴、不新增環境變數**。

---

## 後端設定

### 1. 執行 Prisma migration

在 `backend/prisma/schema.prisma` 新增 `RedEnvelopeEntry` model 後：

```bash
cd backend
npx prisma migrate dev --name add_red_envelope_entry
```

### 2. 啟動後端

```bash
npm run dev
```

**驗證賓客提交 API**：

```bash
curl -s -X POST http://localhost:3000/api/red-envelope \
  -H "Content-Type: application/json" \
  -d '{"name":"王大明","amount":3600}'
# 期望：{"data":{"id":1,"name":"王大明","amount":3600,"createdAt":"..."}}
```

**驗證後台列表 API**（需先取得 admin token，見 `002-admin-dashboard/quickstart.md`）：

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"bean","password":"bean"}' | jq -r .data.token)

curl -s http://localhost:3000/api/admin/red-envelope \
  -H "Authorization: Bearer $TOKEN"
# 期望：{"data":[{"id":1,"name":"王大明","amount":3600,"createdAt":"..."}]}
```

---

## 前端設定

### 啟動前端

```bash
cd frontend
npm run dev
```

**驗證賓客端頁面**：

- 開啟 `http://localhost:5173/qr` → 應顯示姓名／金額表單
- 填寫後送出 → 顯示成功提示，欄位清空

**驗證後台頁面**：

- 開啟 `http://localhost:5173/admin` → 登入（`bean` / `bean`）
- 前往 `http://localhost:5173/admin/red-envelope` → 應顯示紅包登記列表、總筆數、總金額
- 未登入時直接開啟 `/admin/red-envelope` → 應導向 `/admin/login`

---

## 本地驗證清單

- [X] `npx prisma migrate dev` 成功建立 `RedEnvelopeEntry` 資料表
- [X] `POST /api/red-envelope`（有效資料）→ 201
- [X] `POST /api/red-envelope`（姓名或金額缺漏／格式錯誤）→ 400
- [X] `POST /api/red-envelope`（同一 IP 超過 5 次/小時）→ 429
- [X] `GET /api/admin/red-envelope`（無 token）→ 401
- [X] `GET /api/admin/red-envelope`（有 token）→ 200 + 列表
- [X] `PUT /api/admin/red-envelope/:id` → 200，欄位正確更新
- [X] `POST /api/red-envelope`（金額為極大數字，例如 99999999）→ 201，正確儲存與加總，不溢位
- [X] 連續快速送出多筆（模擬現場排隊登記）→ 每筆皆正確寫入，無遺失或覆蓋
- [X] `DELETE /api/admin/red-envelope/:id` → 204
- [X] 前端 `/qr` 送出成功後表單清空，可連續登記多筆
- [X] 前端 `/admin/red-envelope` 未登入 → 導向 `/admin/login`
- [X] 前端 `/admin/red-envelope` 登入後 → 顯示列表、總筆數、總金額；inline 修改/刪除後即時更新
- [X] 點擊「匯出 Excel」→ 下載 CSV，用 Excel 開啟中文姓名不亂碼，末段含統計
- [ ] 前台 `https://hezhouwedding.com` 與既有 `/admin` RSVP 功能不受影響
