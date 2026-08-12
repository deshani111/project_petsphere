import "./globals.css";
import { cookies } from "next/headers";
import LayoutShell from "./components/layout-shell";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "../modules/auth/auth.service";

export const metadata = {
  title: "PetSphere | Trusted Pet Care",
  description: "Find a trusted pet sitter who treats your pet like family.",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(verifySessionToken(sessionToken));

  return (
    <html lang="en">
      <body>
        <LayoutShell isAuthenticated={isAuthenticated}>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
