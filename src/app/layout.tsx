import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// TODO: Add public/og-default.png (1200x630px) for default social share image

export const metadata: Metadata = {
  title: {
    default: "Encyclo — Azərbaycanın Biznes Ensiklopediyası",
    template: "%s — Encyclo",
  },
  description: "Azərbaycan şirkətlərini, məhsullarını və xidmətlərini kəşf edin.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Encyclo",
    title: "Encyclo — Azərbaycanın Biznes Ensiklopediyası",
    description: "Azərbaycan şirkətlərini, məhsullarını və xidmətlərini kəşf edin.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Encyclo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Encyclo — Azərbaycanın Biznes Ensiklopediyası",
    description: "Azərbaycan şirkətlərini, məhsullarını və xidmətlərini kəşf edin.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
