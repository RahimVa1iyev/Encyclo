// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

// TODO: Add public/og-default.png (1200x630px) for default social share image

export const metadata: Metadata = {
  title: {
    default: "Encyclo — Azərbaycanın Biznes Ensiklopediyası",
    template: "%s — Encyclo",
  },
  description: "Azərbaycan şirkətlərini, məhsullarını və xidmətlərini kəşf edin.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Encyclo",
    title: "Encyclo — Azərbaycanın Biznes Ensiklopediyası",
    description: "Azərbaycan şirkətlərini, məhsullarını və xidmətlərini kəşf edin.",
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Encyclo — Azərbaycanın Biznes Ensiklopediyası",
    description: "Azərbaycan şirkətlərini, məhsullarını və xidmətlərini kəşf edin.",
    images: ['/og-default.png'],
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230A0A0A'/%3E%3Ctext x='8' y='48' font-family='Georgia,serif' font-size='40' font-weight='700' font-style='italic' fill='white'%3EE%3C/text%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
