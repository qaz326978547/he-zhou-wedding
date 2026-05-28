# Feature Specification: 後台管理介面

**Feature Branch**: `002-admin-dashboard`
**Created**: 2026-05-28
**Status**: Implemented
**Couple**: HE Bean & Katherine Zhou

---

## Clarifications

### Session 2026-05-29

- Q: 後台新增 / 修改 RSVP 時，出席人數是否允許留空？ → A: 允許；adultCount 可為 null，表示「人數待確認」；後台 admin schema 允許 null；列表與卡片顯示「--」；公開前台表單驗證規則不受影響
- Q: 後台列表 API 載入失敗時，前端應如何顯示？ → A: 顯示「資料載入失敗，請重新整理頁面」錯誤提示；搜尋框與新增按鈕保持可用
- Q: RSVP v2 後人數欄位如何重構？ → A: 移除 guestCount、notes；新增 adultCount（大人人數）、childCount（小孩人數）、needsHighchair（是否需要兒童椅）、highchairCount（兒童椅幾張）、needsInvitation（是否需要紙本喜帖）、invitationName / invitationPhone / invitationAddress（收件資訊）；飲食偏好縮減為 regular / vegetarian 兩項

### Session 2026-05-28

- Q: 修改 RSVP 時編輯介面樣式為何？ → A: Inline 直接在表格列上編輯（每個欄位變 input，儲存後恢復顯示文字）
- Q: 後台列表頁是否顯示統計摘要？ → A: 顯示；包含總回覆筆數、總出席人數（guestCount 加總）（出席狀態欄位已隱藏，故不顯示出席筆數 / 不克出席筆數）
- Q: 列表是否需要搜尋 / 篩選功能？ → A: 支援前端即時搜尋（依姓名或電話關鍵字即時篩選，不需額外 API）
- Q: 後台是否需要支援行動裝置？ → A: 是；以手機版順暢度為主（Mobile-First），PC 版一目瞭然；手機用卡片佈局，桌機用完整表格
- Q: 新增 RSVP 的表單呈現方式為何？ → A: Modal 彈窗（點擊「新增」按鈕後開啟彈窗，填寫完送出後關閉）

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

1. **Given** 主辦人已登入，**When** 進入後台首頁，**Then** MUST 顯示所有 RSVP 提交紀錄，每筆資料包含：編號、姓名、電話、大人幾位（adultCount）、小孩幾位（childCount）、兒童椅（needsHighchair / highchairCount）、賓桌歸屬、關係類型、飲食偏好（葷食 / 素食）、紙本喜帖（needsInvitation）、提交時間（UTC+8）、通知信發送狀態（出席狀態欄位於後台 UI 隱藏，但資料仍儲存於資料庫）。
2. **Given** 主辦人在列表頁，**When** 點擊「新增」，**Then** MUST 開啟 Modal 彈窗顯示新增表單；填寫並送出後 Modal 關閉，新資料 MUST 即時出現在列表中。
3. **Given** 主辦人在某筆 RSVP 旁點擊「修改」，**When** 該列進入 inline 編輯模式（各欄位變為 input），主辦人修改後點擊「儲存」，**Then** 列表中該筆資料 MUST 即時更新並恢復為文字顯示。
4. **Given** 主辦人點擊某筆 RSVP 的「刪除」，**When** 確認刪除，**Then** 該筆資料 MUST 從列表與資料庫中移除。
5. **Given** RSVP 資料超過 20 筆，**When** 主辦人瀏覽列表，**Then** MUST 支援分頁或全量顯示（v1 預計最多 200 筆，全量顯示即可）。

---

### Edge Cases

- 主辦人同時在兩個裝置登入（兩個 session 均有效，不互相踢出）
- 刪除後立即重整頁面（資料確實消失）
- 修改時電話號碼改為已存在的另一筆（後端驗證拒絕，顯示重複錯誤）
- 直接輸入 `/admin/rsvp` 等後台子路由未登入時（MUST 導向登入頁）
- 後台 API 未攜帶有效 token 時直接呼叫（MUST 回傳 401）
- 後台列表 API 回應失敗（網路錯誤、5xx）時，顯示錯誤提示，不誤導主辦人以為 RSVP 資料為空
- 後台新增 / 修改時 adultCount 留空（null）應正常儲存，統計計算時視為 0

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

#### FR-A005 RSVP 列表與統計摘要
後台首頁 MUST 在列表上方顯示統計摘要卡片，包含：
- 總回覆筆數（所有 RSVP 提交數量）
- 總出席人數（adultCount + childCount 加總）

統計數字由前端從已載入的列表資料即時計算（不需額外 API）。adultCount / childCount 為 null 的紀錄，計算總出席人數時視為 0。

若 API 載入失敗，MUST 顯示「資料載入失敗，請重新整理頁面」錯誤提示；搜尋框與「新增 RSVP」按鈕保持可用。

列表上方 MUST 提供即時搜尋輸入框，依姓名或電話號碼關鍵字即時篩選列表（前端 computed，不呼叫額外 API）；無符合結果時顯示「找不到符合的紀錄」。

列表 MUST 顯示所有 `RSVPSubmission` 資料，欄位包含：id、name、phone、adultCount（大人）、childCount（小孩）、needsHighchair（兒童椅）、highchairCount（幾張）、relationshipSide、relationshipType、dietaryPreference（regular / vegetarian）、needsInvitation、invitationName / invitationPhone / invitationAddress（當 needsInvitation = true 時）、createdAt（UTC+8）、notificationEmailSent。出席狀態（attending）欄位儲存於資料庫但不顯示於後台 UI。

#### FR-A006 新增 RSVP
主辦人點擊「新增」MUST 開啟 Modal 彈窗，表單欄位為（name、phone、adultCount、childCount、needsHighchair、highchairCount、relationshipSide、relationshipType、dietaryPreference、needsInvitation、invitationName / invitationPhone / invitationAddress）；attending 欄位不顯示於表單，預設為 true；adultCount 欄位可留空（null），表示人數待確認，列表顯示「--」；childCount 預設 0；needsHighchair 於 childCount > 0 時顯示；highchairCount 於 needsHighchair = true 時顯示；invitationName / invitationPhone / invitationAddress 於 needsInvitation = true 時顯示；送出成功後 MUST 自動關閉 Modal 並將新資料插入列表頂端；後端對 admin 路由允許 adultCount 為 null（公開前台驗證規則不變）；點擊 Modal 外部或「取消」按鈕可關閉 Modal（未送出的資料不儲存）。

#### FR-A007 修改 RSVP
主辦人 MUST 可修改任一筆 RSVP 的可見欄位；點擊「修改」後該列進入 inline 編輯模式，各欄位直接在表格列上變為可編輯 input；可編輯欄位為（name、phone、adultCount、childCount、needsHighchair、highchairCount、relationshipSide、relationshipType、dietaryPreference、needsInvitation、invitationName / invitationPhone / invitationAddress），attending 欄位不顯示於編輯介面（送出時保留原值）；adultCount 欄位可清空（null），表示人數待確認；needsHighchair 僅於 childCount > 0 時顯示；highchairCount 僅於 needsHighchair = true 時顯示；invitationName / invitationPhone / invitationAddress 僅於 needsInvitation = true 時顯示；點擊「儲存」送出後恢復文字顯示（null 顯示為「--」）；點擊「取消」放棄修改回復原始內容；後端 MUST 驗證修改後資料的合法性；電話改為已存在的號碼時 MUST 回傳錯誤。

#### FR-A008 刪除 RSVP
主辦人 MUST 可刪除任一筆 RSVP；刪除前 MUST 顯示確認對話框，確認後資料從資料庫永久移除。

#### FR-A009 後台 API 保護
所有後台 API（`/api/admin/*`）MUST 驗證請求攜帶有效 JWT token；無效或過期 token MUST 回傳 HTTP 401。

#### FR-A010 後台不影響前台
後台功能 MUST 與前台婚禮網站完全獨立；後台操作（含刪除）MUST NOT 影響前台正常運作。

#### FR-A011 匯出 CSV
主辦人 MUST 可點擊「匯出 CSV」按鈕，下載包含所有 RSVP 資料的 CSV 檔案；檔名格式為 `RSVP_YYYYMMDD.csv`；CSV 欄位包含：編號、姓名、電話、大人幾位、小孩幾位、兒童椅（含張數）、賓桌歸屬、關係類型、飲食偏好、紙本喜帖、收件人、收件電話、收件地址、提交時間（UTC+8）、通知信已發送；檔案末段附統計摘要區塊（總回覆筆數、總出席人數）；檔案加 UTF-8 BOM 確保 Excel 正確顯示中文。匯出資料以前端已載入的完整列表為來源（不需額外 API）。

### Key Entities

- **AdminSession（無持久化）**：主辦人登入 token；JWT 無狀態，儲存於前端；無需資料庫欄位
- **RSVPSubmission（既有）**：複用現有 schema，後台新增 `PUT`（修改）與 `DELETE` 操作。RSVP v2 後欄位如下：name、phone、attending、adultCount（Int?）、childCount（Int?）、needsHighchair（Boolean?）、highchairCount（Int?）、relationshipSide、relationshipType、dietaryPreference（regular / vegetarian）、needsInvitation（Boolean）、invitationName / invitationPhone / invitationAddress（String?）、notificationEmailSent / notificationEmailSentAt / notificationEmailError、createdAt。後台 admin 路由允許 adultCount 為 null；公開前台路由驗證規則（attending 時 adultCount 必填）不變。

---

## Success Criteria

### Measurable Outcomes

- **SC-A001**：主辦人可在 30 秒內完成登入並看到完整 RSVP 列表
- **SC-A002**：未攜帶有效 token 的後台 API 請求 100% 回傳 401，不洩漏資料
- **SC-A003**：新增、修改、刪除操作完成後，列表 MUST 在不需手動重整的情況下即時反映變更
- **SC-A004**：後台功能對前台婚禮網站（`https://hezhouwedding.com`）零影響，前台所有功能正常運作
- **SC-A005**：後台在 375px（iPhone SE）至 1440px（桌機）寬度範圍內完整可用；手機版卡片佈局，所有操作按鈕觸控區域 ≥ 44×44px；桌機版表格一覽所有欄位

---

## Assumptions

- 帳號密碼以明文儲存於環境變數（`ADMIN_CREDENTIALS`），v1 可接受；未來版本再改用 bcrypt hash
- v1 不需要操作紀錄（audit log）或分角色權限；兩位主辦人權限完全相同
- 後台採 Mobile-First 設計，手機版（< 768px）以卡片佈局呈現每筆 RSVP，桌機版（≥ 768px）以完整表格呈現
- Vue Router 的 `/admin` 路由在前台 SPA 中以 navigation guard 保護；後端負責 API 層保護
- JWT secret 儲存於後端環境變數 `JWT_SECRET`；v1 使用對稱式簽名（HS256）
- 後台不發送電子郵件通知（僅資料庫操作）
- 後台 UI 採簡潔表格樣式，不需符合前台韓系婚禮視覺風格

---

## Out of Scope（v1）

- 後台角色權限分級（兩位主辦人權限相同）
- 操作紀錄（audit log）
- 批次刪除
- 忘記密碼 / 修改密碼功能
- 後台黑暗模式
