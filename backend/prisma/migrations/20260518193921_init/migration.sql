-- CreateTable
CREATE TABLE "RSVPSubmission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "attending" BOOLEAN NOT NULL,
    "guestCount" INTEGER NOT NULL DEFAULT 0,
    "relationshipSide" TEXT,
    "relationshipType" TEXT,
    "dietaryPreference" TEXT NOT NULL DEFAULT 'regular',
    "notes" VARCHAR(300),
    "notificationEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "notificationEmailSentAt" TIMESTAMP(3),
    "notificationEmailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RSVPSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RSVPSubmission_phone_key" ON "RSVPSubmission"("phone");
