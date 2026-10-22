ALTER TABLE "advertisement"
  ADD COLUMN "vaccinated" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "microchipped" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "house_trained" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "good_with_children" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "good_with_other_pets" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "special_care_needed" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "advertisement_photo" (
  "photo_id" BIGSERIAL NOT NULL,
  "ad_id" BIGINT NOT NULL,
  "photo_url" VARCHAR(255) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "advertisement_photo_pkey" PRIMARY KEY ("photo_id")
);

CREATE INDEX "idx_advertisement_photo_ad_id" ON "advertisement_photo"("ad_id");

ALTER TABLE "advertisement_photo"
  ADD CONSTRAINT "advertisement_photo_ad_id_fkey"
  FOREIGN KEY ("ad_id") REFERENCES "advertisement"("ad_id")
  ON DELETE CASCADE ON UPDATE NO ACTION;
