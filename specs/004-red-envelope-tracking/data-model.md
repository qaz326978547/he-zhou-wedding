# 資料模型：紅包登記功能

**Feature**: `004-red-envelope-tracking`
**Date**: 2026-07-03

---

## 實體一覽

| 實體 | 儲存位置 | 說明 |
|------|----------|------|
| RedEnvelopeEntry | PostgreSQL（新增資料表） | 賓客紅包登記紀錄；獨立資料表，不與 `RSVPSubmission` 關聯 |

---

## RedEnvelopeEntry（新增）

```prisma
model RedEnvelopeEntry {
  id        Int      @id @default(autoincrement())
  name      String
  amount    Int
  createdAt DateTime @default(now())
}
```

| 欄位 | 型別 | 必填 | 說明 | 驗證規則 |
|------|------|------|------|----------|
| `id` | Int | 自動產生 | 主鍵，自增 | — |
| `name` | String | ✅ | 賓客姓名 | trim 後 1–50 字元 |
| `amount` | Int | ✅ | 紅包金額（新台幣） | 正整數，> 0 |
| `createdAt` | DateTime | 自動產生 | 登記時間（UTC，前端顯示需轉換為 UTC+8） | — |

**與既有 schema 的關係**：`RedEnvelopeEntry` 為全新、獨立的資料表，不引用 `RSVPSubmission` 的任何欄位，也不建立外鍵關聯（比照 spec.md Assumptions 決議）。

---

## 操作一覽

| 操作 | 存取層級 | 說明 |
|------|----------|------|
| 新增 | 公開（賓客端） | `prisma.redEnvelopeEntry.create()`，使用 `redEnvelopeSchema` 驗證 |
| 查詢全部 | 後台（JWT） | `prisma.redEnvelopeEntry.findMany({ orderBy: { createdAt: 'desc' } })` |
| 修改 | 後台（JWT） | `prisma.redEnvelopeEntry.update({ where: { id } })`，使用 `redEnvelopeSchema` |
| 刪除 | 後台（JWT） | `prisma.redEnvelopeEntry.delete({ where: { id } })` |

---

## 狀態轉換

### 賓客提交流程

```
賓客開啟 /qr
  │
  ├─[填寫姓名 + 金額]
  │
  ├─[POST /api/red-envelope]
  │   ├─[驗證失敗]──► 400，欄位錯誤提示，表單保留內容
  │   ├─[Rate limit 超過]──► 429，「提交過於頻繁，請稍後再試」
  │   └─[驗證成功]──► 201，儲存至資料庫，前端顯示成功提示並清空表單
```

### 後台管理流程

```
主辦人登入後台（沿用 002-admin-dashboard JWT 機制）
  │
  ├─[GET /api/admin/red-envelope]──► 列表 + 前端計算總金額/總筆數
  │
  ├─[PUT /api/admin/red-envelope/:id]──► 修改姓名/金額 ──► 列表與總金額即時更新
  │
  ├─[DELETE /api/admin/red-envelope/:id]──► 刪除 ──► 列表與總金額即時更新
  │
  └─[前端 exportCsv()]──► 純前端組出 CSV（UTF-8 BOM），不呼叫額外 API
```
