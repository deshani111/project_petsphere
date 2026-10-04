import "./globals.css";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import LayoutShell from "./components/layout-shell";

const SESSION_COOKIE_NAME = "petsphere_session";

function getSessionSecret() {
  return process.env.AUTH_SECRET || "petsphere-dev-session-secret";
}

function signSessionPayload(encodedPayload) {
  return createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function verifySessionToken(token) {
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

export const metadata = {
  title: "PetSphere | Trusted Pet Care",
  description: "Find a trusted pet sitter who treats your pet like family.",
  icons: { icon: "/petsphere-mark.svg" },
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const sessionPayload = verifySessionToken(sessionToken);
  const isAuthenticated = Boolean(sessionPayload);
  const userRole = sessionPayload?.role ?? null;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LayoutShell isAuthenticated={isAuthenticated} userRole={userRole}>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}