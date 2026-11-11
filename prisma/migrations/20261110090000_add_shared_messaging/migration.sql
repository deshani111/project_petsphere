BEGIN;
-- AlterTable
ALTER TABLE "message" ADD COLUMN     "client_id" UUID,
ADD COLUMN     "conversation_id" BIGINT,
ADD COLUMN     "read_at" TIMESTAMP(6),
ALTER COLUMN "message_text" DROP NOT NULL;

-- CreateTable
CREATE TABLE "conversation" (
    "conversation_id" BIGSERIAL NOT NULL,
    "scope_key" TEXT NOT NULL,
    "owner_user_id" BIGINT NOT NULL,
    "sitter_user_id" BIGINT NOT NULL,
    "booking_id" BIGINT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "message_attachment" (
    "attachment_id" BIGSERIAL NOT NULL,
    "message_id" BIGINT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "original_name" VARCHAR(200) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachment_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_scope_key_key" ON "conversation"("scope_key");

-- CreateIndex
CREATE INDEX "conversation_booking_id_idx" ON "conversation"("booking_id");

-- CreateIndex
CREATE INDEX "conversation_owner_user_id_updated_at_idx" ON "conversation"("owner_user_id", "updated_at");

-- CreateIndex
CREATE INDEX "conversation_sitter_user_id_updated_at_idx" ON "conversation"("sitter_user_id", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "message_attachment_storage_key_key" ON "message_attachment"("storage_key");

-- CreateIndex
CREATE INDEX "message_attachment_message_id_idx" ON "message_attachment"("message_id");

-- CreateIndex
CREATE INDEX "message_conversation_id_message_id_idx" ON "message"("conversation_id", "message_id");

-- CreateIndex
CREATE INDEX "message_receiver_id_is_read_conversation_id_idx" ON "message"("receiver_id", "is_read", "conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_sender_id_client_id_key" ON "message"("sender_id", "client_id");

CREATE INDEX "message_conversation_id_read_at_idx" ON "message"("conversation_id", "read_at");

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("conversation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_sitter_user_id_fkey" FOREIGN KEY ("sitter_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachment" ADD CONSTRAINT "message_attachment_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "message"("message_id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Keep legacy history in one general conversation per owner/sitter pair.
WITH pairs AS (
  SELECT CASE WHEN sender.role = 'pet_owner' THEN m.sender_id ELSE m.receiver_id END AS owner_id,
         CASE WHEN sender.role = 'pet_sitter' THEN m.sender_id ELSE m.receiver_id END AS sitter_id, m.sent_date
  FROM message m JOIN users sender ON sender.user_id = m.sender_id JOIN users recipient ON recipient.user_id = m.receiver_id
  WHERE (sender.role, recipient.role) IN (('pet_owner', 'pet_sitter'), ('pet_sitter', 'pet_owner'))
)
INSERT INTO conversation (scope_key, owner_user_id, sitter_user_id, created_at, updated_at)
SELECT 'direct:' || owner_id || ':' || sitter_id, owner_id, sitter_id, MIN(sent_date), MAX(sent_date)
FROM pairs GROUP BY owner_id, sitter_id;
UPDATE message m SET conversation_id = c.conversation_id FROM conversation c
WHERE c.booking_id IS NULL AND ((m.sender_id = c.owner_user_id AND m.receiver_id = c.sitter_user_id)
  OR (m.sender_id = c.sitter_user_id AND m.receiver_id = c.owner_user_id));
ALTER TABLE conversation ADD CONSTRAINT conversation_distinct_participants CHECK (owner_user_id <> sitter_user_id);
COMMIT;
