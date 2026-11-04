import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/app/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edam Property Management | Homes & Commercial Spaces in Hyderabad",
  description: "Explore Edam-managed homes and commercial properties across Hyderabad, Telangana. Find a property, enquire online, or access the tenant portal.",
  applicationName: "Edam Property Management",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Edam PM",
  },
};

export const viewport: Viewport = {
  themeColor: "#123b36",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
