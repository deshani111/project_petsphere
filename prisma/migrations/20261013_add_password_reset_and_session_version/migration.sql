ALTER TABLE "users" ADD COLUMN "session_version" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "PasswordResetToken" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "tokenHash" VARCHAR(128) NOT NULL,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "usedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PasswordResetRequest" (
    "id" BIGSERIAL NOT NULL,
    "emailHash" VARCHAR(128) NOT NULL,
    "ipHash" VARCHAR(128) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" BIGINT,
    CONSTRAINT "PasswordResetRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "idx_password_reset_token_user_created" ON "PasswordResetToken"("userId", "createdAt");
CREATE INDEX "idx_password_reset_token_expires" ON "PasswordResetToken"("expiresAt");
CREATE INDEX "idx_password_reset_request_email_created" ON "PasswordResetRequest"("emailHash", "createdAt");
CREATE INDEX "idx_password_reset_request_ip_created" ON "PasswordResetRequest"("ipHash", "createdAt");

ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "PasswordResetRequest" ADD CONSTRAINT "PasswordResetRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;
