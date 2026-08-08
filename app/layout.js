import "./globals.css";
import LayoutShell from "./components/layout-shell";

export const metadata = {
  title: "PetSphere | Sitter Dashboard",
  description: "Sitter dashboard for managing bookings, services, earnings, and messages.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
