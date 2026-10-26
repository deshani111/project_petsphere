import bcrypt from "bcrypt";
import { createHash, createHmac, randomBytes } from "crypto";
import { prisma } from "../../lib/prisma";

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_EMAIL = 3;
const MAX_REQUESTS_PER_IP = 10;
const ELIGIBLE_ROLES = new Set(["pet_owner", "pet_sitter"]);

export class PasswordResetError extends Error {
  constructor(code = "INVALID_TOKEN") {
    super("This password reset link is invalid or has expired.");
    this.name = "PasswordResetError";
    this.code = code;
  }
}

function getRateLimitSecret() {
  const secret = process.env.PASSWORD_RESET_RATE_LIMIT_SECRET || process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("PASSWORD_RESET_RATE_LIMIT_SECRET or AUTH_SECRET is required.");
  }
  if (!globalThis.petspherePasswordResetRateLimitSecret) {
    globalThis.petspherePasswordResetRateLimitSecret = randomBytes(32).toString("hex");
  }
  return globalThis.petspherePasswordResetRateLimitSecret;
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function hashPasswordResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function hashRateLimitValue(value) {
  return createHmac("sha256", getRateLimitSecret()).update(value).digest("hex");
}

function validPassword(password) {
  return typeof password === "string" && password.length >= 8;
}

export async function shouldThrottlePasswordReset({ email, ipAddress }) {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const [emailCount, ipCount] = await Promise.all([
    prisma.passwordResetRequest.count({ where: { emailHash: hashRateLimitValue(email || "invalid"), createdAt: { gte: since } } }),
    prisma.passwordResetRequest.count({ where: { ipHash: hashRateLimitValue(ipAddress || "unknown"), createdAt: { gte: since } } }),
  ]);
  return emailCount >= MAX_REQUESTS_PER_EMAIL || ipCount >= MAX_REQUESTS_PER_IP;
}

export async function recordPasswordResetRequest({ email, ipAddress, userId = null }) {
  await prisma.passwordResetRequest.create({
    data: {
      emailHash: hashRateLimitValue(email || "invalid"),
      ipHash: hashRateLimitValue(ipAddress || "unknown"),
      userId,
    },
  });
}

export async function createPasswordResetToken(userId) {
  const token = randomBytes(TOKEN_BYTES).toString("hex");
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({ where: { userId } });
    await tx.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  });

  return { token, tokenHash, expiresAt };
}

export async function requestPasswordReset({ email: submittedEmail, ipAddress }) {
  const email = normalizeEmail(submittedEmail);
  const throttled = await shouldThrottlePasswordReset({ email, ipAddress });
  if (throttled || !email) {
    await recordPasswordResetRequest({ email, ipAddress });
    return null;
  }

  const user = await prisma.users.findUnique({
    where: { email },
    select: { user_id: true, first_name: true, last_name: true, email: true, role: true },
  });

  await recordPasswordResetRequest({ email, ipAddress, userId: user?.user_id ?? null });
  if (!user || !ELIGIBLE_ROLES.has(user.role)) return null;

  const reset = await createPasswordResetToken(user.user_id);
  return {
    user,
    ...reset,
  };
}

export async function discardPasswordResetToken({ userId, tokenHash }) {
  await prisma.passwordResetToken.deleteMany({ where: { userId, tokenHash } });
}

export async function resetPassword({ token: rawToken, password, confirmPassword }) {
  const token = typeof rawToken === "string" ? rawToken.trim() : "";
  if (!token) throw new PasswordResetError("INVALID_TOKEN");
  if (!validPassword(password)) throw new PasswordResetError("INVALID_PASSWORD");
  if (password !== confirmPassword) throw new PasswordResetError("PASSWORD_MISMATCH");

  const tokenHash = hashPasswordResetToken(token);
  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true },
  });
  if (!tokenRecord) throw new PasswordResetError("INVALID_TOKEN");

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();
  const succeeded = await prisma.$transaction(async (tx) => {
    const consumed = await tx.passwordResetToken.updateMany({
      where: { id: tokenRecord.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (consumed.count !== 1) return false;

    await tx.users.update({
      where: { user_id: tokenRecord.userId },
      data: { password_hash: passwordHash, updated_at: now, session_version: { increment: 1 } },
    });
    await tx.passwordResetToken.deleteMany({ where: { userId: tokenRecord.userId } });
    return true;
  });

  if (!succeeded) throw new PasswordResetError("INVALID_TOKEN");
}
