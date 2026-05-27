# Feature Specification: 後台管理介面

**Feature Branch**: `002-admin-dashboard`
**Created**: 2026-05-28
**Status**: Draft
**Couple**: HE Bean & Katherine Zhou

---

## Clarifications

（待 /speckit-clarify 補充）

---

## 專案概覽

為婚禮網站主辦人提供後台管理介面，可透過 `https://hezhouwedding.com/admin` 存取。
登入後可查看所有賓客 RSVP 回覆資料，並支援新增、修改、刪除功能。
僅限兩位主辦人（Bean、Zhou）使用，使用帳號密碼驗證身份。

---

## User Scenarios & Testing

### User Story 1 — 主辦人登入後台（Priority: P1）

主辦人輸入帳號密碼後進入後台，看到所有賓客 RSVP 資料列表。

**Why this priority**: 登入是所有後台功能的前提；未完成此故事，其他功能無法進行。

**Independent Test**: 前往 `https://hezhouwedding.com/admin`，輸入正確帳號密碼，確認成功進入後台並看到 RSVP 資料列表；直接訪問 `/admin` 未登入時 MUST 導向登入頁。

**Acceptance Scenarios**:

1. **Given** 主辦人前往 `/admin`，**When** 未登入，**Then** MUST 自動導向登入頁面（`/admin/login`），不顯示任何 RSVP 資料。
2. **Given** 主辦人在登入頁輸入正確帳號密碼（`bean/bean` 或 `zhou/zhou`），**When** 點擊登入，**Then** MUST 跳轉至 RSVP 資料列表頁，並顯示所有提交紀錄。
3. **Given** 主辦人輸入錯誤帳號或密碼，**When** 點擊登入，**Then** MUST 顯示「帳號或密碼錯誤」提示，不進入後台。
4. **Given** 主辦人已登入，**When** 關閉瀏覽器後重新開啟 `/admin`，**Then** 若 session 未過期，MUST 直接進入後台，不需重新登入。
5. **Given** 主辦人在後台，**When** 點擊登出按鈕，**Then** MUST 清除登入狀態並導向登入頁。

---

### User Story 2 — 查看與管理 RSVP 資料（Priority: P2）

主辦人登入後可瀏覽所有賓客回覆，並進行新增、修改、刪除操作。

**Why this priority**: 這是後台的核心功能，讓主辦人掌握出席人數與餐飲需求。

**Independent Test**: 登入後台後，確認列表顯示所有 RSVP 資料；新增一筆測試資料確認出現在列表；修改後確認欄位更新；刪除後確認記錄消失。

**Acceptance Scenarios**:

1. **Given** 主辦人已登入，**When** 進入後台首頁，**Then** MUST 顯示所有 RSVP 提交紀錄，每筆資料包含：編號、姓名、電話、出席狀態、出席人數、賓桌歸屬、關係類型、飲食偏好、備註、提交時間（UTC+8）、通知信發送狀態。
2. **Given** 主辦人在列表頁，**When** 點擊「新增」，**Then** MUST 顯示新增表單，填寫並送出後，新資料 MUST 出現在列表中。
3. **Given** 主辦人在某筆 RSVP 旁點擊「修改」，**When** 完成編輯並儲存，**Then** 列表中該筆資料 MUST 即時更新。
4. **Given** 主辦人點擊某筆 RSVP 的「刪除」，**When** 確認刪除，**Then** 該筆資料 MUST 從列表與資料庫中移除。
5. **Given** RSVP 資料超過 20 筆，**When** 主辦人瀏覽列表，**Then** MUST 支援分頁或全量顯示（v1 預計最多 200 筆，全量顯示即可）。

---

### Edge Cases

- 主辦人同時在兩個裝置登入（兩個 session 均有效，不互相踢出）
- 刪除後立即重整頁面（資料確實消失）
- 修改時電話號碼改為已存在的另一筆（後端驗證拒絕，顯示重複錯誤）
- 直接輸入 `/admin/rsvp` 等後台子路由未登入時（MUST 導向登入頁）
- 後台 API 未攜帶有效 token 時直接呼叫（MUST 回傳 401）

---

## Requirements

### Functional Requirements

#### FR-A001 後台路由保護
系統 MUST 在所有 `/admin` 子路由加入身份驗證守衛；未登入時 MUST 導向 `/admin/login`，不暴露任何 RSVP 資料。

#### FR-A002 帳號密碼登入
系統 MUST 支援兩組固定帳號登入：
- 帳號 `bean`，密碼 `bean`
- 帳號 `zhou`，密碼 `zhou`

帳號密碼 MUST 儲存於後端環境變數（`ADMIN_CREDENTIALS`），不得硬寫於程式碼。
驗證成功後 MUST 發給前端 JWT token，token 有效期 24 小時。

#### FR-A003 Session 保持
JWT token MUST 儲存於前端（localStorage 或 httpOnly cookie）；有效期內重新開啟 `/admin` MUST 自動進入後台，不需重新登入。

#### FR-A004 登出
主辦人點擊登出後，MUST 清除前端 token 並導向 `/admin/login`。

#### FR-A005 RSVP 列表
後台首頁 MUST 顯示所有 `RSVPSubmission` 資料，欄位包含：id、name、phone、attending、guestCount、relationshipSide、relationshipType、dietaryPreference、notes、createdAt（UTC+8）、notificationEmailSent。

#### FR-A006 新增 RSVP
主辦人 MUST 可新增 RSVP 資料，欄位與前台 RSVP 表單一致（name、phone、attending、guestCount、relationshipSide、relationshipType、dietaryPreference、notes）；後端 MUST 執行相同的資料驗證規則（電話格式、guestCount 範圍等）。

#### FR-A007 修改 RSVP
主辦人 MUST 可修改任一筆 RSVP 的任何欄位；後端 MUST 驗證修改後資料的合法性；電話改為已存在的號碼時 MUST 回傳錯誤。

#### FR-A008 刪除 RSVP
主辦人 MUST 可刪除任一筆 RSVP；刪除前 MUST 顯示確認對話框，確認後資料從資料庫永久移除。

#### FR-A009 後台 API 保護
所有後台 API（`/api/admin/*`）MUST 驗證請求攜帶有效 JWT token；無效或過期 token MUST 回傳 HTTP 401。

#### FR-A010 後台不影響前台
後台功能 MUST 與前台婚禮網站完全獨立；後台操作（含刪除）MUST NOT 影響前台正常運作。

### Key Entities

- **AdminSession（無持久化）**：主辦人登入 token；JWT 無狀態，儲存於前端；無需資料庫欄位
- **RSVPSubmission（既有）**：複用現有 schema，後台新增 `PUT`（修改）與 `DELETE` 操作

---

## Success Criteria

### Measurable Outcomes

- **SC-A001**：主辦人可在 30 秒內完成登入並看到完整 RSVP 列表
- **SC-A002**：未攜帶有效 token 的後台 API 請求 100% 回傳 401，不洩漏資料
- **SC-A003**：新增、修改、刪除操作完成後，列表 MUST 在不需手動重整的情況下即時反映變更
- **SC-A004**：後台功能對前台婚禮網站（`https://hezhouwedding.com`）零影響，前台所有功能正常運作

---

## Assumptions

- 帳號密碼以明文儲存於環境變數（`ADMIN_CREDENTIALS`），v1 可接受；未來版本再改用 bcrypt hash
- v1 不需要操作紀錄（audit log）或分角色權限；兩位主辦人權限完全相同
- 後台不需要 RWD/行動裝置支援；桌機瀏覽器為主要使用情境
- Vue Router 的 `/admin` 路由在前台 SPA 中以 navigation guard 保護；後端負責 API 層保護
- JWT secret 儲存於後端環境變數 `JWT_SECRET`；v1 使用對稱式簽名（HS256）
- 後台不發送電子郵件通知（僅資料庫操作）
- 後台 UI 採簡潔表格樣式，不需符合前台韓系婚禮視覺風格

---

## Out of Scope（v1）

- 後台角色權限分級（兩位主辦人權限相同）
- 操作紀錄（audit log）
- 後台行動裝置支援
- 批次刪除或匯出 CSV
- 忘記密碼 / 修改密碼功能
- 後台黑暗模式
