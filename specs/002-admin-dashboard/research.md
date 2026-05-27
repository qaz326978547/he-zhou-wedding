# 研究記錄：後台管理介面

**Feature**: `002-admin-dashboard`
**Date**: 2026-05-28

---

## 決策 1：前端路由方案

**Decision**: 在現有 SPA 加入 `vue-router@4`，使用 **history mode**（`/admin`、`/admin/login`）

**Rationale**:
- History mode 提供最乾淨的 URL（無 `#`），符合 `/admin` 路徑需求
- Zeabur Static Site 支援 SPA fallback（所有路由回落至 `index.html`）
- Navigation guard 在前端實作路由保護，JWT 有效性由後端 API 層保護

**Alternatives Considered**:
- Hash mode（`/#/admin`）：URL 較醜，且非需求指定格式，排除
- 獨立 `admin.html` 頁面：不符合 SPA 架構原則，排除

---

## 決策 2：JWT 認證方案

**Decision**: 後端用 `jsonwebtoken` 套件簽發 HS256 JWT，前端存於 `localStorage`

**Rationale**:
- HS256 對稱簽名適合單一後端服務，實作簡單
- `localStorage` 易於讀寫，v1 規模（僅兩位主辦人）無 XSS 高風險場景
- Token 有效期 24 小時，符合主辦人日常使用習慣

**Alternatives Considered**:
- `httpOnly cookie`：需額外設定 CORS credentials，增加複雜度；v1 排除
- RS256 非對稱簽名：需管理公私鑰對，v1 不需要；排除

---

## 決策 3：帳號密碼儲存格式

**Decision**: 後端環境變數 `ADMIN_CREDENTIALS` 儲存 JSON 字串

```
ADMIN_CREDENTIALS={"bean":"bean","zhou":"zhou"}
```

**Rationale**:
- 明文儲存於環境變數，v1 可接受（僅內部使用，Zeabur Dashboard 存取受保護）
- JSON 格式易於在 Node.js 以 `JSON.parse()` 解析，不需額外套件
- 未來可直接改為 bcrypt hash 值，不需修改解析邏輯結構

**Alternatives Considered**:
- 硬寫程式碼：違反憲章（機密值不得提交版本控制）；排除
- bcrypt hash：v1 可接受明文；未來版本升級

---

## 決策 4：後台 API 結構

**Decision**: 新增 `/api/admin/*` 路由群，使用獨立 router 與 `adminAuth` middleware

| Method | Path | 說明 |
|--------|------|------|
| POST | `/api/admin/login` | 登入，回傳 JWT |
| GET | `/api/admin/rsvp` | 查詢所有 RSVP |
| POST | `/api/admin/rsvp` | 新增 RSVP |
| PUT | `/api/admin/rsvp/:id` | 修改 RSVP |
| DELETE | `/api/admin/rsvp/:id` | 刪除 RSVP |

**Rationale**:
- 獨立 `/api/admin/` 前綴清楚區隔公開 API 與後台 API
- `adminAuth` middleware 集中處理 JWT 驗證，不重複實作

---

## 決策 5：前台影響最小化

**Decision**: Vue Router 以 `createWebHistory()` 初始化；`/`（首頁）維持現有 App.vue 渲染，`/admin/*` 載入後台元件

**Rationale**:
- 現有 `App.vue` 完整保留，不修改任何 Section 元件
- 新增 `src/router/index.ts`、`src/views/admin/` 目錄，與現有結構完全獨立
- `main.ts` 僅新增 `app.use(router)`，變更最小

---

## 決策 6：Zeabur SPA Fallback

**Decision**: Zeabur Static Site 預設支援 SPA fallback，無需額外 `_redirects` 設定檔

**Rationale**:
- Zeabur 文件確認靜態網站部署支援 SPA 路由（所有未知路徑回落 `index.html`）
- 若部署後 `/admin` 直接訪問出現 404，可在 Zeabur Dashboard → Frontend → Settings 開啟 SPA mode
