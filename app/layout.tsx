import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdSenseScript } from "@/components/AdSense";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Thive Lab — Automation Tools & Data Services for Modern Teams",
  description: "Thive Lab delivers automated utilities and data-driven services that eliminate busywork. From pricing intelligence to hiring automation, we build tools that save time and drive results.",
  keywords: ["automation tools", "data services", "business automation", "workflow automation", "SaaS tools", "productivity tools", "startup tools"],
  authors: [{ name: "Thive Lab" }],
  creator: "Thive Lab",
  publisher: "Thive Lab",
  metadataBase: new URL("https://thivelab.com"),
  alternates: {
    canonical: "https://thivelab.com",
  },
  openGraph: {
    title: "Thive Lab — Automation Tools & Data Services",
    description: "Automated utilities and data-driven services designed to eliminate busywork for modern teams.",
    url: "https://thivelab.com",
    siteName: "Thive Lab",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Thive Lab - Automation Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@devthive",
    creator: "@devthive",
    title: "Thive Lab — Automation Tools & Data Services",
    description: "Automated utilities that eliminate busywork for modern teams.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console 인증 후 여기에 추가
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-zinc-950">
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Thive Lab RSS Feed"
          href="/rss.xml"
        />
        <AdSenseScript />
        <GoogleAnalytics />
      </head>
      <body className={`${inter.variable} bg-zinc-950`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
