import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DustBustars - London On-Demand Cleaning Marketplace",
  description: "Connecting London residents with vetted, DBS-checked independent local cleaners.",
  icons: {
    icon: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DustBustars",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0b0f19",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0b0f19] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
