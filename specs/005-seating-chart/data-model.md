# Data Model: 婚宴座位安排

## SeatTable（桌位設定）

| 欄位 | 型別 | 說明 |
|---|---|---|
| `tableNo` | `Int` PK | 桌號：0 = 主桌，1–16 = 一般桌 |
| `label` | `String?` | 自訂桌名，空值時前端顯示「第 N 桌」 |
| `side` | `String?` | 方別：`groom` 新郎方、`bride` 新娘方、`null` 未設定 |
| `capacity` | `Int` default 10 | 座位數，可加座至 12；不可少於已安排人數 |

僅於修改桌名時 upsert，未設定的桌不需存在資料列。

## SeatGuest（座位紀錄）

| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | `Int` PK autoincrement | |
| `tableNo` | `Int` | 桌號 0–16（index，0 = 主桌） |
| `name` | `String` | 姓名（1–50 字） |
| `count` | `Int` default 1 | 人數 1–12 |
| `note` | `String?` | 備註（≤ 100 字，例如「素食」「需兒童椅」） |
| `rsvpId` | `Int?` | 來源 RSVP（可空，不設 FK，RSVP 刪除時保留座位資料） |
| `createdAt` | `DateTime` | |

## 規則

- 每桌 `SUM(count) ≤ SeatTable.capacity`（無資料列時視為預設 10）。
- 桌位座標（x, y）屬於呈現資訊，固定於前端 `frontend/src/constants/seating.ts`。
