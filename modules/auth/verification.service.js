import { createHash, randomBytes } from "crypto";
import { prisma } from "../../lib/prisma";

const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;

export class EmailVerificationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "EmailVerificationError";
    this.code = code;
  }
}

function now() {
  return new Date();
}

function normalizeUserId(userId) {
  if (typeof userId === "bigint") {
    return userId;
  }

  if (typeof userId === "string" || typeof userId === "number") {
    return BigInt(userId);
  }

  throw new Error("A valid userId is required.");
}

export function hashVerificationToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function generateVerificationToken() {
  return randomBytes(VERIFICATION_TOKEN_BYTES).toString("hex");
}

export async function issueEmailVerificationToken(userId) {
  const normalizedUserId = normalizeUserId(userId);

  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId: normalizedUserId,
    },
  });

  const token = generateVerificationToken();
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  await prisma.emailVerificationToken.create({
    data: {
      userId: normalizedUserId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export async function getLatestVerificationToken(userId) {
  const normalizedUserId = normalizeUserId(userId);

  return prisma.emailVerificationToken.findFirst({
    where: {
      userId: normalizedUserId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
    },
  });
}

export async function shouldThrottleVerificationResend(userId) {
  const latestToken = await getLatestVerificationToken(userId);

  if (!latestToken) {
    return false;
  }

  return (
    Date.now() - latestToken.createdAt.getTime() <
    VERIFICATION_RESEND_COOLDOWN_MS
  );
}

export async function verifyEmailVerificationToken(rawToken) {
  const token = typeof rawToken === "string" ? rawToken.trim() : "";

  if (!token) {
    throw new EmailVerificationError(
      "MISSING_TOKEN",
      "A verification token is required."
    );
  }

  const tokenHash = hashVerificationToken(token);

  console.log("RAW TOKEN:", token);
  console.log("TOKEN HASH:", tokenHash);

  const tokenRecord = await prisma.emailVerificationToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        select: {
          user_id: true,
          email: true,
          emailVerified: true,
        },
      },
    },
  });

  console.log("TOKEN RECORD:", tokenRecord);

  if (!tokenRecord) {
    throw new EmailVerificationError(
      "INVALID_TOKEN",
      "The verification token is invalid."
    );
  }

  if (tokenRecord.user.emailVerified) {
    await prisma.emailVerificationToken.update({
      where: {
        id: tokenRecord.id,
      },
      data: {
        expiresAt: now(),
      },
    });

    throw new EmailVerificationError(
      "ALREADY_VERIFIED",
      "This email address has already been verified."
    );
  }

  if (tokenRecord.expiresAt <= now()) {
    await prisma.emailVerificationToken.delete({
      where: {
        id: tokenRecord.id,
      },
    });

    throw new EmailVerificationError(
      "EXPIRED_TOKEN",
      "The verification token has expired."
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.users.update({
      where: {
        user_id: tokenRecord.user.user_id,
      },
      data: {
        emailVerified: true,
        is_verified: true,
      },
    });

    await tx.emailVerificationToken.update({
      where: {
        id: tokenRecord.id,
      },
      data: {
        expiresAt: now(),
      },
    });

    await tx.emailVerificationToken.deleteMany({
      where: {
        userId: tokenRecord.user.user_id,
        id: {
          not: tokenRecord.id,
        },
      },
    });
  });

  return {
    userId: tokenRecord.user.user_id.toString(),
    email: tokenRecord.user.email,
  };
}
