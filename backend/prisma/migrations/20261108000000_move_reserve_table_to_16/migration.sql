-- 預備桌（原第 4 桌，左欄最下方）改為第 16 桌，原第 5–16 桌依序改為第 4–15 桌。
-- 賓客與桌設定（桌名、座位數、方別）跟著實體位置一起換號；主桌與第 1–3 桌不變。
-- 只影響 SeatGuest / SeatTable，不影響 RSVP 與紅包資料。

-- SeatTable 以 tableNo 為主鍵，先暫移到 100 以上避免主鍵衝突
UPDATE "SeatTable" SET "tableNo" = "tableNo" + 100 WHERE "tableNo" BETWEEN 4 AND 16;
UPDATE "SeatTable"
SET "tableNo" = CASE WHEN "tableNo" = 104 THEN 16 ELSE "tableNo" - 101 END
WHERE "tableNo" BETWEEN 104 AND 116;

UPDATE "SeatGuest"
SET "tableNo" = CASE WHEN "tableNo" = 4 THEN 16 ELSE "tableNo" - 1 END
WHERE "tableNo" BETWEEN 4 AND 16;
