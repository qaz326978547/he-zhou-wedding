# Release Gate Checklist: 後台管理介面

**Purpose**: 上線前全領域需求品質把關（Security + UX/Interaction + API），驗證規格的完整性、清晰度與一致性，不驗證實作行為
**Created**: 2026-05-29
**Feature**: [spec.md](../spec.md)
**Depth**: Release Gate（完整盤點）
**Audience**: 功能審查 + 上線前把關

---

## Security Requirements Quality

- [x] CHK001 FR-A003 中 token 儲存機制是否已確定為唯一選項（localStorage 或 httpOnly cookie）而非「二選一」？目前規格列出兩個選項，實際決策未記錄。[Ambiguity, Spec §FR-A003]
  - ✓ 已解決：確認使用 `localStorage`（key: `admin_token`）；httpOnly cookie 明確排除；XSS 風險已記錄於 Assumptions
- [ ] CHK002 是否定義 JWT token 過期後的使用者體驗需求（mid-session 過期時前端行為）？規格僅說 24 小時有效，未述及自動導回登入頁或靜默刷新策略。[Gap, Spec §FR-A003]
- [ ] CHK003 是否有登入嘗試頻率限制的需求定義（brute force / rate limiting）？規格未提及帳號鎖定或 429 保護。[Gap, Spec §FR-A002]
- [ ] CHK004 HTTPS 是否明確列為必要需求？規格未見明文聲明（雖部署環境隱含），但安全需求應顯式記錄。[Gap]
- [ ] CHK005 CORS 允許來源、方法、標頭的需求是否在規格中明確定義？目前僅在 plan.md 提及，spec.md 未見。[Gap]
- [ ] CHK006 後台 API 請求攜帶無效 token 時，錯誤回應需求是否已細化到 token 過期（401）vs token 格式錯誤（401）的區分？[Clarity, Spec §FR-A009]
- [ ] CHK007 JWT secret 最低長度需求（≥32 字元）是否已從 plan.md 補充至 spec.md 的 Assumptions 或 Constraints 區塊？[Consistency, Spec §Assumptions]
- [ ] CHK008 兩個 session 同時有效的需求是否有對應的安全考量文字（JWT 無狀態設計的取捨是否已記錄）？[Assumption, Spec §Edge Cases]

---

## UX / Interaction Requirements Quality

- [ ] CHK009 條件顯示欄位（needsHighchair 在 childCount > 0 時出現、highchairCount 在 needsHighchair = true 時出現、收件資訊在 needsInvitation = true 時出現）的觸發規則是否在規格中完整定義？[Completeness, Spec §FR-A006, FR-A007]
- [ ] CHK010 後台新增 Modal 各欄位的預設值是否全部明確規定（adultCount 留空、childCount = 0、needsHighchair = null、needsInvitation = false）？[Clarity, Spec §FR-A006]
- [ ] CHK011 inline 編輯模式下，條件欄位（highchairCount、收件資訊）在值改變後的顯示 / 隱藏行為是否已指定？[Coverage, Spec §FR-A007]
- [ ] CHK012 列表初始載入中（loading）的 UI 需求是否定義（skeleton、spinner 或其他佔位符）？[Gap, Spec §FR-A005]
- [ ] CHK013 新增 / 修改 / 刪除操作執行中的 loading 狀態需求是否定義（按鈕禁用文字或 spinner）？[Gap, Spec §FR-A006, FR-A007, FR-A008]
- [ ] CHK014 刪除操作的確認對話框需求是否包含確認文字內容規定（例如顯示賓客姓名以防誤刪）？[Clarity, Spec §FR-A008]
- [ ] CHK015 搜尋輸入框是否定義 debounce 或即時篩選的行為規格（字元數門檻、延遲毫秒數）？[Clarity, Spec §FR-A005]
- [ ] CHK016 手機版卡片佈局中，條件欄位（兒童椅張數、收件資訊）的顯示規則是否明確？[Coverage, Spec §FR-A005]
- [ ] CHK017 後台 UI 的無障礙需求（鍵盤導航、ARIA 標籤、焦點管理）是否已定義或明確排除？[Gap]
- [ ] CHK018 inline 編輯模式是否定義欄位驗證錯誤的顯示規格（錯誤訊息位置、出現時機）？[Clarity, Spec §FR-A007]
- [ ] CHK019 Modal 送出失敗（409 重複電話、400 驗證錯誤）時的前端呈現需求是否明確定義？[Coverage, Spec §FR-A006]

---

## API Requirements Quality

- [ ] CHK020 contracts/api.md 中的 POST /api/admin/rsvp（新增）與 PUT /api/admin/rsvp/:id（修改）的請求 schema 是否已更新至 RSVP v2 欄位（adultCount、childCount、needsHighchair、highchairCount、needsInvitation、invitationName/Phone/Address）？[Consistency, Spec §Key Entities]
- [ ] CHK021 API 合約中 adultCount 為 null 的合法情境是否有明確說明（admin 路由允許 null，前台路由不允許），避免文件與實作不一致？[Clarity, Spec §FR-A006]
- [ ] CHK022 後台 API 是否定義 rate limiting 需求（如每分鐘最大請求數）？目前合約與規格均無記錄。[Gap]
- [ ] CHK023 後台 API 的逾時需求（request timeout）是否已定義？規格提及「< 500ms」效能目標，但未說明超時時的行為。[Gap, Spec §plan.md Performance Goals]
- [ ] CHK024 PUT /api/admin/rsvp/:id 的回應是否定義需返回完整更新後的 RSVPSubmission 物件？需求未明確（前端列表即時更新依賴此回應）。[Clarity, Spec §FR-A007]
- [ ] CHK025 DELETE /api/admin/rsvp/:id 的成功回應格式是否定義（204 無內容 vs 200 含確認訊息）？[Clarity]
- [ ] CHK026 CSV 匯出功能為前端純客戶端操作，此設計決策是否在規格中明確記錄（排除後端 export API 的理由）？[Assumption, Spec §FR-A011]
- [ ] CHK027 API 錯誤碼 `INTERNAL_ERROR`（500）的範圍是否定義（何種情況觸發），是否需要前端呈現特定訊息？[Clarity]

---

## Data Model Requirements Quality

- [ ] CHK028 highchairCount（兒童椅張數）的有效範圍（1–10）是否在規格 Key Entities 或 FR 中明確定義，而不僅存在於實作的 Zod schema？[Completeness, Spec §Key Entities]
- [ ] CHK029 needsInvitation = false 時，invitationName / invitationPhone / invitationAddress 的資料庫狀態需求是否定義（null 覆蓋 vs 保留舊值）？[Clarity, Spec §FR-A007]
- [ ] CHK030 dietaryPreference 欄位的有效選項（regular / vegetarian 僅兩項）是否在規格中明確列出，確保 RSVP v2 移除其他選項的決策已被記錄？[Completeness, Spec §Key Entities]
- [ ] CHK031 RSVPSubmission 的 phone 欄位唯一性約束是否在規格中記錄（作為業務規則，而非僅存於 Prisma schema）？[Completeness, Spec §Key Entities]

---

## Non-Functional Requirements Quality

- [ ] CHK032 SC-A001「30 秒內完成登入並看到完整 RSVP 列表」的測量方法是否定義（從哪個時間點起算，包含網路延遲還是純伺服器時間）？[Measurability, Spec §SC-A001]
- [ ] CHK033 後台 API 回應「< 500ms」效能目標是否涵蓋 RSVP 列表端點在 200 筆資料量下的需求？[Clarity, plan.md §Performance Goals]
- [ ] CHK034 SC-A004「前台零影響」的驗證標準是否定義（如何量測「零影響」）？[Measurability, Spec §SC-A004]
- [ ] CHK035 後台功能在網路不穩定（slow 3G）環境下的行為需求是否定義或明確排除？[Coverage]

---

## Release Readiness

- [ ] CHK036 Zeabur SPA fallback（直接訪問 /admin 不 404）的需求是否已在規格或 tasks 中記錄為必要驗收條件？[Completeness]
- [ ] CHK037 生產環境 Prisma migration（RSVP v2 欄位）的執行策略是否記錄在 spec / quickstart 中，確保部署流程不遺漏？[Completeness]
- [ ] CHK038 規格中是否定義後台功能的回滾策略（若上線後發現問題，如何在不影響前台的情況下回退）？[Gap]
- [ ] CHK039 後台帳號密碼（bean/bean、zhou/zhou）的 v1 明文環境變數安全假設，是否有對應的 v2 升級計畫記錄（或明確聲明 v1 永久接受此風險）？[Assumption, Spec §Assumptions]
- [ ] CHK040 RSVP v2 schema 變更（移除 guestCount / notes、新增多個欄位）是否有向後相容性說明（既有資料遷移策略）？[Completeness]

---

## Notes

- 以 `[x]` 標記已確認通過的項目
- 發現問題時，在該項目下方加上說明及對應的 spec 修改建議
- **優先處理** CHK001（token 儲存機制歧義）、CHK003（brute force Gap）、CHK020（RSVP v2 API contract 更新）
- Release Gate 通過標準：所有 CRITICAL 項目（CHK001、CHK003、CHK020）必須通過或明確接受風險；其餘 Gap 項目可於 v2 處理
