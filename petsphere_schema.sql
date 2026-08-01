-- =====================================================================
--  PETSPHERE DATABASE SCHEMA
--  Target: PostgreSQL 13+
--  Run with:  psql -U <your_username> -d petsphere -f petsphere_schema.sql
-- =====================================================================
--  This script is idempotent-ish: it drops existing PetSphere tables
--  first (if any), then rebuilds everything from scratch in the
--  correct dependency order. Safe to re-run while you're developing.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 0. CLEAN SLATE (drop in reverse dependency order)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS order_item        CASCADE;
DROP TABLE IF EXISTS orders            CASCADE;
DROP TABLE IF EXISTS item              CASCADE;
DROP TABLE IF EXISTS notification      CASCADE;
DROP TABLE IF EXISTS message           CASCADE;
DROP TABLE IF EXISTS blog_post         CASCADE;
DROP TABLE IF EXISTS advertisement     CASCADE;
DROP TABLE IF EXISTS review            CASCADE;
DROP TABLE IF EXISTS payment           CASCADE;
DROP TABLE IF EXISTS booking           CASCADE;
DROP TABLE IF EXISTS pet_sitter_service CASCADE;
DROP TABLE IF EXISTS service_type      CASCADE;
DROP TABLE IF EXISTS premium           CASCADE;
DROP TABLE IF EXISTS premium_plan      CASCADE;
DROP TABLE IF EXISTS pet               CASCADE;
DROP TABLE IF EXISTS admin             CASCADE;
DROP TABLE IF EXISTS pet_sitter        CASCADE;
DROP TABLE IF EXISTS pet_owner         CASCADE;
DROP TABLE IF EXISTS users             CASCADE;

-- ---------------------------------------------------------------------
-- 1. USERS  (supertype for pet_owner / pet_sitter / admin)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id        BIGSERIAL PRIMARY KEY,
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    full_name      VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    phone_number   VARCHAR(20),
    role           VARCHAR(20)  NOT NULL CHECK (role IN ('pet_owner','pet_sitter','admin')),
    is_verified    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 2. SUBTYPES OF USER
-- ---------------------------------------------------------------------
CREATE TABLE pet_owner (
    owner_id           BIGSERIAL PRIMARY KEY,
    user_id            BIGINT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    emergency_contact  VARCHAR(50),
    address            VARCHAR(255),
    city               VARCHAR(100)
);

CREATE TABLE pet_sitter (
    sitter_id          BIGSERIAL PRIMARY KEY,
    user_id            BIGINT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    bio                TEXT,
    experience_years   INT NOT NULL DEFAULT 0,
    service_area       VARCHAR(150),
    is_available       BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified        BOOLEAN NOT NULL DEFAULT FALSE,
    avg_rating         NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (avg_rating BETWEEN 0 AND 5),
    earning_total      NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE admin (
    admin_id           BIGSERIAL PRIMARY KEY,
    user_id            BIGINT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 3. PET  (owned by pet_owner)
-- ---------------------------------------------------------------------
CREATE TABLE pet (
    pet_id         BIGSERIAL PRIMARY KEY,
    owner_id       BIGINT NOT NULL REFERENCES pet_owner(owner_id) ON DELETE CASCADE,
    pet_name       VARCHAR(100) NOT NULL,
    species        VARCHAR(50),
    breed          VARCHAR(100),
    gender         VARCHAR(10) CHECK (gender IN ('male','female','unknown')),
    age            INT CHECK (age >= 0),
    weight_kg      NUMERIC(5,2),
    photo          VARCHAR(255),
    medical_notes  TEXT,
    created_date   TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 4. PREMIUM PLAN / PREMIUM SUBSCRIPTION
-- ---------------------------------------------------------------------
CREATE TABLE premium_plan (
    plan_id      BIGSERIAL PRIMARY KEY,
    plan_name    VARCHAR(100) NOT NULL,
    description  TEXT,
    price        NUMERIC(10,2) NOT NULL,
    duration     INT NOT NULL  -- duration in days
);

CREATE TABLE premium (
    premium_id   BIGSERIAL PRIMARY KEY,
    owner_id     BIGINT NOT NULL REFERENCES pet_owner(owner_id) ON DELETE CASCADE,
    plan_id      BIGINT NOT NULL REFERENCES premium_plan(plan_id),
    start_date   DATE NOT NULL,
    end_date     DATE,
    CHECK (end_date IS NULL OR end_date >= start_date)
);

-- ---------------------------------------------------------------------
-- 5. SERVICE TYPE + PET SITTER OFFERINGS (m:n)
-- ---------------------------------------------------------------------
CREATE TABLE service_type (
    service_type_id  BIGSERIAL PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    description      TEXT
);

CREATE TABLE pet_sitter_service (
    sitter_id        BIGINT NOT NULL REFERENCES pet_sitter(sitter_id) ON DELETE CASCADE,
    service_type_id  BIGINT NOT NULL REFERENCES service_type(service_type_id) ON DELETE CASCADE,
    PRIMARY KEY (sitter_id, service_type_id)
);

-- ---------------------------------------------------------------------
-- 6. BOOKING  (pet_owner makes, pet_sitter accepts, includes a pet)
-- ---------------------------------------------------------------------
CREATE TABLE booking (
    booking_id        BIGSERIAL PRIMARY KEY,
    owner_id          BIGINT NOT NULL REFERENCES pet_owner(owner_id),
    sitter_id         BIGINT REFERENCES pet_sitter(sitter_id),
    pet_id            BIGINT NOT NULL REFERENCES pet(pet_id),
    service_type_id   BIGINT REFERENCES service_type(service_type_id),
    start_date        DATE,
    end_date          DATE,
    status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','completed','cancelled')),
    total_amount      NUMERIC(10,2),
    notes             TEXT,
    booking_date      TIMESTAMP NOT NULL DEFAULT now(),
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- ---------------------------------------------------------------------
-- 7. PAYMENT  (generated for a booking)
-- ---------------------------------------------------------------------
CREATE TABLE payment (
    payment_id       BIGSERIAL PRIMARY KEY,
    booking_id       BIGINT REFERENCES booking(booking_id) ON DELETE CASCADE,
    amount           NUMERIC(10,2) NOT NULL,
    payment_method   VARCHAR(50),
    transaction_ref  VARCHAR(100),
    invoice_number   VARCHAR(100),
    status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','completed','failed','refunded')),
    payment_date     TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 8. REVIEW  (pet_owner submits a review about a pet_sitter/booking)
-- ---------------------------------------------------------------------
CREATE TABLE review (
    review_id     BIGSERIAL PRIMARY KEY,
    owner_id      BIGINT REFERENCES pet_owner(owner_id) ON DELETE SET NULL,
    sitter_id     BIGINT REFERENCES pet_sitter(sitter_id) ON DELETE CASCADE,
    booking_id    BIGINT REFERENCES booking(booking_id) ON DELETE SET NULL,
    rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment       TEXT,
    review_date   TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 9. ADVERTISEMENT  (posted by pet_owner)
-- ---------------------------------------------------------------------
CREATE TABLE advertisement (
    ad_id          BIGSERIAL PRIMARY KEY,
    owner_id       BIGINT NOT NULL REFERENCES pet_owner(owner_id) ON DELETE CASCADE,
    title          VARCHAR(150) NOT NULL,
    description    TEXT,
    price          NUMERIC(10,2),
    photo_url      VARCHAR(255),
    status         VARCHAR(20) NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active','inactive','sold','expired')),
    created_date   TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 10. BLOG POST  (posted by pet_sitter or admin -> any user)
-- ---------------------------------------------------------------------
CREATE TABLE blog_post (
    blog_id          BIGSERIAL PRIMARY KEY,
    author_user_id   BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title            VARCHAR(200) NOT NULL,
    content          TEXT,
    medical_notes    TEXT,
    created_date     TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 11. MESSAGE  (user to user)
-- ---------------------------------------------------------------------
CREATE TABLE message (
    message_id     BIGSERIAL PRIMARY KEY,
    sender_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id    BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message_text   TEXT NOT NULL,
    sent_date      TIMESTAMP NOT NULL DEFAULT now(),
    is_read        BOOLEAN NOT NULL DEFAULT FALSE,
    CHECK (sender_id <> receiver_id)
);

-- ---------------------------------------------------------------------
-- 12. NOTIFICATION  (received by a user, e.g. admin)
-- ---------------------------------------------------------------------
CREATE TABLE notification (
    notification_id  BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type             VARCHAR(50),
    message          TEXT,
    is_read          BOOLEAN NOT NULL DEFAULT FALSE,
    created_date     TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 13. ITEM / ORDER / ORDER_ITEM  (pet_owner buys items via an order)
-- ---------------------------------------------------------------------
CREATE TABLE item (
    item_id       BIGSERIAL PRIMARY KEY,
    description   TEXT,
    price         NUMERIC(10,2) NOT NULL,
    stock         INT NOT NULL DEFAULT 0 CHECK (stock >= 0)
);

CREATE TABLE orders (
    order_id      BIGSERIAL PRIMARY KEY,
    owner_id      BIGINT NOT NULL REFERENCES pet_owner(owner_id),
    status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','shipped','completed','cancelled')),
    amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
    order_date    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE order_item (
    order_id     BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    item_id      BIGINT NOT NULL REFERENCES item(item_id),
    quantity     INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price   NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (order_id, item_id)
);

-- =====================================================================
-- 14. INDEXES  (speed up foreign-key lookups & common queries)
-- =====================================================================
CREATE INDEX idx_pet_owner_user_id        ON pet_owner(user_id);
CREATE INDEX idx_pet_sitter_user_id       ON pet_sitter(user_id);
CREATE INDEX idx_admin_user_id            ON admin(user_id);
CREATE INDEX idx_pet_owner_id             ON pet(owner_id);
CREATE INDEX idx_premium_owner_id         ON premium(owner_id);
CREATE INDEX idx_premium_plan_id          ON premium(plan_id);
CREATE INDEX idx_booking_owner_id         ON booking(owner_id);
CREATE INDEX idx_booking_sitter_id        ON booking(sitter_id);
CREATE INDEX idx_booking_pet_id           ON booking(pet_id);
CREATE INDEX idx_payment_booking_id       ON payment(booking_id);
CREATE INDEX idx_review_sitter_id         ON review(sitter_id);
CREATE INDEX idx_review_owner_id          ON review(owner_id);
CREATE INDEX idx_advertisement_owner_id   ON advertisement(owner_id);
CREATE INDEX idx_blog_post_author         ON blog_post(author_user_id);
CREATE INDEX idx_message_sender_id        ON message(sender_id);
CREATE INDEX idx_message_receiver_id      ON message(receiver_id);
CREATE INDEX idx_notification_user_id     ON notification(user_id);
CREATE INDEX idx_orders_owner_id          ON orders(owner_id);
CREATE INDEX idx_order_item_item_id       ON order_item(item_id);
CREATE INDEX idx_users_email              ON users(email);

-- =====================================================================
-- 15. AUTO-UPDATE users.updated_at ON ROW CHANGES
-- =====================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;

-- =====================================================================
--  DONE. Verify with:  \dt   (list tables)
--                      \d users  (describe a table)
-- =====================================================================
