-- Allow marketplace advertisements to be posted by either an owner or a sitter.
ALTER TABLE "advertisement" DROP CONSTRAINT IF EXISTS "advertisement_status_check";
ALTER TABLE "advertisement" ADD CONSTRAINT "advertisement_status_check" CHECK ("status" IN ('active', 'inactive', 'sold', 'expired', 'rejected'));

ALTER TABLE "advertisement"
  ALTER COLUMN "owner_id" DROP NOT NULL;

ALTER TABLE "advertisement"
  ADD COLUMN "sitter_id" BIGINT;

ALTER TABLE "advertisement"
  ADD CONSTRAINT "advertisement_sitter_id_fkey"
  FOREIGN KEY ("sitter_id") REFERENCES "pet_sitter"("sitter_id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE INDEX "idx_advertisement_sitter_id" ON "advertisement"("sitter_id");

ALTER TABLE "advertisement"
  ADD CONSTRAINT "advertisement_seller_check"
  CHECK (("owner_id" IS NOT NULL) <> ("sitter_id" IS NOT NULL));
