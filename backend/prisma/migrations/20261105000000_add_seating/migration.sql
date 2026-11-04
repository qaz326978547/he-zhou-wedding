-- CreateTable
CREATE TABLE "SeatTable" (
    "tableNo" INTEGER NOT NULL,
    "label" TEXT,

    CONSTRAINT "SeatTable_pkey" PRIMARY KEY ("tableNo")
);

-- CreateTable
CREATE TABLE "SeatGuest" (
    "id" SERIAL NOT NULL,
    "tableNo" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "rsvpId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeatGuest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeatGuest_tableNo_idx" ON "SeatGuest"("tableNo");
