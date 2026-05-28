-- RSVP v2 restructure: replace guestCount/notes with adultCount/childCount/needsHighchair + invitation fields

ALTER TABLE "RSVPSubmission" DROP COLUMN IF EXISTS "guestCount";
ALTER TABLE "RSVPSubmission" DROP COLUMN IF EXISTS "notes";

ALTER TABLE "RSVPSubmission" ADD COLUMN IF NOT EXISTS "adultCount" INTEGER;
ALTER TABLE "RSVPSubmission" ADD COLUMN IF NOT EXISTS "childCount" INTEGER;
ALTER TABLE "RSVPSubmission" ADD COLUMN IF NOT EXISTS "needsHighchair" BOOLEAN;
ALTER TABLE "RSVPSubmission" ADD COLUMN IF NOT EXISTS "needsInvitation" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RSVPSubmission" ADD COLUMN IF NOT EXISTS "invitationName" TEXT;
ALTER TABLE "RSVPSubmission" ADD COLUMN IF NOT EXISTS "invitationPhone" TEXT;
ALTER TABLE "RSVPSubmission" ADD COLUMN IF NOT EXISTS "invitationAddress" TEXT;
