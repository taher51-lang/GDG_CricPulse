import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CricPulse AI | Live Immersive IPL Dashboard",
  description: "Real-time gamified predictions, AI dugout companion, and flash merch offers for the ultimate IPL fan experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
