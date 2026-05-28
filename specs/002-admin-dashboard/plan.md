# 實作計畫：後台管理介面

**Branch**: `002-admin-dashboard` | **Date**: 2026-05-28 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-admin-dashboard/spec.md`

## 摘要

為婚禮網站新增後台管理介面，讓主辦人（bean / zhou）可透過 `https://hezhouwedding.com/admin` 登入後查看、新增、修改、刪除所有 RSVP 回覆。採 JWT 身份驗證（HS256，24 小時有效），帳號密碼儲存於後端環境變數。前端加入 Vue Router，`/admin/*` 路由由 navigation guard 保護。

---

## 技術環境

**Language/Version**: TypeScript 5.x；Node.js 20 LTS（同既有）
**Primary Dependencies（新增）**:
- Backend：`jsonwebtoken`、`@types/jsonwebtoken`
- Frontend：`vue-router@4`

**Storage**: PostgreSQL（既有，不新增資料表）
**Testing**: 無自動化測試（v1 同既有，手動驗證）
**Target Platform**: Zeabur（同既有）；前端需確認 SPA fallback 設定
**Performance Goals**: 後台 API 回應 < 500ms；RSVP 列表（最多 200 筆）一次全量載入
**Constraints**: 帳號密碼 v1 明文環境變數；JWT secret ≥ 32 字元
**Scale/Scope**: 2 位主辦人；RSVP 最多 200 筆

---

## 憲章合規檢查（Constitution Check）

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 語言一致性 | ✅ 通過 | 所有 spec/task/API 文件使用繁體中文；程式碼保留英文 |
| II. 全端 Monorepo 架構 | ✅ 通過 | 沿用 `frontend/` + `backend/` 結構；新增 `/api/admin/*` 路由；前端加入 vue-router |
| III. API 設計規範 | ✅ 通過 | 後台路由使用 `/api/admin/` 前綴；RESTful；CORS 設定不變；API 文件完整 |
| IV. 漸進式規格工作流 | ✅ 通過 | 已完成 constitution → specify → plan；待 tasks → analyze → implement |
| V. 模組化與最小化原則 | ✅ 通過 | 新增獨立 middleware/routes/controller/views 目錄；既有元件零修改（除 main.ts 加 router） |

---

## 專案結構

### 規格文件（此 feature）

```text
specs/002-admin-dashboard/
├── plan.md              # 本文件
├── research.md          # Phase 0 研究記錄
├── data-model.md        # Phase 1 資料模型
├── quickstart.md        # Phase 1 本地開發入門
├── contracts/
│   └── api.md           # Phase 1 API 合約
└── tasks.md             # Phase 2 產出（/speckit-tasks）
```

### 原始碼新增路徑

```text
backend/
└── src/
    ├── middleware/
    │   └── adminAuth.ts          # JWT 驗證 middleware（新增）
    ├── routes/
    │   └── admin.ts              # /api/admin/* 路由（新增）
    ├── controllers/
    │   └── adminController.ts    # login + RSVP CRUD（新增）
    └── validation/
        └── adminRsvpSchema.ts    # Zod schema for admin RSVP（新增）

frontend/
└── src/
    ├── router/
    │   └── index.ts              # Vue Router 設定（新增）
    ├── views/
    │   └── admin/
    │       ├── AdminLogin.vue    # 登入頁（新增）
    │       └── AdminDashboard.vue # RSVP 管理列表（新增）
    └── services/
        └── adminApi.ts           # Admin Axios 實例 + interceptors（新增）

# 既有檔案最小化修改：
frontend/src/main.ts              # 新增 app.use(router)
backend/src/app.ts                # 新增 import adminRouter + app.use('/api/admin', adminRouter)
backend/.env.example              # 新增 JWT_SECRET、ADMIN_CREDENTIALS
```

**結構決策**：沿用 Option 2（Web application），既有 frontend/ + backend/ 結構完全不動，僅新增必要檔案。

---

## 實作規格補充

### 後端 adminAuth middleware

```typescript
// backend/src/middleware/adminAuth.ts
import jwt from 'jsonwebtoken'

export function adminAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: '請先登入' })
  }
  try {
    jwt.verify(auth.slice(7), process.env.JWT_SECRET!)
    next()
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token 已過期或無效，請重新登入' })
  }
}
```

### 後端登入邏輯

```typescript
// backend/src/controllers/adminController.ts（login）
const credentials = JSON.parse(process.env.ADMIN_CREDENTIALS!)
if (credentials[username] !== password) {
  return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: '帳號或密碼錯誤' })
}
const token = jwt.sign({ username }, process.env.JWT_SECRET!, { expiresIn: '24h' })
res.json({ data: { token, username } })
```

### 前端 Navigation Guard

```typescript
// frontend/src/router/index.ts
router.beforeEach((to, _from, next) => {
  const isAdminRoute = to.path.startsWith('/admin') && to.path !== '/admin/login'
  const token = localStorage.getItem('admin_token')
  if (isAdminRoute && !token) return next('/admin/login')
  next()
})
```

### AdminDashboard.vue 功能

- 初始化時呼叫 `GET /api/admin/rsvp` 載入全部列表
- **Mobile-First RWD 佈局**：
  - 手機（< 768px）：每筆 RSVP 以卡片呈現（姓名、電話、出席狀態、人數、提交時間），卡片底部放修改 / 刪除按鈕（≥ 44×44px 觸控區域）
  - 桌機（≥ 768px）：完整 `<table>` 顯示所有欄位，每列 inline 編輯
- 列表上方：統計摘要（出席筆數、不出席筆數、總出席人數）+ 搜尋輸入框（姓名或電話即時篩選）
- **Inline 編輯**（桌機）：點「修改」→ 該列各欄位變 `<input>`，提供「儲存」與「取消」按鈕；手機卡片點「修改」→ 展開 inline 欄位於卡片內
- 刪除前顯示 `window.confirm()` 確認
- 「新增」按鈕開啟 Modal 彈窗（含完整表單欄位）；送出成功後自動關閉 Modal，新資料插入列表頂端；點擊 Modal 外部或「取消」可關閉
- 操作成功後重新呼叫 `GET /api/admin/rsvp` 更新列表（含統計重算）
- 登出按鈕：清除 `localStorage.admin_token` → `router.push('/admin/login')`
