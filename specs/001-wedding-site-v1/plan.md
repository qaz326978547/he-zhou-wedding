# 實作計畫：婚禮邀請網站 v1

**Branch**: `001-wedding-site-v1` | **Date**: 2026-05-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-wedding-site-v1/spec.md`

## 摘要

建置 Bean & Katherine 婚禮邀請 SPA 網站，提供完整婚禮資訊瀏覽（7 個區塊 + Footer）、線上 RSVP 回覆（含 IP 速率限制、重複偵測、Email 通知）、背景音樂播放控制、LINE 官方帳號整合，以及 OG 社群分享支援。採 Vue 3 + Node.js + PostgreSQL 全端 Monorepo 架構，部署於 Zeabur 平台。

---

## 技術環境

**Language/Version**: TypeScript 5.x（前後端均使用）；Node.js 20 LTS
**Primary Dependencies**:
- Frontend：Vue 3.4+、Vite 5+、Tailwind CSS 3.x、Axios、@vueuse/core
- Backend：Express 4.x、Prisma 5.x、Zod、express-rate-limit、Resend SDK
**Storage**: PostgreSQL 16（Zeabur 管理服務）；Prisma ORM 操作資料庫
**Testing**: 無自動化測試框架（v1 以手動測試 + Prisma Studio 驗證為主）
**Target Platform**: Zeabur 雲端平台；Frontend → Static Site；Backend → Node.js Service
**Project Type**: Web application（Frontend SPA + Backend REST API）
**Performance Goals**: 首頁在 4G 連線下 3 秒內完成首次渲染（SC-003）；倒數計時誤差 ≤ 1 秒
**Constraints**: RSVP 提交 < 200 筆（不需分頁）；後端 IP 速率限制 5 次/小時
**Scale/Scope**: 140–180 位賓客；無需水平擴展；單一主辦人帳號

---

## 憲章合規檢查（Constitution Check）

*GATE：執行 Phase 0 研究前 MUST 通過；Phase 1 設計後 MUST 重新確認。*

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 語言一致性 | ✅ 通過 | 所有 spec/task/API 文件使用繁體中文；程式碼與技術名詞保留英文 |
| II. 全端 Monorepo 架構 | ✅ 通過 | `frontend/`（Vue 3 + Vite）+ `backend/`（Node.js + Express + PostgreSQL + Prisma）；API URL 透過 `VITE_API_BASE_URL` 注入；後端埠號讀取自 `process.env.PORT` |
| III. API 設計規範 | ✅ 通過 | 所有路由使用 `/api` 前綴；RESTful 設計；CORS 允許 `https://hezhouwedding.com`；API 文件以繁體中文撰寫於 `contracts/api.md` |
| IV. 漸進式規格工作流 | ✅ 通過 | 已完成 constitution → specify → clarify → plan；待 tasks → analyze → implement |
| V. 模組化與最小化原則 | ✅ 通過 | 元件依職責分層（sections/layout/ui）；composables 封裝業務邏輯；每次 commit 對應單一邏輯單元 |

**Phase 1 後重新確認**：

| 原則 | 狀態 | 說明 |
|------|------|------|
| II. Monorepo 架構 | ✅ 通過 | `data-model.md` 確認 Prisma schema 與 PostgreSQL 相容；環境變數設計符合憲章要求 |
| III. API 設計規範 | ✅ 通過 | `contracts/api.md` 完整定義 `/api/rsvp`、`/api/rsvp/status`、`/api/health`；CORS origin 設定確認 |

**複雜度說明（Complexity Tracking）**：無憲章違規；不需額外說明。

---

## 專案結構

### 規格文件（此 feature）

```text
specs/001-wedding-site-v1/
├── plan.md              # 本文件（/speckit-plan 產出）
├── research.md          # Phase 0 研究決策記錄
├── data-model.md        # Phase 1 資料模型定義
├── quickstart.md        # Phase 1 本地開發快速入門
├── contracts/
│   └── api.md           # Phase 1 API 合約文件
└── tasks.md             # Phase 2 產出（/speckit-tasks 指令產生）
```

### 原始碼結構（Repository Root）

```text
frontend/                            # Vue 3 + Vite + TypeScript + Tailwind CSS
├── public/
│   └── assets/
│       ├── hero/                    # 主視覺圖片（WebP）
│       ├── story/                   # 愛情故事時間軸圖片
│       ├── gallery/                 # 相片牆圖片
│       ├── music/                   # 背景音樂檔案（mp3/ogg）
│       ├── og/                      # Open Graph 分享圖（1200×630px）
│       ├── line/                    # LINE QR Code 圖片
│       └── ui/                      # 介面通用圖示
├── src/
│   ├── components/
│   │   ├── sections/                # HeroSection, CountdownSection, CalendarSection,
│   │   │                            # TimelineSection, InfoSection, GallerySection, RsvpSection
│   │   ├── layout/                  # AppHeader（若有）, AppFooter（含 LINE 按鈕）
│   │   └── ui/                      # Button, Input, MusicToggle, LineButton, LoadingSpinner
│   ├── composables/                 # useCountdown, useIntersectionObserver,
│   │                                # useRsvp, useBackgroundMusic
│   ├── services/
│   │   └── api.ts                   # Axios 封裝（VITE_API_BASE_URL）
│   ├── types/                       # TypeScript 型別定義（RsvpPayload, ApiResponse）
│   ├── constants/                   # 婚禮靜態資料（日期、地點、故事里程碑）
│   ├── App.vue
│   └── main.ts
├── index.html                       # OG / Twitter Card meta tags
├── .env.example
└── vite.config.ts

backend/                             # Node.js + Express + TypeScript
├── prisma/
│   └── schema.prisma                # RSVPSubmission model
├── src/
│   ├── routes/
│   │   └── rsvp.ts                  # /api/rsvp, /api/rsvp/status, /api/health
│   ├── controllers/
│   │   └── rsvpController.ts
│   ├── services/
│   │   └── emailService.ts          # Resend SDK 整合（非同步）
│   ├── middleware/
│   │   ├── cors.ts                  # CORS（允許 hezhouwedding.com）
│   │   ├── rateLimiter.ts           # express-rate-limit（5 次/IP/小時）
│   │   └── errorHandler.ts
│   ├── validation/
│   │   └── rsvpSchema.ts            # Zod schema
│   └── app.ts
├── .env.example
└── package.json

specs/                               # Spec Kit 規格文件（不計入原始碼）
└── 001-wedding-site-v1/
```

**結構決策**：採 Option 2（Web application），`frontend/` + `backend/` 兩個子專案共存於 monorepo 根目錄，符合憲章原則 II。
