# 本地開發快速入門：後台管理介面

**Feature**: `002-admin-dashboard`
**Date**: 2026-05-28

---

## 前置需求

承繼 `001-wedding-site-v1` 的本地開發環境（Node.js 20、PostgreSQL、已完成 migration）。

---

## 後端設定

### 1. 安裝新相依套件

```bash
cd backend
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### 2. 新增環境變數

在 `backend/.env` 加入：

```env
JWT_SECRET=your-random-secret-at-least-32-chars-here
ADMIN_CREDENTIALS={"bean":"bean","zhou":"zhou"}
```

> **JWT_SECRET 產生建議**：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. 啟動後端

```bash
npm run dev
```

**驗證後台登入**：

```bash
curl -s -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"bean","password":"bean"}'
# 期望：{"data":{"token":"eyJ...","username":"bean"}}
```

---

## 前端設定

### 1. 安裝 Vue Router

```bash
cd frontend
npm install vue-router@4
```

### 2. 啟動前端

```bash
npm run dev
```

**驗證後台路由**：

- 開啟 `http://localhost:5173/admin` → 應自動導向 `/admin/login`
- 輸入 `bean / bean` 登入 → 進入 RSVP 列表

---

## Zeabur 部署新增環境變數

在 Zeabur Dashboard → backend 服務 → Variables 新增：

```
JWT_SECRET=<產生的隨機字串>
ADMIN_CREDENTIALS={"bean":"bean","zhou":"zhou"}
```

> ⚠️ 若之後要改密碼，直接在 Zeabur 更新 `ADMIN_CREDENTIALS` 並重啟服務即可。

---

## Zeabur SPA Fallback 確認

部署後直接訪問 `https://hezhouwedding.com/admin` 若出現 404，請至：

**Zeabur Dashboard → Frontend 服務 → Settings → Enable SPA mode（或 Rewrites）**

設定所有路徑回落至 `index.html`。

---

## 本地驗證清單

- [ ] `POST /api/admin/login` 正確帳密 → 200 + token
- [ ] `POST /api/admin/login` 錯誤帳密 → 401
- [ ] `GET /api/admin/rsvp`（無 token）→ 401
- [ ] `GET /api/admin/rsvp`（有 token）→ 200 + 列表
- [ ] `POST /api/admin/rsvp` → 201
- [ ] `PUT /api/admin/rsvp/:id` → 200
- [ ] `DELETE /api/admin/rsvp/:id` → 204
- [ ] 前端 `/admin` 未登入 → 導向 `/admin/login`
- [ ] 前端登入後 → 顯示 RSVP 列表
- [ ] 前台 `https://hezhouwedding.com` 功能不受影響
