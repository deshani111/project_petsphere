import { NextResponse } from "next/server";
import {
  EmailVerificationError,
  verifyEmailVerificationToken,
} from "../../../../modules/auth/verification.service";

function getRedirectUrl(request, status) {
  const baseUrl = new URL(request.url);
  baseUrl.pathname = "/verify-email";
  baseUrl.search = "";
  baseUrl.searchParams.set("status", status);
  return baseUrl;
}

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(getRedirectUrl(request, "missing-token"), 303);
  }

  try {
    await verifyEmailVerificationToken(token);
    return NextResponse.redirect(getRedirectUrl(request, "success"), 303);
  } catch (error) {
    if (error instanceof EmailVerificationError) {
      switch (error.code) {
        case "ALREADY_VERIFIED":
          return NextResponse.redirect(
            getRedirectUrl(request, "already-verified"),
            303
          );
        case "EXPIRED_TOKEN":
          return NextResponse.redirect(
            getRedirectUrl(request, "expired"),
            303
          );
        case "MISSING_TOKEN":
        case "INVALID_TOKEN":
        default:
          return NextResponse.redirect(getRedirectUrl(request, "invalid"), 303);
      }
    }

    console.error("Email verification failed:", error);
    return NextResponse.redirect(getRedirectUrl(request, "invalid"), 303);
  }
}
