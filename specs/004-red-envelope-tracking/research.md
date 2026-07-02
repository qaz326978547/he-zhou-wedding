# 研究記錄：紅包登記功能

**Phase 0** — 本 feature 技術情境沿用既有 `001-wedding-site-v1` 與 `002-admin-dashboard` 的技術棧與架構模式，Technical Context 無 `NEEDS CLARIFICATION` 項目。以下記錄關鍵技術決策與理由。

---

## 決策 1：資料庫模型獨立於 RSVPSubmission

**Decision**: 新增獨立 Prisma model `RedEnvelopeEntry`（id、name、amount、createdAt），不與既有 `RSVPSubmission` 建立關聯（外鍵）。

**Rationale**: spec.md Assumptions 明確指出紅包登記與 RSVP 為兩個獨立情境（現場登記多由接待人員協助，賓客無需重複輸入電話等身份識別資訊）；建立關聯需要額外比對邏輯與 UX 設計，超出 v1 範疇。

**Alternatives considered**:
- 於 `RSVPSubmission` 新增 `redEnvelopeAmount` 欄位：會混淆兩個不同時間點、不同輸入者的資料來源，且違反 spec 已確認的「不阻擋重複、不做身份比對」決策。
- 建立關聯但允許 null 外鍵：徒增複雜度，v1 無明確使用情境。

---

## 決策 2：後台身份驗證沿用既有 JWT 機制

**Decision**: `/admin/red-envelope` 前端路由與 `/api/admin/red-envelope` 後端 API 完全沿用 `002-admin-dashboard` 已實作的 `adminAuth` middleware 與前端 `router.beforeEach` navigation guard，不新增任何登入系統。

**Rationale**: 憲章原則 V（模組化與最小化原則）要求最小化變更；既有機制已驗證可用（`bean`/`zhou` 帳號、JWT 24 小時有效期），紅包登記與 RSVP 管理同屬「主辦人限定」情境，權限模型完全相同。

**Alternatives considered**:
- 為紅包功能新增獨立權限層級：v1 兩位主辦人權限本就相同，無分權需求（spec Out of Scope 已排除角色權限分級）。

---

## 決策 3：匯出格式採用前端 CSV（UTF-8 BOM），非後端產生 .xlsx

**Decision**: 匯出功能於前端純 JavaScript 組出 CSV 字串（加 UTF-8 BOM），比照 `AdminDashboard.vue` 既有 `exportCsv()` 實作，不引入 `exceljs` 或 `xlsx` 等套件、不新增後端匯出 API。

**Rationale**: 既有 `002-admin-dashboard` FR-A011「匯出 CSV」已驗證此模式可被 Excel 正常開啟且中文不亂碼，使用者需求「匯出 Excel」的核心訴求（可用 Excel 開啟、資料完整、中文正確）已滿足；沿用既有模式符合憲章最小化原則，避免新增套件依賴與後端負擔。

**Alternatives considered**:
- 後端使用 `exceljs` 產生原生 `.xlsx`：需新增套件依賴、新增後端匯出端點與檔案串流處理，複雜度提升但使用者實際需求（Excel 可開啟）已被 CSV 方案滿足，故不採用。

---

## 決策 4：賓客提交防護沿用既有 RSVP rate limiter

**Decision**: `POST /api/red-envelope` 掛載既有 `rsvpRateLimiter`（每 IP 每小時 5 次），不新增獨立的 rate limiter 設定。

**Rationale**: spec.md Assumptions 明確「v1 不需要防止惡意灌爆資料的複雜機制，僅需與現有 RSVP 表單相同等級的基本保護」；`/qr` 網址僅提供婚宴現場掃碼使用，不會公開宣傳，風險與 RSVP 表單相當。

**Alternatives considered**:
- 獨立設定更嚴格的 rate limit（例如每小時 3 次）：現場可能由同一接待人員的同一 IP 連續登記多筆（賓客排隊交付紅包），過嚴的限制反而阻礙正常使用情境，故採用與 RSVP 相同的寬鬆度。

---

## 所有 NEEDS CLARIFICATION 已解決

- 後台紅包紀錄編輯／刪除：需要，比照 RSVP 後台 inline 編輯模式（spec.md Clarifications）
- 重複提交防護：不阻擋，全部保留計入加總（spec.md Clarifications）
