-- CreateTable
CREATE TABLE "RedEnvelopeEntry" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedEnvelopeEntry_pkey" PRIMARY KEY ("id")
);
