import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdSenseScript } from "@/components/AdSense";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Thive Lab — 쿠팡 실구매 데이터 기반 상품 추천",
  description: "쿠팡 실구매자 평점·리뷰 데이터를 분석해 카테고리별 가성비 좋은 상품을 추천합니다. 가전, 생활용품, 뷰티, 주방용품 등 비교 가이드를 확인하세요.",
  keywords: ["쿠팡 추천", "상품 비교", "가성비 추천", "쿠팡 할인", "상품 추천 가이드", "생활용품 추천", "가전 추천", "쿠팡 파트너스"],
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
    title: "Thive Lab — 쿠팡 실구매 데이터 기반 상품 추천",
    description: "쿠팡 실구매자 평점·리뷰 데이터를 분석해 카테고리별 가성비 좋은 상품을 추천합니다.",
    url: "https://thivelab.com",
    siteName: "Thive Lab",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@devthive",
    creator: "@devthive",
    title: "Thive Lab — 쿠팡 실구매 데이터 기반 상품 추천",
    description: "쿠팡 실구매자 데이터 기반 카테고리별 가성비 상품 추천",
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
  // Google Search Console 소유권 인증 — 서치 콘솔에서 발급받은 코드를 env에 추가
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Thive Lab",
    url: "https://thivelab.com",
    description: "쿠팡 실구매자 평점·리뷰 데이터를 분석해 카테고리별 가성비 좋은 상품을 추천합니다.",
    inLanguage: "ko-KR",
    publisher: {
      "@type": "Organization",
      name: "Thive Lab",
      url: "https://thivelab.com",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://thivelab.com/blog?category={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="ko" className="bg-slate-50">
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Thive Lab RSS"
          href="/rss.xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AdSenseScript />
        <GoogleAnalytics />
      </head>
      <body className={`${inter.variable} bg-slate-50`}>
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
