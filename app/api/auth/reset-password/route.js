import { NextResponse } from "next/server";
import { PasswordResetError, resetPassword } from "../../../../modules/auth/password-reset.service";

export const runtime = "nodejs";

const INVALID_LINK_MESSAGE = "This password reset link is invalid or has expired. Please request a new one.";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: INVALID_LINK_MESSAGE }, { status: 400 });
  }

  try {
    await resetPassword({
      token: body?.token,
      password: body?.password,
      confirmPassword: body?.confirmPassword,
    });
    return NextResponse.json({ message: "Your password has been reset. Please sign in with your new password." });
  } catch (error) {
    if (error instanceof PasswordResetError) {
      const message = error.code === "INVALID_PASSWORD"
        ? "Password must be at least 8 characters long."
        : error.code === "PASSWORD_MISMATCH"
          ? "Passwords do not match."
          : INVALID_LINK_MESSAGE;
      return NextResponse.json({ message }, { status: 400 });
    }
    return NextResponse.json({ message: "Unable to reset your password right now. Please try again later." }, { status: 500 });
  }
}
