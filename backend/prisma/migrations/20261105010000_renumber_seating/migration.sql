-- 桌號改為：主桌 = 0，其餘 1–16（由最左欄開始、每欄由上往下）
-- 舊編號資料不再適用，清空座位資料（僅影響 SeatGuest / SeatTable，不影響 RSVP 與紅包資料）
DELETE FROM "SeatGuest";
DELETE FROM "SeatTable";
