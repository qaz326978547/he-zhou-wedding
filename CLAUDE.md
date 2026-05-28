<!-- SPEC KIT START -->

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at:
`specs/002-admin-dashboard/plan.md`

For local development setup, see: `specs/002-admin-dashboard/quickstart.md`
For API contracts, see: `specs/002-admin-dashboard/contracts/api.md`
For data model, see: `specs/002-admin-dashboard/data-model.md`

<!-- SPEC KIT END -->

# Project Rules

## 語言規則

- 所有 spec 文件必須使用繁體中文（zh-TW）
- 所有 task 說明必須使用繁體中文
- 所有 API 文件必須使用繁體中文
- 所有回覆與規格內容請使用台灣繁體中文
- 保留程式碼與技術名詞英文

---

## 專案資訊

- 專案名稱：HE Bean & Katherine Zhou Wedding
- 正式網址：https://hezhouwedding.com

---

## 技術架構

### Frontend

- Vue 3
- Vite
- SPA 架構
- Axios
- 使用 .env 管理 API URL
- 使用 VITE_API_BASE_URL

### Backend

- Node.js
- Express
- PostgreSQL
- Prisma ORM

### Deployment

- 使用 Zeabur
- frontend 為靜態網站
- backend 為 Node.js service
- backend 必須使用 process.env.PORT

---

## Monorepo Structure

```txt
frontend/
backend/
```

---

## API 規則

- API prefix 統一為 `/api`
- API 使用 RESTful 設計
- backend 必須支援 CORS
- frontend domain：
  - https://hezhouwedding.com

---

## 開發規則

- 優先維持模組化
- 不要一次修改過多檔案
- 不要修改無關檔案
- 實作前先確認 spec 與 task
- 優先小步驟 commit

---

## Assets 規則

靜態資產請統一放置於：

```txt
frontend/public/assets/
```

分類：

```txt
hero/
story/
gallery/
music/
og/
line/
ui/
```

---

## Spec Workflow

請遵循以下流程：

1. `/speckit.constitution`
2. `/speckit.specify`
3. `/speckit.clarify`
4. `/speckit.plan`
5. `/speckit.tasks`
6. `/speckit.analyze`
7. `/speckit.implement`

未完成 spec 與 tasks 前，不要直接大量實作。