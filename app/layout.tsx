import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdSenseScript } from "@/components/AdSense";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Thive Lab — 쿠팡 파트너스 추천 & 상품 리뷰",
  description: "실생활에 도움이 되는 제품을 직접 사용하고 솔직하게 리뷰합니다. 가전, 생활용품, 뷰티, 주방용품 등 카테고리별 추천 상품을 쿠팡 최저가로 확인하세요.",
  keywords: ["쿠팡 파트너스", "상품 추천", "제품 리뷰", "쿠팡 할인", "가성비 추천", "생활용품 추천", "가전 추천", "뷰티 추천"],
  authors: [{ name: "Thive Lab" }],
  creator: "Thive Lab",
  publisher: "Thive Lab",
  metadataBase: new URL("https://thivelab.com"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png",    type: "image/png" },
    ],
  },
  alternates: {
    canonical: "https://thivelab.com",
  },
  openGraph: {
    title: "Thive Lab — 쿠팡 파트너스 추천 & 상품 리뷰",
    description: "실생활에 도움이 되는 제품을 직접 사용하고 솔직하게 리뷰합니다.",
    url: "https://thivelab.com",
    siteName: "Thive Lab",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@devthive",
    creator: "@devthive",
    title: "Thive Lab — 쿠팡 파트너스 추천 & 상품 리뷰",
    description: "실생활에 도움이 되는 제품 리뷰 & 쿠팡 파트너스 추천",
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="bg-zinc-950">
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Thive Lab RSS"
          href="/rss.xml"
        />
        <AdSenseScript />
        <GoogleAnalytics />
      </head>
      <body className={`${inter.variable} bg-zinc-950`}>
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
