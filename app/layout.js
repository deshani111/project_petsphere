
import "./globals.css";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import LayoutShell from "../components/shared/layout-shell";
import { SESSION_COOKIE_NAME, getCachedSessionAccount } from "../modules/auth/auth.service";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  display: "swap",
  variable: "--font-inter",
  weight: "400 700",
});

const playfairDisplay = localFont({
  src: "./fonts/playfair-display-latin-italic.woff2",
  display: "swap",
  variable: "--font-playfair-display",
  style: "italic",
  weight: "700",
});

export const metadata = {
  title: "PetSphere | Trusted Pet Care",
  description: "Find a trusted pet sitter who treats your pet like family.",
  icons: {
    icon: "/petsphere-mark.svg",
  },
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const account = await getCachedSessionAccount(sessionToken);
  const isAuthenticated = Boolean(account);
  const userRole = account?.role ?? null;

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${playfairDisplay.variable}`}>
        <LayoutShell
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          userName={account?.fullName ?? ""}
        >
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
