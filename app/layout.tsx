import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Thive Lab — Automated Utilities",
  description: "Thive Lab builds automated utilities and data-driven services for modern teams.",
  metadataBase: new URL("https://thivelab.com"),
  openGraph: {
    title: "Thive Lab",
    description: "Automated utilities and data-driven services for modern teams.",
    url: "https://thivelab.com",
    siteName: "Thive Lab",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Thive Lab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@thivelab",
    creator: "@thivelab",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-zinc-950">
      <body className={`${inter.variable} bg-zinc-950`}>{children}</body>
    </html>
  );
}
