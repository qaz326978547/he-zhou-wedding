# API Contracts: 婚宴座位安排

所有端點皆需 `Authorization: Bearer <token>`（`adminAuth`）。

## GET `/api/admin/seating`

回傳全部桌名設定與座位紀錄。

```json
{
  "data": {
    "capacity": 10,
    "tableCount": 17,
    "tables": [{ "tableNo": 1, "label": "主桌" }],
    "guests": [{ "id": 1, "tableNo": 1, "name": "王小明", "count": 3, "note": null, "rsvpId": 12, "createdAt": "..." }]
  }
}
```

## PUT `/api/admin/seating/tables/:tableNo`

Body：`{ "label": "主桌" }`（空字串視為清除）→ `200 { data: { tableNo, label } }`

## POST `/api/admin/seating/guests`

Body：`{ "tableNo": 3, "name": "王小明", "count": 3, "note": "素食", "rsvpId": 12 }`（`note`、`rsvpId` 可省略）→ `201 { data: SeatGuest }`

## PUT `/api/admin/seating/guests/:id`

Body：`{ "tableNo": 5, "name": "王小明", "count": 4, "note": null }`（可用於換桌）→ `200 { data: SeatGuest }`

## DELETE `/api/admin/seating/guests/:id` → `204`

## 錯誤

| HTTP | error | 說明 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 欄位驗證失敗（桌號 1–17、人數 1–10、姓名 1–50 字） |
| 400 | `INVALID_ID` | id 非數字 |
| 404 | `NOT_FOUND` | 找不到座位紀錄 |
| 409 | `TABLE_FULL` | 超過單桌 10 人；`message` 含剩餘座位數，`remaining` 欄位為剩餘數 |
