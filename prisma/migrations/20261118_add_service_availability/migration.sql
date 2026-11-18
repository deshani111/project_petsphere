CREATE TABLE IF NOT EXISTS "sitter_service_schedule" (
  "schedule_id" BIGSERIAL PRIMARY KEY,
  "sitter_id" BIGINT NOT NULL,
  "service_type_id" BIGINT NOT NULL,
  "weekday" INTEGER NOT NULL,
  "is_available" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "sitter_service_schedule_sitter_id_fkey"
    FOREIGN KEY ("sitter_id") REFERENCES "pet_sitter"("sitter_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "sitter_service_schedule_service_type_id_fkey"
    FOREIGN KEY ("service_type_id") REFERENCES "service_type"("service_type_id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "sitter_service_schedule_sitter_id_service_type_id_weekday_key"
  ON "sitter_service_schedule"("sitter_id", "service_type_id", "weekday");
CREATE INDEX IF NOT EXISTS "sitter_service_schedule_sitter_id_service_type_id_idx"
  ON "sitter_service_schedule"("sitter_id", "service_type_id");

CREATE TABLE IF NOT EXISTS "sitter_service_time_slot" (
  "slot_id" BIGSERIAL PRIMARY KEY,
  "sitter_id" BIGINT NOT NULL,
  "service_type_id" BIGINT NOT NULL,
  "weekday" INTEGER NOT NULL,
  "start_time" VARCHAR(5) NOT NULL,
  "end_time" VARCHAR(5) NOT NULL
);

CREATE INDEX IF NOT EXISTS "sitter_service_time_slot_sitter_id_service_type_id_weekday_idx"
  ON "sitter_service_time_slot"("sitter_id", "service_type_id", "weekday");
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sitter_service_time_slot_schedule_fkey'
  ) THEN
    ALTER TABLE "sitter_service_time_slot"
      ADD CONSTRAINT "sitter_service_time_slot_schedule_fkey"
      FOREIGN KEY ("sitter_id", "service_type_id", "weekday")
      REFERENCES "sitter_service_schedule"("sitter_id", "service_type_id", "weekday")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "sitter_service_date_override" (
  "override_id" BIGSERIAL PRIMARY KEY,
  "sitter_id" BIGINT NOT NULL,
  "service_type_id" BIGINT NOT NULL,
  "unavailable_date" DATE NOT NULL,
  "is_available" BOOLEAN NOT NULL DEFAULT false,
  "reason" VARCHAR(255),
  CONSTRAINT "sitter_service_date_override_sitter_id_fkey"
    FOREIGN KEY ("sitter_id") REFERENCES "pet_sitter"("sitter_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "sitter_service_date_override_service_type_id_fkey"
    FOREIGN KEY ("service_type_id") REFERENCES "service_type"("service_type_id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "sitter_service_date_override_sitter_id_service_type_id_unavailable_date_key"
  ON "sitter_service_date_override"("sitter_id", "service_type_id", "unavailable_date");
CREATE INDEX IF NOT EXISTS "sitter_service_date_override_sitter_id_service_type_id_unavailable_date_idx"
  ON "sitter_service_date_override"("sitter_id", "service_type_id", "unavailable_date");

CREATE TABLE IF NOT EXISTS "sitter_service_date_slot" (
  "slot_id" BIGSERIAL PRIMARY KEY,
  "override_id" BIGINT NOT NULL,
  "start_time" VARCHAR(5) NOT NULL,
  "end_time" VARCHAR(5) NOT NULL,
  CONSTRAINT "sitter_service_date_slot_override_id_fkey"
    FOREIGN KEY ("override_id") REFERENCES "sitter_service_date_override"("override_id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "sitter_service_date_slot_override_id_idx"
  ON "sitter_service_date_slot"("override_id");

CREATE TABLE IF NOT EXISTS "sitter_boarding_capacity" (
  "capacity_id" BIGSERIAL PRIMARY KEY,
  "sitter_id" BIGINT NOT NULL,
  "service_type_id" BIGINT NOT NULL,
  "max_capacity" INTEGER NOT NULL,
  CONSTRAINT "sitter_boarding_capacity_sitter_id_fkey"
    FOREIGN KEY ("sitter_id") REFERENCES "pet_sitter"("sitter_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "sitter_boarding_capacity_service_type_id_fkey"
    FOREIGN KEY ("service_type_id") REFERENCES "service_type"("service_type_id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "sitter_boarding_capacity_sitter_id_service_type_id_key"
  ON "sitter_boarding_capacity"("sitter_id", "service_type_id");
