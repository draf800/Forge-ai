import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forge AI — build sites by describing them",
  description: "Describe a site. Get working code, a database, login, and payments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}
