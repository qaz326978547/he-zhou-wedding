-- 每桌可個別設定座位數（預設 10，可加座）
ALTER TABLE "SeatTable" ADD COLUMN "capacity" INTEGER NOT NULL DEFAULT 10;
