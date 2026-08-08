import bcrypt from "bcrypt";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "../../lib/prisma";

const SESSION_COOKIE_NAME = "petsphere_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

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

function createSessionToken(user) {
  const payload = {
    sub: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
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

export async function registerAccount({
  role,
  fullName,
  phoneNumber,
  email,
  address,
  city,
  password,
}) {
  const { firstName, lastName } = splitFullName(fullName);
  const passwordHash = await bcrypt.hash(password, 12);

  const duplicateAccount = await prisma.users.findUnique({
    where: {
      email,
    },
    select: {
      user_id: true,
    },
  });

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
      },
      select: {
        user_id: true,
        role: true,
        email: true,
        phone_number: true,
        created_at: true,
      },
    });

    if (role === "pet_owner") {
      await tx.pet_owner.create({
        data: {
          user_id: createdUser.user_id,
          address,
          city,
        },
      });
    }

    if (role === "pet_sitter") {
      await tx.pet_sitter.create({
        data: {
          user_id: createdUser.user_id,
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
    address,
    createdAt: newUser.created_at.toISOString(),
  };
}

export async function loginAccount({ email, password }) {
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
      is_verified: true,
    },
  });

  if (!user) {
    throw new AuthenticationError();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new AuthenticationError();
  }

  const account = {
    id: user.user_id.toString(),
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email,
    role: user.role,
    isVerified: user.is_verified,
  };

  return {
    account,
    sessionToken: createSessionToken(account),
  };
}
