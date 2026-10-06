import bcrypt from "bcrypt";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "../../lib/prisma";

const SESSION_COOKIE_NAME = "petsphere_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24;
const DUMMY_PASSWORD_HASH =
  "$2b$12$vaknvapn8DjnoHvc49bLy.NsN7HISd2pzroMp87d3JRdS7vgl5qW2";

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };

export class RegistrationConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "RegistrationConflictError";
  }
}

export class AuthenticationError extends Error {
  constructor(message = "Invalid email or password.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class EmailVerificationRequiredError extends Error {
  constructor(message = "Please verify your email address before logging in.") {
    super(message);
    this.name = "EmailVerificationRequiredError";
  }
}

export class DatabaseConnectionError extends Error {
  constructor(message = "The database connection is currently unavailable.") {
    super(message);
    this.name = "DatabaseConnectionError";
  }
}

function getSessionSecret() {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is not configured.");
  }

  if (!globalThis.petsphereAuthSecret) {
    globalThis.petsphereAuthSecret = randomBytes(32).toString("hex");
  }

  return globalThis.petsphereAuthSecret;
}

function toBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function signSessionPayload(encodedPayload) {
  return createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function createSessionToken(user, maxAgeSeconds) {
  const payload = {
    sub: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signSessionPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function splitFullName(fullName) {
  const nameParts = fullName.trim().split(/\s+/);

  const firstName = nameParts.shift() || fullName;
  const lastName = nameParts.join(" ");

  return {
    firstName,
    lastName,
  };
}

export function verifySessionToken(token) {
  if (typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  const expectedSignature = signSessionPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    );

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function isAdminRole(role) {
  return typeof role === "string" && role.toLowerCase() === ADMIN_ROLE;
}

export async function getSessionAccount(sessionToken) {
  const session = verifySessionToken(sessionToken);

  if (!session || typeof session.sub !== "string") {
    return null;
  }

  let userId;

  try {
    userId = BigInt(session.sub);
  } catch {
    return null;
  }

  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      first_name: true,
      last_name: true,
      email: true,
      role: true,
      is_verified: true,
      admin: { select: { admin_id: true } },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.user_id.toString(),
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email,
    role: user.role,
    isVerified: user.is_verified,
    hasAdminProfile: Boolean(user.admin),
  };
}

export async function registerAccount({
  role,
  fullName,
  phoneNumber,
  email,
  address,
  password,
}) {
  const { firstName, lastName } = splitFullName(fullName);
  const passwordHash = await bcrypt.hash(password, 12);

  let duplicateAccount;

  try {
    duplicateAccount = await prisma.users.findUnique({
      where: {
        email,
      },
      select: {
        user_id: true,
      },
    });
  } catch (error) {
    if (
      error?.code === "P1017" ||
      error?.message?.includes("Server has closed the connection") ||
      error?.message?.includes("Connection terminated") ||
      error?.message?.includes("ECONNRESET")
    ) {
      throw new DatabaseConnectionError();
    }

    throw error;
  }

  if (duplicateAccount) {
    throw new RegistrationConflictError(
      "An account with this email already exists."
    );
  }

  const newUser = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.users.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: passwordHash,
        phone_number: phoneNumber,
        role,
        emailVerified: false,
        is_verified: false,
      },
      select: {
        user_id: true,
        role: true,
        email: true,
        phone_number: true,
        emailVerified: true,
        created_at: true,
      },
    });

    if (role === "pet_owner") {
      await tx.pet_owner.create({
        data: {
          user_id: createdUser.user_id,
          address,
        },
      });
    }

    if (role === "pet_sitter") {
      await tx.pet_sitter.create({
        data: {
          user_id: createdUser.user_id,
          address,
        },
      });
    }

    return createdUser;
  });

  return {
    id: newUser.user_id.toString(),
    role: newUser.role,
    fullName,
    phoneNumber: newUser.phone_number,
    email: newUser.email,
    emailVerified: newUser.emailVerified,
    address,
    createdAt: newUser.created_at.toISOString(),
  };
}

export async function loginAccount({ email, password, rememberMe = false }) {
  const user = await prisma.users.findUnique({
    where: {
      email,
    },
    select: {
      user_id: true,
      first_name: true,
      last_name: true,
      email: true,
      password_hash: true,
      role: true,
      emailVerified: true,
    },
  });

  if (!user) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    throw new AuthenticationError();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    if (process.env.NODE_ENV !== "production") {
      console.info("Login diagnostic:", {
        accountFound: true,
        passwordMatches: false,
      });
    }
    throw new AuthenticationError();
  }

  if (!user.emailVerified) {
    throw new EmailVerificationRequiredError();
  }

  const account = {
    id: user.user_id.toString(),
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email,
    role: user.role,
    isVerified: user.emailVerified,
  };

  return {
    account,
    sessionToken: createSessionToken(
      account,
      rememberMe ? SESSION_MAX_AGE_SECONDS : SESSION_TOKEN_MAX_AGE_SECONDS
    ),
  };
}
