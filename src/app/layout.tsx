import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DustBustars - London On-Demand Cleaning Marketplace",
  description: "Connecting London residents with vetted, DBS-checked independent local cleaners.",
  icons: {
    icon: "/logo.png",
  },
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
