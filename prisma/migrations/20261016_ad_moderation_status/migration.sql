ALTER TABLE "advertisement" DROP CONSTRAINT IF EXISTS "advertisement_status_check";

-- Move existing listings into the new moderation vocabulary without hiding them.
UPDATE "advertisement" SET "status" = 'approved' WHERE "status" IN ('active', 'sold', 'expired');
UPDATE "advertisement" SET "status" = 'pending' WHERE "status" = 'inactive';

ALTER TABLE "advertisement" ADD CONSTRAINT "advertisement_status_check"
  CHECK ("status" IN ('pending', 'approved', 'rejected'));
ALTER TABLE "advertisement" ALTER COLUMN "status" SET DEFAULT 'pending';
ALTER TABLE "advertisement" ADD COLUMN "rejection_reason" TEXT;
ALTER TABLE "advertisement" ADD COLUMN "reviewed_by" BIGINT;
ALTER TABLE "advertisement" ADD COLUMN "reviewed_at" TIMESTAMP(6);
