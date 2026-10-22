import { NextResponse } from "next/server";
import { buildPasswordResetLink, sendPasswordResetEmail } from "../../../../modules/auth/email.service";
import { discardPasswordResetToken, requestPasswordReset } from "../../../../modules/auth/password-reset.service";

export const runtime = "nodejs";

const GENERIC_MESSAGE = "If an eligible PetSphere account matches that email address, you will receive a secure password-reset link shortly. Please check your inbox and spam folder.";

function genericResponse() {
  return NextResponse.json({ message: GENERIC_MESSAGE });
}

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    // Keep the response intentionally indistinguishable.
  }

  try {
    const reset = await requestPasswordReset({
      email: typeof body?.email === "string" ? body.email : "",
      ipAddress: getClientIp(request),
    });
    if (!reset) return genericResponse();

    try {
      const resetUrl = buildPasswordResetLink(reset.token);
      await sendPasswordResetEmail({
        to: reset.user.email,
        recipientName: `${reset.user.first_name} ${reset.user.last_name}`.trim(),
        resetUrl,
      });
    } catch {
      await discardPasswordResetToken({ userId: reset.user.user_id, tokenHash: reset.tokenHash });
      console.error("Password reset email delivery failed.");
    }
  } catch {
    // Do not expose account, database, provider, token, or URL details.
    console.error("Password reset request processing failed.");
  }

  return genericResponse();
}
