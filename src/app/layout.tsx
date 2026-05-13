import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edam Property Management",
  description: "Admin portal for property operations, tenant management, payments, maintenance, deposits, and documents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
