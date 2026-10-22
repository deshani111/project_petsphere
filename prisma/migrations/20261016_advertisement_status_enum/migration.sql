CREATE TYPE "AdvertisementStatus" AS ENUM ('pending', 'approved', 'rejected');
ALTER TABLE "advertisement" DROP CONSTRAINT IF EXISTS "advertisement_status_check";
ALTER TABLE "advertisement" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "advertisement" ALTER COLUMN "status" TYPE "AdvertisementStatus" USING "status"::text::"AdvertisementStatus";
ALTER TABLE "advertisement" ALTER COLUMN "status" SET DEFAULT 'pending'::"AdvertisementStatus";
