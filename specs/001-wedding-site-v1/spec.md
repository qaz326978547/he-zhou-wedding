# Feature Specification: 婚禮邀請網站 v1

**Feature Branch**: `001-wedding-site-v1`
**Created**: 2026-05-14
**Status**: Draft
**Couple**: HE Bean & Katherine Zhou
**Wedding Date**: 2026-11-14
**Official URL**: https://hezhouwedding.com

---

## Clarifications

### Session 2026-05-19

- Q: FR-002 Hero 最終排版格式為何？ → A: 更新 FR-002 反映最終實作：上方 font-script 手寫大標題（"We got Married"）固定於頂部；中間為清楚婚紗照（無文字覆蓋）；底部淡出區並排姓名（何啟賢／HE Bean、周羽薇／Katherine Zhou，左右並排加 `/` 分隔）+ 日期 + CTA。

### Session 2026-05-17

- Q: v1 是否需要在 RSVP 表單加入信箱欄位以發送賓客確認信？ → A: 不新增信箱欄位；僅發主辦人通知信，賓客以成功畫面作為確認。
- Q: RSVP 表單是頁面可捲動區塊還是 Modal / 獨立頁面？ → A: 頁面第七個可捲動區塊，緊接在相片牆之後；不使用 Modal 或獨立路由。
- Q: RSVP 表單是否需要截止日期機制？ → A: 由主辦人透過環境變數 `RSVP_ENABLED` 手動開關；`false` 時表單顯示「報名已截止」並停止接受提交，無自動日期截止邏輯。
- Q: 賓客選擇「不克出席」時，guestCount 應儲存為何值？ → A: 儲存為 `0`；前端自動帶入不顯示欄位；Schema 預設值從 1 改為 0。
- Q: 賓客以相同電話重複提交 RSVP 時，系統如何處理？ → A: 賓客端阻擋並顯示「已收到您的回覆」；主辦人透過後台工具（v1 為 Prisma Studio 直連資料庫）手動修改出席狀態，v1 不提供賓客自助修改。
- Q: v1 賓客照片上傳功能的儲存位置為何？ → A: 賓客照片上傳功能從 v1 範疇完整移除；照片上傳列為 Out of Scope，未來版本再行評估。
- Q: 預計邀請的賓客總人數大約是多少？ → A: 140–180 人；系統設計以此規模為基準，無需特殊擴展措施。
- Q: v1 RSVP 表單需要哪種防濫用保護？ → A: 後端 IP 速率限制，每個 IP 每小時最多提交 5 次；前端無額外改動。
- Q: 電話號碼格式驗證接受哪些格式？ → A: 台灣手機（09 開頭，10 碼）或市話（0x- 含縣市碼，8–9 碼）；其他格式視為無效。
- Q: 婚禮儀式 / 宴客開始時間為何（倒數計時目標時刻）？ → A: 2026-11-14 12:00（台灣時間 UTC+8）；倒數計時以此時刻為目標。
- Q: 網站是否需要支援 Open Graph 社群分享預覽（LINE / Facebook 分享時顯示圖片 + 標題）？ → A: 需要；加入 FR-018，在 index.html 加入 OG / Twitter Card meta tags，指定分享圖片與標題文字。
- Q: 賓客選擇「出席」時，一次 RSVP 可填寫的最大出席人數為多少？ → A: 最多 10 人；後端 MUST 驗證 guestCount ≤ 10，前端 MUST 限制輸入上限。
- Q: 賓客提交 RSVP 後滾動離開再返回 RSVP 區塊，應顯示什麼？ → A: 持續顯示成功確認畫面；整個 session 期間保持成功狀態，頁面刷新後才回復表單。
- Q: 背景音樂播放完畢後應如何處理？ → A: 循環播放（loop）；音樂結束後自動從頭播放，持續烘托氛圍。

---

## 專案概覽

本規格定義 Bean & Katherine 婚禮邀請網站 v1 的完整功能範疇。
網站為純 SPA（單頁應用程式），採白色明亮韓系電影感婚禮視覺風格，提供賓客瀏覽婚禮資訊、
線上 RSVP 回覆，以及自動化電子郵件通知等核心功能。

---

## User Scenarios & Testing

<!--
  用戶旅程依重要性排序。每個故事皆可獨立測試，代表一個可交付的 MVP 增量。
-->

### User Story 1 — 賓客瀏覽婚禮資訊頁面（Priority: P1）

賓客收到邀請後，透過手機或電腦開啟婚禮網站，以韓系電影感浪漫沉浸式體驗瀏覽婚禮完整資訊，
包含主視覺動畫、倒數計時、行事曆標示、愛情故事時間軸、婚宴地點與交通指引、相片牆，
以及可選擇開啟的背景音樂。整個瀏覽過程流暢無阻，不需登入或任何帳號。

**Why this priority**: 所有賓客的第一個接觸點；網站若無法瀏覽，其他功能毫無意義。P1 必先完成。

**Independent Test**: 開啟首頁 URL，在手機與桌機上完整滾動瀏覽所有區塊，確認所有資訊顯示正確、動畫正常運作、音樂切換按鈕始終可見；首次互動後音樂嘗試自動播放（或瀏覽器阻擋時保持靜音且無錯誤提示），即可視為通過。

**Acceptance Scenarios**:

1. **Given** 賓客在手機開啟網站首頁，**When** 頁面載入完成，**Then** 看到全螢幕清晰婚紗照片（照片完整可見，無大面積白霧遮蓋）、新人中英文並存姓名（何啟賢 / HE Bean、周羽薇 / Katherine Zhou，中文字級大於英文）、婚禮日期及 CTA 按鈕，並有柔和進場動畫；文字位於照片上方安全區，不遮住新人臉部。
2. **Given** 賓客滾動至倒數計時區塊，**When** 頁面渲染，**Then** 倒數計時顯示距 2026-11-14 12:00（UTC+8）的剩餘天數、小時、分鐘、秒數，並即時更新。
3. **Given** 賓客滾動至行事曆區塊，**When** 頁面渲染，**Then** 顯示 2026 年 11 月行事曆，11/14 以特殊樣式標示。
4. **Given** 賓客滾動至故事時間軸區塊，**When** 區塊進入視窗，**Then** 頁面切換至黑色電影沉浸式背景；四個里程碑（2019 初識、2021 初旅、2024 求婚、2026 婚禮）依序以 scroll reveal 動畫出現，每段含年份（手寫字體淡金色）、Kodak 底片框故事圖片、白色 / 灰白文字描述，並呈現 film grain 紋理與電影分鏡排版。
5. **Given** 賓客滾動至婚禮資訊區塊，**When** 頁面渲染，**Then** 顯示婚禮日期、地點名稱、完整地址、Google Maps 連結、交通資訊與注意事項。
6. **Given** 賓客滾動至相片牆區塊，**When** Swiper 輪播渲染，**Then** 以電影膠卷底片框樣式呈現婚紗照輪播；手機賓客可左右滑動切換，桌機賓客可拖曳或點擊箭頭切換；底部顯示 pagination dots；圖片使用 lazy loading；區塊背景延續黑色電影沉浸式風格。
7. **Given** 賓客在 375px 寬度手機上瀏覽，**When** 滾動任一區塊，**Then** 所有文字、圖片、按鈕皆完整顯示，無橫向捲動。
8. **Given** 賓客開啟婚禮網站，**When** 頁面載入完成，**Then** 固定浮動的音樂切換按鈕始終可見，預設靜音；賓客第一次與頁面互動（點擊、滑動、按鍵、捲動等任一操作）後，系統嘗試自動播放背景音樂；若瀏覽器允許，音樂開始播放並循環；若被阻擋，音樂保持靜音，不顯示錯誤，賓客可隨時點擊切換按鈕手動開啟；當次 session 音樂狀態持續保持。
9. **Given** 賓客滾動至頁面底部頁尾，**When** 頁尾渲染，**Then** 顯示 LINE 官方帳號加入按鈕；點擊後 MUST 在新分頁開啟 LINE 邀請頁面，行動裝置直接開啟 LINE App，桌機顯示加入頁面。

---

### User Story 2 — 賓客提交 RSVP（Priority: P2）

賓客在網站上填寫出席回覆表單，系統驗證並儲存資料後顯示成功畫面，
主辦人同時收到通知信。整個流程讓主辦人能即時掌握出席人數與餐飲需求。

**Why this priority**: 婚禮準備需要確認人數，這是網站最核心的互動功能。

**Independent Test**: 填寫完整表單並提交，確認資料出現在資料庫、主辦人信箱收到通知信、頁面顯示成功確認畫面。

**Acceptance Scenarios**:

1. **Given** 賓客點擊 CTA 按鈕或滾動至 RSVP 表單，**When** 表單顯示，**Then** 看到姓名、電話、出席狀態（出席/不克出席）、出席人數、賓桌歸屬（新郎親友/新娘親友，選填）、飲食偏好（一般/素食/不吃牛肉/不吃豬肉/其他，選填）、備註（選填，最多 300 字元）等欄位；賓桌歸屬下方初始不顯示關係類型。
2. **Given** 賓客填寫所有必填欄位並提交，**When** 系統驗證通過且資料儲存成功，**Then** 顯示成功確認畫面，內容包含：感謝訊息、婚禮日期（2026-11-14）、宴客地點名稱與地址、回到頁面頂端按鈕，以及 LINE 官方帳號邀請區塊（QR Code 圖片、加入按鈕、說明文字）；即使通知信發送失敗，成功畫面仍正常顯示；不發送賓客確認信。
3. **Given** 賓客留空必填欄位（姓名或電話）並提交，**When** 系統驗證，**Then** 在對應欄位旁顯示錯誤提示，表單不提交。
4. **Given** 賓客輸入非台灣手機（09xx）或市話格式的電話號碼並提交，**When** 系統驗證，**Then** 顯示電話格式錯誤提示，表單不提交。
5. **Given** 賓客已提交過 RSVP 後再次嘗試提交相同電話，**When** 系統偵測重複，**Then** 顯示提示訊息，告知已收到回覆。
6. **Given** RSVP 成功提交，**When** 主辦人查看信箱，**Then** 主辦人信箱收到通知信，內容包含：RSVP 編號、賓客姓名、電話、出席狀態、出席人數、賓桌歸屬、關係類型、飲食偏好、備註、提交時間（UTC+8）。
7. **Given** 賓客選擇賓桌歸屬（如「新郎親友」），**When** 選擇後，**Then** 表單在歸屬選項下方動態顯示關係類型選項（親屬 / 朋友）；若賓客未選擇歸屬，關係類型選項 MUST NOT 顯示。
8. **Given** 賓客點擊提交按鈕，**When** 表單資料正在送往伺服器，**Then** 提交按鈕 MUST 立即停用（disabled）並顯示載入狀態（轉圈動畫或「提交中…」文字），防止重複提交；API 回傳成功時切換至成功確認畫面；API 回傳錯誤時重新啟用按鈕並在表單上方顯示錯誤訊息，已填寫的表單內容 MUST NOT 清空。

---

### Edge Cases

**RSVP 邊界情境**：
- 賓客以相同電話號碼重複提交（系統偵測並提示，不重複新增）
- 必填欄位留空（顯示欄位層級錯誤提示）
- 電話號碼格式錯誤（顯示格式驗證錯誤）
- 出席人數為負數或超過 10（驗證：attending=true 時範圍 1–10；attending=false 時固定為 0，不開放輸入；前端限制輸入，後端回傳 400）
- 備註超過 300 字元（前端顯示即時字數計數，超限時阻止提交並顯示「備註最多 300 字元」提示）
- 提交時 `relationshipType` 有值但 `relationshipSide` 為空（後端驗證拒絕，回傳 400；前端 UX 設計應避免此情況發生）
- 表單提交途中網路斷線（顯示連線失敗提示，資料不儲存）
- 單一 IP 短時間內大量提交（IP 速率限制觸發，回傳 429 Too Many Requests，前端顯示提示訊息）
- 主辦人將 `RSVP_ENABLED` 設為 `false` 後仍有人嘗試提交（後端拒絕並回傳錯誤，前端顯示「報名已截止」）

**電子郵件邊界情境**：
- 電子郵件服務逾時 → RSVP 資料仍儲存，信件失敗不影響 RSVP 流程，後台記錄失敗
- 通知信發送失敗 → 賓客仍看到成功確認畫面（資料已儲存），主辦人可透過 Prisma Studio 查看發送狀態

**表單載入狀態邊界情境**：
- 提交按鈕點擊後再次點擊（按鈕已停用，請求僅送出一次，不重複提交）
- API 回傳非預期錯誤碼（重新啟用按鈕，顯示「提交失敗，請稍後再試」，不清空表單）
- 提交過程中切換頁籤後返回（按鈕狀態恢復至提交前，讓賓客重新提交）
- 賓客提交成功後滾動離開 RSVP 區塊再返回（成功確認畫面持續顯示，不回復空白表單）

**LINE 整合邊界情境**：
- 行動裝置未安裝 LINE（`line.me` URL 開啟後由瀏覽器處理，引導至 App Store 或網頁版）
- QR Code 圖片載入失敗（加入按鈕仍可點擊，不影響功能；圖片以 alt 文字或佔位符替代）

**背景音樂邊界情境**：
- 瀏覽器 Autoplay Policy 阻擋首次互動後的自動播放（音樂保持靜音，切換按鈕仍可見且可用，不顯示任何錯誤訊息；賓客可手動點擊按鈕開啟）
- 音樂檔案載入失敗（切換按鈕 MUST 仍然顯示並可點擊，點擊無播放效果；不顯示錯誤訊息，不影響頁面其他功能）
- 賓客重新整理頁面（音樂回到預設靜音狀態，不恢復上次播放）
- 賓客在首次互動前就點擊音樂切換按鈕（視為首次互動，嘗試播放音樂；邏輯與首次互動觸發一致）

---

## Requirements

### Functional Requirements

#### FR-001 首頁瀏覽
系統 MUST 提供完整的單頁婚禮邀請網站，包含以下七個主要區塊，依序呈現：
Hero、婚禮倒數計時、2026 年 11 月行事曆、愛情故事時間軸、婚禮資訊、相片牆、RSVP 表單。
七個區塊之後 MUST 呈現頁尾（Footer），包含 LINE 官方帳號加入按鈕。

#### FR-002 Hero 區塊
系統 MUST 在首頁頂部顯示全螢幕主視覺，採三段式排版結構：

**上方區（Top Zone）**：大型手寫英文標題（如 "We got Married"），使用 font-script 書法字體，固定於畫面頂部安全區（`padding-top ≥ 48px`），採 clip-path write-in 由左至右顯現動畫

**中間區（Photo Zone）**：全螢幕婚紗照片為視覺核心，完整、清楚、高清顯示；中間區域 MUST NOT 覆蓋任何文字，讓照片完整呈現

**底部區（Bottom Zone）**：新人中英文並排姓名、婚禮日期、CTA 按鈕，浮於底部 fade-out 漸層之上

必含元素：
- 全螢幕婚紗照片；照片 MUST 作為 Hero 主視覺核心，完整、清楚、高清顯示，不被遮罩霧化
- 非常淡的底部 fade-out 漸層（overlay 透明度 SHOULD 低於 5%），僅用於視覺銜接下一區塊
- 新人中文姓名（何啟賢 / 周羽薇），字級 MUST 大於英文姓名，位於底部並排姓名區
- 新人英文姓名（HE Bean / Katherine Zhou），使用極簡細顯示字體、全大寫、寬字距，位於對應中文姓名下方
- 大型手寫英文標題（如 "We got Married"），使用 font-script 書法字體，位於頂部
- 婚禮日期（2026 · 11 · 14），採極簡細字體排版，位於底部姓名區下方
- CTA 按鈕（引導至 RSVP 表單）
- 進場動畫效果（柔和淡入或 clip-path 手寫字顯現，MUST NOT 使用強烈衝擊式動畫）

**姓名格式 MUST**：
- 新人姓名 MUST 採左右並排格式，以 `/` 符號居中分隔：
  ```
  何啟賢  /  周羽薇
  HE Bean     Katherine Zhou
  ```
- 每位新人以中英文垂直成組：中文姓名在上（字級大，font-sans 或 font-serif CJK），英文姓名在下（字級小，全大寫，寬字距，font-display）
- 中文姓名字級 MUST 大於英文姓名
- `/` 分隔符號使用暖金色（`text-wedding-gold`），opacity SHOULD 低於 0.6

**照片清晰度 MUST**：
- 婚紗照片 MUST 完整、清楚、高清顯示，作為 Hero 主角
- MUST NOT 使用大面積白霧 overlay（導致照片霧化、泛白、失去細節）
- MUST NOT 使用 `backdrop-filter: blur` 或任何模糊效果
- overlay 透明度 SHOULD ≤ 0.05（即 `from-white/5` 等級），不可讓照片失去細節
- 僅允許底部極淡 fade-out，用於與下方區塊的視覺銜接

**文字可讀性 MUST**：
- 中文姓名 MUST 使用深灰黑或高對比深色（建議透明度 ≥ 0.85），確保在明亮照片上清楚可讀
- 英文手寫字可使用奶油金色（`text-wedding-gold`）或深灰色
- 主要文字透明度 MUST NOT 低於 0.80，不可因背景照片明亮而消失
- 可搭配極淡白色光暈（`text-shadow`）增加文字對比，MUST NOT 以白霧 overlay 取代字體本身對比

**文字位置 MUST**：
- 文字區塊 MUST 避免遮住新人臉部（人物臉部通常位於畫面中段至上段）
- Hero 容器使用 `justify-start` + `padding-top` 將文字錨定至畫面頂部安全區
- 文字應放置於照片上方留白區或不影響人物臉部的位置，且清楚可讀

**容器與字體防裁切 MUST**：
- 英文手寫字體容器 MUST 設定 `overflow: visible`（`overflow: hidden` 會裁切 Great Vibes 書法字的上緣筆畫）
- 英文手寫字 `<p>` 元素 MUST 設定足夠 `padding-top`（建議 ≥ 12px / `pt-3`），確保書法字上緣筆觸完整顯示

**中文字體策略**：
- 中文字型 MUST 使用 **Iansui（芫荽）**，字型檔存放於 `frontend/src/assets/fonts/Iansui-Regular.ttf`，以 `@font-face` 載入，`font-display: swap`
- CSS 變數 `--font-wedding-zh: 'Iansui', 'Noto Serif TC', serif` 定義於 `:root`，作為中文字型共用 token
- Tailwind token `font-wedding-zh` 對應相同字型堆疊，可於元件中透過 `class="font-wedding-zh"` 套用
- 以 `.wedding-site` CSS scope class 套用至所有前台頁面（`App.vue` 根元素）；`/admin`、`/admin/login` 頁面不套用
- 中文主姓名 SHOULD NOT 使用手寫字體，以維持可讀性（Iansui 為書法手寫風格，仍需確保可讀性）
- 英文大標題 / 書法裝飾元素使用 `Great Vibes, cursive`（`font-script`）
- `font-display` token 改為 `'Iansui', 'Noto Serif TC', serif`（與 `font-wedding-zh` 相同），用於標籤、小標、區塊說明等中文排版元素；不受 Great Vibes 書法字體影響

**視覺風格 MUST**：
- 大量留白（non-text-heavy layout，避免文字覆蓋滿版）
- 時尚雜誌封面感（Fashion Editorial Layout）；照片清楚、自然、明亮
- 文字高級、清晰、有層次；裝飾元素 MUST NOT 搶奪照片主角地位
- MUST NOT 使用深黑遮罩或深色全版背景
- MUST NOT 使用大面積白霧讓照片失去細節

#### FR-003 婚禮倒數計時
系統 MUST 顯示即時倒數計時器，計算距 2026-11-14 12:00（台灣時間 UTC+8，宴客開始時間）剩餘的天、時、分、秒，
每秒更新；目標時刻到達後 MUST 顯示慶賀訊息，停止倒數。

#### FR-004 行事曆區塊
系統 MUST 顯示 2026 年 11 月完整行事曆，並以特殊視覺樣式標示 11/14 婚禮日（愛心或圓形圈選樣式）。

**視覺風格 MUST**：
- 極簡白色日曆設計（白底，細線格線）
- 婚禮日期（11/14）以愛心（♥）或圓形特殊樣式圈選，採用柔和暖色調強調
- 半透明玻璃感卡片（glass morphism effect，白霧透明底）
- SHOULD 搭配柔和背景照片作為卡片後景，維持整體明亮輕透氛圍
- MUST NOT 使用深色背景或高對比深色格線

#### FR-005 愛情故事時間軸

系統 MUST 將愛情故事時間軸呈現為**黑色電影沉浸式區域**，與整站白色明亮主風格形成刻意的視覺對比，
打造情感敘事沉浸感。此區塊為 FR-022 局部例外，詳見 FR-022「局部黑色電影感區塊」。

**內容結構**：
垂直時間軸，依序包含四個里程碑：
- 2019：初識
- 2021：初次旅行
- 2024：求婚
- 2026：婚禮

每個里程碑 MUST 包含：年份標題（手寫英文字體，淡金色）、故事圖片（置於 Kodak 底片框內）、文字描述。

**視覺風格 MUST**：
- 區塊背景 MUST 使用黑色或深灰黑（`#0D0D0D`～`#1A1A1A`）；MUST NOT 於此區塊使用白色或奶油白底色
- Film grain texture overlay（靜態噪點紋理疊加，模擬底片顆粒感，opacity 低於 0.08，不干擾閱讀）
- 底片框採 Kodak film strip 風格：黑色外框 + 頂端底端膠捲齒孔（sprocket holes）細節
- 文字色系：主文字白色（`#FFFFFF`）、次要文字灰白（`rgba(255,255,255,0.65)`）、年份與標題淡金色（`#C9A96E`）
- 年份以 `font-script` 手寫字體呈現，搭配淡金色，電影分鏡字幕感
- 整體排版 SHOULD 呈現電影故事分鏡感（cinematic storyboard layout）：奇偶里程碑左右交錯排列

**動畫 MUST**：
- 各里程碑使用 scroll reveal 觸發（Intersection Observer API，threshold 0.15）
- 動畫效果：`fade in` + `slow slide in`（從下方緩慢滑入，transition-duration 700ms～900ms）
- 動畫觸發後保持可見（observe-once 模式，不重複播放）
- MUST NOT 使用快速彈跳、強烈縮放、3D 旋轉等炫技動畫

#### FR-006 婚禮資訊區塊
系統 MUST 顯示婚宴詳細資訊，包含：
- 婚禮日期與時間（2026-11-14 12:00 UTC+8）
- 宴客地點名稱：**全國大飯店 2F**
- 完整地址：**台灣臺中市西區館前路 57 號**
- Google Maps 外部連結（`https://maps.app.goo.gl/CQz5TGweR5N8CgsQA`）；點擊 MUST 以 `target="_blank" rel="noopener noreferrer"` 開啟新分頁
- 交通資訊（停車、大眾運輸；v1 使用 placeholder，婚禮前更新）
- 注意事項（v1 使用 placeholder，當日流程透過 LINE 官方帳號通知）

#### FR-007 相片牆

> **目前狀態**：`GallerySwiperSection` 暫時隱藏（`App.vue` 中已 comment out），等待相片就緒後恢復。功能規格保留。

系統 MUST 以 Swiper.js 輪播呈現婚禮精選相片，於黑色電影膠卷氛圍中展示。
此區塊為 FR-022 局部例外，詳見 FR-022「局部黑色電影感區塊」。

**技術規格 MUST**：
- 使用 `swiper` npm 套件（Swiper.js）實作輪播，元件名稱為 `GallerySwiperSection`
- 圖片 MUST 套用電影膠卷底片框（Kodak film strip 黑色外框 + 頂端底端齒孔細節，與 FR-005 視覺一致）
- 支援手機觸控左右滑動（touch swipe）
- 支援桌機拖曳（grab cursor）以及左右箭頭按鈕切換
- 顯示 pagination dots（指示當前位置）
- 圖片來源：`frontend/public/assets/gallery/`，預設檔名 `photo-1.jpg` … `photo-6.jpg`（可調整）
- 圖片 MUST 使用 lazy loading（`loading="lazy"` 屬性）

**視覺風格 MUST**：
- 區塊背景與 TimelineSection 相同：黑色 / 深灰黑色系，保持電影沉浸感視覺延續
- 底片框樣式與 TimelineSection FR-005 一致（統一 film strip 視覺語言）
- 箭頭按鈕與 pagination dots 使用淡金色（`#C9A96E`）或白色，配合黑色背景

**行為規格 MUST**：
- 支援無縫循環（loop mode）
- Mobile-first：手機每次顯示 1 張完整圖片
- 桌機 SHOULD 顯示 1～1.2 張（slidesPerView 1.2，讓下一張稍微露出，引導滑動）
- 自動播放（autoplay）預設關閉，不自動輪播

**行為規格 MUST NOT**：
- MUST NOT 使用 coverflow、cube、flip 等 3D 炫技輪播效果
- v1 不提供 lightbox 全螢幕放大功能
- v1 不使用 srcset 響應式圖片（Swiper lazy load 已涵蓋效能需求）

#### FR-008 RSVP 表單區塊
系統 MUST 將 RSVP 回覆表單渲染為頁面第七個全寬可捲動區塊（緊接在相片牆之後），
不使用 Modal 或獨立路由。
當後端環境變數 `RSVP_ENABLED=false` 時，表單 MUST 改為顯示「報名已截止」訊息，並停止接受任何提交；
前端透過 API 取得此狀態後渲染對應 UI，無需刷新頁面。
表單包含以下欄位：
- 姓名（必填）
- 電話（必填，格式驗證）
- 出席狀態（必選：出席 / 不克出席）
- 出席人數（出席時必填，最小值 1，最大值 10；不克出席時前端自動帶入 0，不顯示此欄位）
- 與新人關係（整組選填，兩層結構）：
  - 第一層｜賓桌歸屬（選填）：新郎親友 / 新娘親友
  - 第二層｜關係類型（選填，僅在選擇第一層後顯示）：親屬 / 朋友
- 飲食偏好（選填：一般 / 素食 / 不吃牛肉 / 不吃豬肉 / 其他）
- 備註（選填，多行文字，最多 300 字元；範例：嬰兒椅需求、素食細節、輪椅空間、提前離席、停車需求）

#### FR-009 RSVP 表單驗證
系統 MUST 在提交前驗證所有必填欄位；驗證失敗時 MUST 在對應欄位旁顯示具體錯誤訊息，
不得僅顯示通用錯誤。其他驗證規則：
- 電話號碼格式：MUST 符合台灣手機格式（`09` 開頭、共 10 碼，例：`0912345678`）或台灣市話格式（含縣市碼，共 8–9 碼，例：`0223456789`）；其他格式 MUST 回傳欄位層級錯誤提示
- 出席人數（attending=true）：MUST 為 1–10 之正整數；前端 MUST 限制輸入範圍，後端 MUST 驗證並回傳 400（guestCount 不在範圍內）
- 備註欄位超過 300 字元時 MUST 顯示字數超限提示，阻止提交
- 關係類型（第二層）僅在已選擇賓桌歸屬（第一層）的情況下有效；後端 MUST 驗證：`relationshipType` 存在時 `relationshipSide` 不得為空

#### FR-010 RSVP 資料儲存
系統 MUST 將通過驗證的 RSVP 資料儲存至 PostgreSQL 資料庫，並記錄提交時間戳記。

#### FR-011 RSVP 重複偵測
系統 MUST 偵測以相同電話號碼重複提交的 RSVP；偵測到重複時 MUST 顯示提示訊息「已收到您的回覆」，
不重複新增資料庫紀錄，賓客亦無法透過前端自助修改已提交內容。
主辦人可透過資料庫管理工具（v1 使用 Prisma Studio）直接修改出席狀態。

#### FR-012 RSVP 成功畫面
系統 MUST 在 RSVP 資料成功儲存後，以成功確認畫面取代 RSVP 表單區塊內容，畫面 MUST 包含：
- 感謝訊息：「謝謝您的回覆，我們已收到您的出席資訊，期待在婚禮當天與您相見。」
- 婚禮日期：2026 年 11 月 14 日（星期六）
- 宴客地點名稱與完整地址
- 回到頁面頂端按鈕（點擊後平滑滾動至 Hero 區塊）
- LINE 官方帳號邀請區塊（見 FR-021）：QR Code 圖片、加入按鈕、說明文字

成功確認畫面 MUST 在整個 session 期間持續保持（賓客滾動離開再返回 RSVP 區塊時仍顯示成功畫面，不回復表單）；頁面重新整理後可回復初始表單狀態。
通知信發送失敗 MUST NOT 影響此成功畫面的顯示。

#### FR-013 RSVP 速率限制
系統 MUST 在後端對 RSVP 提交端點實施 IP 速率限制：每個 IP 每小時最多提交 5 次；
超過限制時 MUST 回傳 HTTP 429，前端 MUST 顯示「提交過於頻繁，請稍後再試」提示。

#### FR-014 RSVP 主辦人通知信
系統 MUST 在 RSVP 成功提交後，非同步透過電子郵件服務向主辦人發送通知信；
通知信 MUST 包含以下完整資訊：
- RSVP 記錄 ID
- 賓客姓名
- 電話號碼
- 出席狀態（出席 / 不克出席）
- 出席人數
- 賓桌歸屬（新郎親友 / 新娘親友 / 未填寫）
- 關係類型（親屬 / 朋友 / 未填寫）
- 飲食偏好
- 備註
- 提交時間（台灣時區 UTC+8）

信件發送結果（成功/失敗/錯誤訊息）MUST 回寫至資料庫對應欄位（`notificationEmailSent`、`notificationEmailSentAt`、`notificationEmailError`）。
信件發送失敗 MUST NOT 中斷 RSVP 資料庫寫入流程。
v1 不收集賓客信箱，不發送賓客確認信。

#### FR-015 RSVP 資料管理
v1 不提供 Admin Dashboard；主辦人（新郎新娘）透過 Prisma Studio 直連 PostgreSQL 資料庫進行 RSVP 資料查詢與修改（包含更正出席狀態、手動調整人數等）。

#### FR-016 行動裝置支援
系統 MUST 在 375px 至 1440px 寬度範圍內完整顯示，採 Mobile-First 設計，
所有互動元素 MUST 符合觸控操作最低尺寸（44×44px）。

#### FR-017 平滑滾動
系統 MUST 支援全頁平滑滾動（smooth scroll），區塊進入視窗時 MUST 觸發對應動畫。

#### FR-018 Open Graph 社群分享
系統 MUST 在 `index.html` 的 `<head>` 區段加入 Open Graph 及 Twitter Card meta tags，
使賓客透過 LINE、Facebook 等平台分享婚禮網址時，能顯示分享圖片（`og:image`）、標題（`og:title`）
及說明文字（`og:description`）。分享圖片 MUST 放置於 `frontend/public/assets/og/` 目錄，
目標尺寸為 1200×630px；OG 標題 MUST 包含新人姓名與婚禮日期。

#### FR-019 RSVP 表單提交載入狀態
系統 MUST 在 RSVP 表單提交期間執行以下行為：
- 提交按鈕 MUST 立即切換為停用（disabled）狀態，並顯示載入動畫或「提交中…」文字
- 在收到 API 回應前，MUST 阻止任何重複提交請求
- API 回應成功（RSVP 資料已儲存）時：MUST 切換至 FR-012 成功確認畫面
- API 回應失敗或網路中斷時：MUST 重新啟用提交按鈕，並在表單上方顯示錯誤提示（如「提交失敗，請稍後再試」）；已填寫的表單欄位內容 MUST NOT 清空

#### FR-020 背景音樂
系統 MUST 提供背景音樂功能，遵守以下規則：

**播放觸發**：
- 音樂 MUST NOT 在任何使用者互動發生前播放
- 系統 MUST 監聽首次使用者互動事件（`click`、`touchstart`、`keydown`、`wheel` / 捲動）；首次互動發生後，系統 MUST 嘗試自動開始播放背景音樂
- 若瀏覽器 Autoplay Policy 阻擋播放，音樂保持靜音 / 關閉狀態，MUST NOT 顯示任何錯誤訊息給賓客

**音樂切換按鈕**：
- 頁面 MUST 顯示固定浮動的音樂切換按鈕（建議位置：右下角或右上角）
- 切換按鈕 MUST 在頁面整個生命週期內始終可見，無論播放狀態或音樂載入是否成功
- 使用者可隨時點擊按鈕手動開啟或關閉音樂，覆蓋自動播放嘗試的結果
- 按鈕圖示 MUST 即時反映當前播放狀態（播放中 / 靜音）

**播放行為**：
- 預設狀態為靜音 / 關閉（首次互動前）
- 音樂 MUST 設定為循環播放（loop）；播放結束後自動從頭重播
- 音樂播放狀態 MUST 在當次 session 中持續保持（頁面內滾動不中斷）；頁面重新整理後回復預設靜音

**技術限制**：
- 音樂檔案 MUST 從本地資產載入（`frontend/public/assets/music/`），不引用外部串流 URL
- 音樂資源載入 MUST 不阻塞頁面首次渲染
- 切換按鈕樣式 MUST 符合網站白色明亮韓系婚禮主題（圖示可為音符、播放鍵或喇叭；採用白色 / 奶油白半透明底，搭配深色或暖金色圖示；MUST NOT 使用深黑色實心底）
- 音樂檔案載入失敗時，切換按鈕 MUST 仍然顯示並維持可點擊狀態（點擊無效果）；不影響頁面其他功能，不顯示錯誤訊息

#### FR-021 LINE 官方帳號整合
系統 MUST 支援 LINE 官方帳號整合，分為兩個進入點：

**頁尾（Footer）**：
- 系統 MUST 在頁面底部頁尾顯示 LINE 官方帳號加入按鈕
- 點擊按鈕 MUST 以 `target="_blank"` 在新分頁開啟邀請連結 `https://line.me/R/ti/p/@516hdace`
- 行動裝置點擊 MUST 直接喚起 LINE App；桌機用戶可掃描 QR Code 加入
- 按鈕樣式 MUST 符合網站整體白色明亮韓系婚禮主題（精緻極簡設計；MUST NOT 使用深黑色實心底）

**RSVP 成功確認畫面**：
- 成功確認畫面 MUST 包含 LINE 邀請區塊，內容包含：
  - LINE QR Code 圖片（來源：`frontend/public/assets/line/`）
  - 加入按鈕（點擊開啟 `https://line.me/R/ti/p/@516hdace`，新分頁）
  - 說明文字：「婚禮流程、座位資訊、當日通知將透過 LINE 官方帳號發布」

v1 排除範圍：LINE Login、LINE Bot、LINE Messaging API（不使用 LINE 官方 Messaging API，僅連結跳轉）。

#### FR-022 全站視覺設計規範

**整體風格**：
系統 MUST 採用白色明亮韓系電影感婚禮風格（Korean Cinematic Bridal Aesthetic）。
MUST NOT 使用傳統紅金婚禮視覺、深黑主視覺背景、厚重暗色電影風格，或具 Bootstrap 模板感的設計。

**背景色系**：
網站背景 MUST 維持白色（#FFFFFF）、奶油白（#FAF8F5）、或淡灰白（#F5F3F0）色系；
整體氛圍 MUST 呈現明亮、浪漫、輕盈質感。
強調色 SHOULD 採用柔和暖金（#C9A96E）或柔和玫瑰金色調，作為點綴而非主色。

**字體規範**：
英文大標題 / 書法裝飾元素使用 `'Great Vibes', cursive`（`font-script`），用於大標題、年份標注、情感短語等視覺重點位置。
中文及標籤元素 MUST 使用 `'Iansui', 'Noto Serif TC', serif`（`font-display` = `font-wedding-zh`，本地字型 `src/assets/fonts/Iansui-Regular.ttf`，CSS 變數 `--font-wedding-zh`），透過 `.wedding-site` CSS scope 涵蓋所有前台中文文字。

**視覺元素 SHOULD**：
- 各區塊銜接處可搭配極淡漸層（僅用於底部視覺過渡，overlay 透明度 SHOULD 低於 5%）；MUST NOT 以大面積白霧遮蓋婚紗照片（Hero 照片清晰度規則詳見 FR-002）
- 大量留白（充足 whitespace，不堆疊密集文字）
- 韓系婚紗攝影排版（不對稱構圖、乾淨背景、情感化取景）
- Premium editorial layout（高端時尚雜誌封面感，層次分明）
- Emotional cinematic storytelling（以影像與文字配合傳達情感敘事）

**明確禁止（MUST NOT）**：
- 使用傳統紅金婚禮色彩作為主視覺（傳統宮廷紅、大紅大金配色）
- 使用深黑色（`#0D0D0D`、`#000000` 或接近純黑）作為**整站**主要背景（局部例外區塊見下方）
- 使用厚重暗色電影風格作為**整站**設計語言
- 呈現具 Bootstrap 模板感或通用 UI 套件感的佈局（模板化卡片、對稱兩欄堆疊）

**局部黑色電影感區塊（例外規則）**：
以下兩個區塊 MUST 採用黑色 / 深灰黑背景，形成全站視覺節奏的情感沉浸高潮：
1. **TimelineSection（愛情故事時間軸，FR-005）**：黑色電影沉浸式風格，film grain + Kodak 底片框 + scroll reveal 動畫
2. **GallerySwiperSection（相片牆輪播，FR-007）**：黑色膠卷氛圍，Swiper.js + 底片框 + 手機滑動 / 桌機箭頭

此二區塊使用黑色背景為刻意設計，製造「白→黑→白」視覺節奏，強化情感敘事層次。
MUST NOT 將此視為 FR-022 整站規範違規。
其他所有區塊（Hero、Countdown、Calendar、Info、RSVP、Footer）MUST 遵循 FR-022 白色明亮韓系主規範。

### Key Entities

- **RSVP 回覆（RSVPSubmission）**：賓客出席回覆紀錄；包含姓名、電話（唯一識別）、出席狀態（Boolean）、出席人數（attending=true 時 1–10，attending=false 時固定為 0）、賓桌歸屬（`relationshipSide`，選填：新郎親友/新娘親友）、關係類型（`relationshipType`，選填：親屬/朋友，僅在 relationshipSide 有值時有效）、飲食偏好、備註（最多 300 字元）、提交時間；另含通知信發送狀態欄位（sent、sentAt、error）
- **婚禮配置（WeddingConfig，靜態）**：婚禮日期、地點、地址等靜態資料；v1 以環境變數或前端常數管理，無需資料庫

---

## Success Criteria

### Measurable Outcomes

- **SC-001**：賓客能在 3 分鐘內完成 RSVP 填寫並提交，提交後立即看到成功確認畫面
- **SC-002**：所有頁面區塊在 375px（iPhone SE）至 1440px（桌機）寬度上完整顯示，無橫向捲動
- **SC-003**：相片牆懶加載正常運作；首頁初始可見區域在一般 4G 連線下 3 秒內完成首次渲染
- **SC-004**：所有 RSVP 資料正確、完整地儲存至資料庫，無欄位遺失
- **SC-005**：倒數計時每秒準確更新，誤差不超過 1 秒
- **SC-006**：主辦人通知信在 RSVP 提交後 60 秒內送達；電子郵件服務失敗不中斷 RSVP 儲存流程
- **SC-007**：時間軸動畫在滾動進入視窗時正確觸發，不出現閃爍或跳位問題
- **SC-008**：RSVP 表單提交期間，提交按鈕保持停用直至收到 API 回應；資料庫中不出現同一電話號碼的重複提交紀錄
- **SC-009**：頁面載入完成後音樂切換按鈕始終可見；首次使用者互動後系統嘗試自動播放，若瀏覽器允許則音樂開始播放，若被阻擋則靜音保持且無錯誤提示；音樂資源載入不影響首頁在 4G 連線下 3 秒內完成首次渲染（SC-003 目標）；當次 session 播放狀態在任何情況下維持一致

---

## Assumptions

- 婚禮日期固定為 2026-11-14，不需後台設定
- 婚宴地點、地址、交通資訊由開發團隊於部署前填入，v1 不提供後台編輯
- 賓客不需登入即可提交 RSVP
- v1 相片牆圖片為預先準備的精選婚紗照，由開發團隊放置於 `frontend/public/assets/gallery/`
- 電子郵件服務使用 Resend，寄件網域為 hezhouwedding.com
- 主辦人通知信收件地址由環境變數 `ADMIN_EMAIL` 設定（beanzhou921@gmail.com），v1 僅一位主辦人
- v1 RSVP 資料管理由主辦人透過 Prisma Studio 直連資料庫操作，不提供 Admin Dashboard
- 預計邀請賓客 140–180 人；RSVP 提交總量預估不超過 200 筆，系統無需特殊擴展設計
- 網站僅支援繁體中文介面
- 不需 SEO 優化（無 SSR）

---

## Out of Scope（v1）

以下功能明確排除於本版本範疇之外：

- 多語言支援（中文以外的語言）
- OAuth 或任何使用者登入機制
- 付款、禮金或電子禮券功能
- 婚禮直播功能
- AI 圖片生成或 AI 幻燈片
- 即時聊天或留言板
- 後台管理介面（Admin Dashboard）
- 影片上傳
- SSR / SEO 優化
- PWA / 推播通知
- 數據分析儀表板
- 賓客身份驗證
- 多位主辦人管理
- 賓客照片上傳功能（移至未來版本，屆時一併規劃雲端儲存方案）
- LINE Login / LINE 帳號登入
- LINE Bot 自動回覆功能
- LINE Messaging API（主動推播訊息）

---

## Appendix A — 技術架構建議

> **Note**：本附錄為技術參考，詳細架構將在 `/speckit-plan` 階段正式定義。

### A1. 建議資料夾結構

```
monorepo/
├── frontend/                    # Vite + Vue 3 + TypeScript + Tailwind CSS
│   ├── public/
│   │   └── assets/
│   │       ├── hero/
│   │       ├── story/
│   │       ├── gallery/
│   │       ├── music/           # 背景音樂檔案
│   │       ├── og/
│   │       ├── line/            # LINE QR Code 圖片
│   │       └── ui/
│   ├── src/
│   │   ├── components/
│   │   │   ├── sections/        # HeroSection, CountdownSection, CalendarSection, TimelineSection, InfoSection, GallerySection, RsvpSection（依頁面順序）
│   │   │   ├── layout/          # AppFooter（含 LINE 按鈕）
│   │   │   └── ui/              # Button, Input, Modal, MusicToggle, LineButton 等共用元件
│   │   ├── composables/         # useCountdown, useIntersectionObserver, useRsvp, useBackgroundMusic
│   │   ├── services/            # api.ts (Axios 封裝)
│   │   ├── types/               # TypeScript 型別定義
│   │   ├── constants/           # 婚禮靜態資料（日期、地點、故事）
│   │   ├── App.vue
│   │   └── main.ts
│   ├── .env.example
│   └── vite.config.ts
│
├── backend/                     # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/
│   │   │   └── rsvp.ts
│   │   ├── controllers/
│   │   │   └── rsvpController.ts
│   │   ├── services/
│   │   │   └── emailService.ts  # Resend 整合
│   │   ├── middleware/
│   │   │   ├── cors.ts
│   │   │   ├── rateLimiter.ts   # IP 速率限制（5 次/IP/小時）
│   │   │   └── errorHandler.ts
│   │   ├── prisma/              # schema.prisma
│   │   └── app.ts
│   ├── .env.example
│   └── package.json
│
└── specs/                       # Spec Kit 規格文件
    └── 001-wedding-site-v1/
```

### A2. API 架構建議

所有 API 路由以 `/api` 為前綴，遵循 RESTful 設計。

| Method | Path | 說明 |
|--------|------|------|
| POST | `/api/rsvp` | 提交 RSVP 回覆（`RSVP_ENABLED=false` 時拒絕） |
| GET | `/api/rsvp/status` | 查詢 RSVP 開放狀態（前端初始化時呼叫） |
| GET | `/api/health` | 服務健康檢查 |

**RSVP 提交請求範例**：
```json
{
  "name": "王大明",
  "phone": "0912345678",
  "attending": true,
  "guestCount": 2,
  "relationshipSide": "groom",
  "relationshipType": "relative",
  "dietaryPreference": "no_beef",
  "notes": "需要輪椅座位，請安排靠走道桌位"
}
```

### A3. 資料庫 Schema 建議

```prisma
model RSVPSubmission {
  id                        Int       @id @default(autoincrement())
  name                      String
  phone                     String    @unique
  attending                 Boolean
  guestCount                Int       @default(0)
  relationshipSide          String?
  relationshipType          String?
  dietaryPreference         String    @default("regular")
  notes                     String?   @db.VarChar(300)
  notificationEmailSent     Boolean   @default(false)
  notificationEmailSentAt   DateTime?
  notificationEmailError    String?
  createdAt                 DateTime  @default(now())
}
```

`dietaryPreference` 允許值：`regular`（一般）、`vegetarian`（素食）、`no_beef`（不吃牛肉）、`no_pork`（不吃豬肉）、`other`（其他）。
`relationshipSide` 允許值：`groom`（新郎親友）、`bride`（新娘親友）、`null`（未填寫）。
`relationshipType` 允許值：`relative`（親屬）、`friend`（朋友）、`null`（未填寫）；僅在 `relationshipSide` 非空時有效。
`notes` 最大長度：300 字元（`@db.VarChar(300)`）。

### A4. Zeabur 部署策略

| 服務 | 類型 | 設定 |
|------|------|------|
| Frontend | Static Site | Build: `npm run build`，Output: `dist` |
| Backend | Node.js Service | Start: `npm run start`，環境變數: `PORT`, `DATABASE_URL`, `RESEND_API_KEY`, `ADMIN_EMAIL`, `FRONTEND_URL`, `RSVP_ENABLED` |
| Database | PostgreSQL | Zeabur 管理服務，`DATABASE_URL` 由平台自動注入 |

**環境變數清單（backend/.env.example）**：
```
PORT=3000
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
ADMIN_EMAIL=beanzhou921@gmail.com
FRONTEND_URL=https://hezhouwedding.com
RSVP_ENABLED=true
```

**環境變數清單（frontend/.env.example）**：
```
VITE_API_BASE_URL=https://api.hezhouwedding.com
```

### A5. Resend 整合策略

- **寄件地址**: `noreply@hezhouwedding.com`
- **收件人**: `ADMIN_EMAIL`（beanzhou921@gmail.com）
- **主辦人通知信**: 每筆 RSVP 提交後非同步發送（不阻塞 API 回應）；信件內容包含完整 RSVP 資料（ID、姓名、電話、出席狀態、人數、關係、飲食偏好、備註、提交時間 UTC+8）
- **發送狀態回寫**: 發送結果（成功時間或錯誤訊息）MUST 寫入 `RSVPSubmission` 的 `notificationEmailSent`、`notificationEmailSentAt`、`notificationEmailError` 欄位
- **v1 不收集賓客信箱**：確認信僅發給主辦人，未來版本可加入賓客信箱欄位
- **失敗處理**: 信件發送失敗不回滾 RSVP 資料庫寫入，錯誤訊息記錄於 `notificationEmailError`
- **未來擴充**: 婚禮前提醒信、婚後感謝信等交易型郵件

### A6. Mobile-First UI 策略

- **斷點設計**：以 375px（手機）為基礎設計，逐步擴展至 768px（平板）、1280px（桌機）
- **觸控優化**：所有可點擊元素最小觸控區域 44×44px
- **視覺風格**：白色明亮韓系電影感配色（背景：White `#FFFFFF` / Cream `#FAF8F5` / Light Gray `#F5F3F0`；強調色：暖金 `#C9A96E` 作為點綴），細明線條，韓系婚紗 editorial 排版；MUST NOT 使用深黑色大面積背景
- **字型**：英文裝飾標題 MUST 使用 `'Great Vibes', cursive`（`font-script`，不再使用 Cormorant Garamond / Playfair Display）；中文與段落標題 MUST 使用 `'Iansui', 'Noto Serif TC', serif`（`font-display` = `font-wedding-zh`，CSS var `--font-wedding-zh`），透過 `.wedding-site` scope class 自動套用至所有前台頁面（`/admin` 除外）
- **Hero 主視覺**：婚紗照片 MUST 清楚、高清完整顯示，MUST NOT 被大面積白霧遮蓋；文字使用 `justify-start` 頂部對齊 + `padding-top` 錨定至安全區（避免遮住新人臉部）；英文手寫字容器使用 `overflow: visible` 並設定 `padding-top ≥ 12px`，確保書法字上緣筆觸不被裁切；僅底部保留極淡漸層（透明度 ≤ 5%）銜接下一區塊
- **動畫**：使用 Intersection Observer API 觸發滾動進場動畫，避免 JavaScript 重繪效能問題
- **圖片最佳化**：hero 圖片使用 WebP 格式（`<img>` tag 搭配 `fetchpriority="high"` 確保 LCP 最佳化），`<img loading="lazy">` 用於相片牆，`srcset` 提供響應式圖片
- **音樂切換按鈕**：固定浮動（`position: fixed`），建議右下角，尺寸 44×44px 以上；圖示使用音符或喇叭；配色符合白色明亮韓系主題（白色 / 奶油白半透明底，搭配深色或暖金圖示；MUST NOT 使用深黑色實心底）；預設靜音圖示，首次使用者互動後嘗試自動播放（click / touchstart / keydown / wheel）；播放狀態更新時圖示即時切換；音樂以 `<audio>` 標籤載入本地檔案，`preload="none"` 避免阻礙首屏渲染；切換按鈕在任何狀態下（包含音樂載入失敗）始終保持可見
