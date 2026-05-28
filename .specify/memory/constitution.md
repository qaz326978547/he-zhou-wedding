<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.2 → 1.1.0
Modified principles: none renamed
Modified sections: none
Added sections: VI. 文件同步原則 (Documentation Synchronization Principle)
Removed sections: none
Templates updated:
  - .specify/templates/plan-template.md ✅ (無涉及文件同步規則，無需修改)
  - .specify/templates/spec-template.md ✅ (無涉及文件同步規則，無需修改)
  - .specify/templates/tasks-template.md ✅ (無涉及文件同步規則，無需修改)
  - CLAUDE.md ✅ (已有 Spec Workflow 說明，與本次新增原則一致)
Deferred TODOs: none
-->

# HE Bean & Katherine Zhou Wedding Constitution

## Core Principles

### I. 語言一致性 (Language Consistency)

所有 spec 文件、task 說明、API 文件及回覆內容 MUST 使用台灣繁體中文（zh-TW）撰寫。
程式碼、技術名詞、套件名稱、框架名稱 MUST 保留英文原文，不得翻譯。
混用語言時，技術識別碼優先以英文呈現，說明文字以繁體中文補充。

### II. 全端 Monorepo 架構 (Full-Stack Monorepo Architecture)

專案 MUST 以 monorepo 結構維護，根目錄下分為 `frontend/` 與 `backend/` 兩個子專案。
Frontend MUST 使用 Vue 3 + Vite 構建 SPA；API base URL MUST 透過環境變數 `VITE_API_BASE_URL` 注入，禁止硬編碼。
Backend MUST 使用 Node.js + Express，資料層 MUST 使用 PostgreSQL 搭配 Prisma ORM；埠號 MUST 讀取自 `process.env.PORT`。

### III. API 設計規範 (API Design Standards)

所有 API 路由 MUST 統一使用 `/api` 前綴。
API 設計 MUST 遵循 RESTful 原則。
Backend MUST 啟用 CORS，並允許前端網域 `https://hezhouwedding.com` 存取。
新增或變更 API 時，MUST 同步更新對應的繁體中文 API 文件。

### IV. 漸進式規格工作流 (Incremental Spec Workflow)

每項功能 MUST 依序完成以下流程才能進行大量實作：
`/speckit-constitution` → `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement`

未完成 spec 與 tasks 前，禁止直接大量實作。
每個步驟的產出物 MUST 存放於 `specs/[###-feature-name]/` 目錄下。

### V. 模組化與最小化原則 (Modularity and Minimalism)

功能實作 MUST 優先維持模組化，每次變更 MUST 限縮於相關檔案，禁止修改無關檔案。
Commit MUST 以小步驟進行，每個 commit 對應一個邏輯單元。
複雜度提升 MUST 有明確的業務理由；無充分理由時 MUST 選擇最簡實作。

### VI. 文件同步原則 (Documentation Synchronization Principle)

任何需求變更、功能調整、欄位變更、API 變更、資料庫 schema 變更、驗證邏輯變更、前後台流程變更，MUST 同步更新相關 Spec Kit markdown 文件。

當需求變更時，MUST 先檢查並更新以下文件（視變更範圍而定）：
`spec.md`、`plan.md`、`tasks.md`、`research.md`、`data-model.md`、`contracts/*`、`quickstart.md`；若變更影響專案原則，亦須更新 `constitution.md`。

執行規則：
1. 禁止只修改程式碼而不更新對應文件。
2. 禁止在相關 `.md` 文件同步完成前進入 implement。
3. 每次需求變更時，MUST 先列出受影響文件清單。
4. 每次需求變更時，MUST 列出影響分析，涵蓋 frontend、backend、database、API、validation、admin、deployment 是否受影響。
5. `tasks.md` MUST 與最新 `spec.md` 和 `plan.md` 保持一致。
6. API contract 或 data model 有變更時，`contracts/*` 與 `data-model.md` MUST 同步更新。
7. 使用者要求「只更新文件」時，完成 markdown 更新後 MUST 停止，不得實作程式碼。
8. 更新 `tasks.md` 時，MUST 保留仍有效的已完成任務，移除不再適用的任務，新增本次變更所需任務。

## 部署架構 (Deployment Architecture)

專案部署於 [Zeabur](https://zeabur.com) 平台：

- **Frontend**: 部署為靜態網站（Static Site），正式網址為 `https://hezhouwedding.com`
- **Backend**: 部署為 Node.js Service，埠號 MUST 使用 `process.env.PORT`
- 所有環境變數 MUST 於 Zeabur 平台設定，禁止將機密值提交至版本控制

## 資產管理 (Asset Management)

所有靜態資產 MUST 統一放置於 `frontend/public/assets/`，並依下列分類整理：

```
frontend/public/assets/
├── hero/      # 首頁主視覺圖片（WebP 建議）
├── story/     # 愛情故事時間軸圖片
├── gallery/   # 相片牆圖片
├── music/     # 背景音樂檔案（MP3/OGG）
├── og/        # Open Graph 社群分享圖（1200×630px）
├── line/      # LINE 官方帳號 QR Code 圖片
└── ui/        # 介面通用圖示
```

禁止將靜態資產散落於其他目錄，亦禁止直接引用外部 URL 作為正式資產。

## Governance

本憲章為本專案所有開發決策的最高準則，效力凌駕其他文件與慣例。
憲章修訂 MUST 依 Semantic Versioning 遞增版本號，並於 `LAST_AMENDED_DATE` 記錄修訂日期。
所有 PR 審查 MUST 驗證是否符合本憲章各原則。
版本號規則：MAJOR 對應原則移除或不相容變更；MINOR 對應新增原則或重大擴充；PATCH 對應措辭釐清或非語義修正。
執行期開發指引請參閱 `CLAUDE.md`。

**Version**: 1.1.0 | **Ratified**: 2026-05-12 | **Last Amended**: 2026-05-29
