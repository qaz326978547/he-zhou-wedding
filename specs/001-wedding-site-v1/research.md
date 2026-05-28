# Phase 0 研究記錄：婚禮邀請網站 v1

**Feature**: `001-wedding-site-v1`
**Date**: 2026-05-17
**Status**: Complete — 所有 NEEDS CLARIFICATION 已解決

---

## DR-001：前端框架選擇

**決策**：Vue 3 Composition API + Vite + TypeScript

**理由**：
- 憲章原則 II 明確規定 Frontend MUST 使用 Vue 3 + Vite
- Composition API 配合 `<script setup>` 語法，使 composable 封裝（useCountdown、useBackgroundMusic）更直觀
- TypeScript 提供型別安全，降低 runtime 錯誤風險

**考慮替代方案**：React、Nuxt 3；因憲章約束排除

---

## DR-002：CSS 框架

**決策**：Tailwind CSS 3.x + 自定義設計 Token

**理由**：
- Utility-first 方式適合電影感黑金設計（無預設元件風格干擾）
- 自定義 `tailwind.config.js` 設定主色 `#0D0D0D`（黑）、`#C9A96E`（金），確保全站視覺一致
- 響應式斷點（sm: 375px、md: 768px、lg: 1280px）與 Mobile-First 設計原則契合

**考慮替代方案**：純 CSS Modules、UnoCSS；Tailwind 生態系更成熟，文件豐富

---

## DR-003：滾動動畫觸發機制

**決策**：Intersection Observer API（封裝為 `useIntersectionObserver` composable）

**理由**：
- 不依賴 scroll event listener，效能優於 `window.addEventListener('scroll', ...)`
- 可精確控制 `threshold` 與 `rootMargin`，實現元素進入視窗時才觸發動畫
- 瀏覽器原生 API，無需額外套件；所有現代瀏覽器均支援

**考慮替代方案**：GSAP ScrollTrigger（過重，v1 不需複雜動畫序列）；Vue-ScrollReveal（廢棄維護）

---

## DR-004：背景音樂 Autoplay Policy 處理策略

**決策**：首次使用者互動後呼叫 `audio.play()`，捕捉 Promise rejection 保持靜音

**實作模式**：
```typescript
const events = ['click', 'touchstart', 'keydown', 'wheel']
const handleFirstInteraction = async () => {
  events.forEach(e => document.removeEventListener(e, handleFirstInteraction))
  try {
    await audio.value?.play()
    isPlaying.value = true
  } catch {
    // Autoplay Policy 阻擋時靜默失敗，不顯示錯誤
  }
}
events.forEach(e => document.addEventListener(e, handleFirstInteraction, { once: true }))
```

**理由**：
- Chrome、Safari、Firefox 的 Autoplay Policy 均要求使用者互動後才可呼叫 `audio.play()`
- `audio.play()` 回傳 Promise；`.catch(() => {})` 靜默處理阻擋情境
- 切換按鈕始終可見（`position: fixed`），確保賓客可手動控制

**考慮替代方案**：直接 `autoplay` attribute（被現代瀏覽器封鎖）；`muted` + `autoplay`（音樂播放需有聲，muted 無意義）

---

## DR-005：電子郵件服務

**決策**：Resend SDK，非同步發送（fire-and-forget），結果回寫資料庫

**實作模式**：
```
POST /api/rsvp
  1. 驗證輸入（Zod）
  2. 寫入 PostgreSQL（Prisma）
  3. 回傳 201 給前端（不等待 Email）
  4. 非同步呼叫 emailService.sendAdminNotification()
  5. 發送結果更新 notificationEmailSent / notificationEmailError
```

**理由**：
- 假設 `spec.md` — Email 服務使用 Resend，寄件網域 `hezhouwedding.com`
- 非同步發送確保 Email 服務逾時不影響 RSVP API 回應時間（SC-006：60 秒內送達，與 API 回應解耦）
- 狀態回寫支援主辦人透過 Prisma Studio 稽核發送狀態

**考慮替代方案**：同步等待 Email 發送（延遲 API 回應，使用者體驗差）；SendGrid（憲章無限制，但 Resend 對 TypeScript 支援更佳）

---

## DR-006：IP 速率限制

**決策**：`express-rate-limit` 套件，5 次/IP/小時，記憶體存儲

**設定**：
```typescript
import rateLimit from 'express-rate-limit'
export const rsvpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 5,
  message: { error: 'RATE_LIMITED', message: '提交過於頻繁，請稍後再試' },
  standardHeaders: true,
  legacyHeaders: false,
})
```

**理由**：
- 預估 140–180 筆有效提交；速率限制防止惡意刷表不影響正常賓客（一般賓客僅提交 1 次）
- 記憶體存儲（MemoryStore）對單一 Node.js 實例已足夠；v1 不需 Redis
- 憲章原則 V：最簡實作優先

**考慮替代方案**：Redis + 分散式速率限制（過度設計，v1 單一 Node.js 實例）

---

## DR-007：輸入驗證

**決策**：Zod（後端）+ 前端自定義驗證邏輯

**台灣電話號碼正規表達式**：
```
/^09\d{8}$|^0[2-9]\d{7,8}$/
```
- 手機：`09` 開頭，共 10 碼（例：0912345678）
- 市話：`0` + 區碼（2–9），共 8–10 碼（例：0223456789、02234567890 不合法）

**Zod Schema 要點**：
```typescript
const rsvpSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^09\d{8}$|^0[2-9]\d{7,8}$/),
  attending: z.boolean(),
  guestCount: z.number().int(),
  relationshipSide: z.enum(['groom', 'bride']).optional(),
  relationshipType: z.enum(['relative', 'friend']).optional(),
  dietaryPreference: z.enum(['regular', 'vegetarian', 'no_beef', 'no_pork', 'other']).default('regular'),
  notes: z.string().max(300).optional(),
}).refine(data => {
  if (data.attending) return data.guestCount >= 1 && data.guestCount <= 10
  return data.guestCount === 0
}, { message: '出席人數範圍無效' })
.refine(data => {
  if (data.relationshipType && !data.relationshipSide) return false
  return true
}, { message: 'relationshipSide 為空時不得設定 relationshipType' })
```

**理由**：
- Zod 提供 TypeScript 型別推斷（`z.infer<typeof rsvpSchema>`），前後端型別共享
- 後端驗證不依賴前端，防止繞過前端直接 POST

---

## DR-008：ORM 與資料庫

**決策**：Prisma 5.x + PostgreSQL 16（Zeabur 管理服務）

**理由**：
- 憲章原則 II 明確規定 MUST 使用 PostgreSQL + Prisma ORM
- Zeabur 平台提供 PostgreSQL 管理服務，`DATABASE_URL` 由平台自動注入
- Prisma Studio 作為 v1 Admin 工具（FR-015），無需另行開發後台

**考慮替代方案**：SQLite（資料持久性風險）；MySQL（Zeabur 支援但憲章指定 PostgreSQL）

---

## DR-009：LINE 整合方式

**決策**：純 URL 跳轉（`https://line.me/R/ti/p/@516hdace`），不使用 LINE API

**行動裝置行為**：LINE 深層連結（deep link）在安裝 LINE 的裝置自動喚起 App；未安裝時由瀏覽器導向 App Store 或 LINE 網頁版
**桌機行為**：開啟 LINE 網頁版加入頁面；賓客可掃描 QR Code（`frontend/public/assets/line/`）

**理由**：
- v1 排除 LINE Login、LINE Bot、LINE Messaging API（out of scope）
- 純連結跳轉零額外後端負擔；`target="_blank"` 確保在新分頁開啟

---

## DR-010：Open Graph 社群分享

**決策**：靜態 meta tags 硬編碼於 `index.html`（SPA，無 SSR）

**標籤清單**：
```html
<meta property="og:title" content="HE Bean & Katherine Zhou 婚禮邀請 · 2026.11.14" />
<meta property="og:description" content="我們誠摯邀請您蒞臨觀禮，見證這美好時刻。" />
<meta property="og:image" content="https://hezhouwedding.com/assets/og/og-cover.jpg" />
<meta property="og:url" content="https://hezhouwedding.com" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

**理由**：
- SPA 無伺服器渲染，爬蟲讀取 `index.html` 的靜態 meta tags
- LINE/Facebook 爬蟲均支援靜態 OG tags，無需 SSR
- 圖片尺寸 1200×630px 符合各平台推薦規格

---

## DR-011：Zeabur 部署策略

**Frontend（Static Site）**：
- Build command: `npm run build`
- Output directory: `dist`
- 靜態資產由 Zeabur CDN 提供服務

**Backend（Node.js Service）**：
- Start command: `npm run start`（TypeScript 編譯後執行）
- 環境變數由 Zeabur Dashboard 設定（不提交至版本控制）
- `process.env.PORT` 由平台注入

**Database（PostgreSQL）**：
- Zeabur 管理服務，`DATABASE_URL` 由平台自動注入至 backend
- Prisma Migration 於部署前手動執行或透過 start script 自動執行

**所有 NEEDS CLARIFICATION 已解決**：
- 電話格式：台灣手機 + 市話（DR-007）
- 婚禮時間：2026-11-14 12:00 UTC+8（spec.md FR-003）
- OG meta tags：靜態 index.html 方案（DR-010）
- guestCount 上限：10（spec.md FR-008）
- 成功畫面持續性：Vue 元件記憶體狀態（spec.md FR-012）
- 音樂循環：loop attribute（spec.md FR-020）
