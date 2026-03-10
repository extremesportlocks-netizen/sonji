import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
