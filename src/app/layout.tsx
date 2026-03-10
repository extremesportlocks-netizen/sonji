import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sonji — The CRM that just works",
  description:
    "Stop paying $700/month for tools you barely use. Sonji is the plug-and-play CRM with honest pricing, zero bloat, and a setup that takes 5 minutes.",
  keywords: ["CRM", "sales", "pipeline", "contacts", "invoicing", "email marketing", "white-label"],
  openGraph: {
    title: "Sonji — The CRM that just works",
    description: "One tool. One price. Everything included.",
    url: "https://sonji.io",
    siteName: "Sonji",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
