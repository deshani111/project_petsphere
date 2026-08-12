import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  buildVerificationLink,
  sendVerificationEmail,
} from "../../../../modules/auth/email.service";
import {
  issueEmailVerificationToken,
  shouldThrottleVerificationResend,
} from "../../../../modules/auth/verification.service";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function genericResponse() {
  return NextResponse.json(
    {
      message:
        "If an unverified account exists for that email address, a new verification link has been sent.",
    },
    { status: 200 }
  );
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return genericResponse();
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !isValidEmail(email)) {
    return genericResponse();
  }

  const user = await prisma.users.findUnique({
    where: {
      email,
    },
    select: {
      user_id: true,
      first_name: true,
      last_name: true,
      email: true,
      emailVerified: true,
    },
  });

  if (!user || user.emailVerified) {
    return genericResponse();
  }

  if (await shouldThrottleVerificationResend(user.user_id)) {
    return genericResponse();
  }

  try {
    const { token } = await issueEmailVerificationToken(user.user_id);
    const verificationLink = buildVerificationLink(token);

    await sendVerificationEmail({
      to: user.email,
      recipientName: `${user.first_name} ${user.last_name}`.trim(),
      verificationUrl: verificationLink,
    });
  } catch (error) {
    console.error("Failed to resend verification email:", error);
  }

  return genericResponse();
}
