import "./globals.css";

export const metadata = {
  title: "PetSphere | Trusted Pet Care",
  description: "Find a trusted pet sitter who treats your pet like family.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
