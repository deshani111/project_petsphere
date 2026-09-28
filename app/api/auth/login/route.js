import { NextResponse } from "next/server";
import {
  AuthenticationError,
  EmailVerificationRequiredError,
  loginAccount,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "../../../../modules/auth/auth.service";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Please submit valid login details." },
      { status: 400 }
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  const password = typeof body.password === "string" ? body.password : "";
  const rememberMe = body.rememberMe === true;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Please enter your email and password." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { message: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  try {
    const { account, sessionToken } = await loginAccount({
      email,
      password,
      rememberMe,
    });

    const response = NextResponse.json(
      {
        message: "Logged in successfully.",
        account,
        redirectTo: account.role === "pet_owner" ? "/owner/dashboard" : "/",
      },
      { status: 200 }
    );

    const sessionCookie = {
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };

    if (rememberMe) {
      sessionCookie.maxAge = SESSION_MAX_AGE_SECONDS;
    }

    response.cookies.set(sessionCookie);

    return response;
  } catch (error) {
    if (error instanceof EmailVerificationRequiredError) {
      return NextResponse.json(
        { message: error.message },
        { status: 403 }
      );
    }

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    console.error("Login failed:", error);

    return NextResponse.json(
      { message: "Could not log in. Please try again." },
      { status: 500 }
    );
  }
}
