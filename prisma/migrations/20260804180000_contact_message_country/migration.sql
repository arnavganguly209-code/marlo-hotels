-- Optional country on contact / enquiry submissions.
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "country" TEXT;
CREATE INDEX IF NOT EXISTS "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "ContactMessage_subject_idx" ON "ContactMessage"("subject");
