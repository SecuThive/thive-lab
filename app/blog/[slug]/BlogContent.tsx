"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ShoppingCart, ExternalLink, ShoppingBag, Star, ChevronDown, Zap } from "lucide-react";
import { trackAffiliateLinkClick } from "@/lib/analytics";

type BlogContentProps = {
  content: string;
  contentHtml: string | null;
  affiliateUrl: string | null;
  title: string;
  category?: string;
  slug: string;
};

export default function BlogContent({
  content,
  contentHtml,
  affiliateUrl,
  title,
  category,
  slug,
}: BlogContentProps) {
  const topCtaRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // 조회수 1회 카운트 (세션당 중복 방지)
  useEffect(() => {
    const key = `viewed_${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);

  // 상단 CTA가 뷰포트를 벗어나면 하단 고정 바 노출
  useEffect(() => {
    if (!affiliateUrl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { rootMargin: "0px 0px 0px 0px" }
    );
    const el = topCtaRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [affiliateUrl]);

  const handleCTAClick = (position: string) => {
    trackAffiliateLinkClick({ productName: title, category, slug });
    // GA4 이벤트 (선택)
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "cta_click", { position, title });
    }
  };

  return (
    <>
      {/* ── 상단 CTA 배너 ────────────────────────────────────────── */}
      {affiliateUrl && (
        <div
          ref={topCtaRef}
          className="mb-8 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm shadow-amber-100"
        >
          {/* 상단 강조 띠 */}
          <div className="flex items-center gap-2 bg-amber-500 px-5 py-2">
            <Zap className="h-3.5 w-3.5 text-black" />
            <span className="text-xs font-bold text-black tracking-wide">쿠팡 최저가 · 로켓배송</span>
          </div>

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <ShoppingBag className="h-5 w-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800 line-clamp-1">{title}</p>
                <div className="mt-0.5 flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`h-3 w-3 ${i <= 4 ? "fill-amber-400 text-amber-400" : "fill-amber-200 text-amber-200"}`} />
                  ))}
                  <span className="ml-1 text-[11px] text-gray-500">실구매자 추천</span>
                </div>
              </div>
            </div>
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => handleCTAClick("top")}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-black shadow-md shadow-amber-300/40 transition hover:bg-amber-400 active:scale-95"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              쿠팡 보러가기
            </a>
          </div>
        </div>
      )}

      {/* ── 구분선 ────────────────────────────────────────────────── */}
      <hr className="border-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-10" />

      {/* ── 본문 ──────────────────────────────────────────────────── */}
      <article className="prose-blog">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ children }) => (
              <div className="overflow-x-auto mb-8 rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-sm border-collapse min-w-[500px]">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead>{children}</thead>,
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => <tr>{children}</tr>,
            th: ({ children }) => (
              <th className="border-b border-gray-200 bg-amber-50 px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider first:rounded-tl-xl last:rounded-tr-xl">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-b border-gray-100 px-4 py-3 text-gray-700 text-[13px]">
                {children}
              </td>
            ),
            a: ({ href, children }) => {
              const text = String(children ?? "");
              const isBuyLink =
                text.includes("구매") ||
                text.includes("쿠팡") ||
                text.includes("보러가기") ||
                text.includes("바로가기") ||
                text.includes("주문하기");
              if (isBuyLink) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-black shadow-md shadow-amber-300/40 transition hover:bg-amber-400 active:scale-95 no-underline my-1"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 flex-shrink-0" />
                    {children}
                  </a>
                );
              }
              return (
                <a
                  href={href}
                  className="text-amber-600 underline underline-offset-2 decoration-amber-400/50 hover:text-amber-500 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              );
            },
            img: ({ src, alt }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ""} className="rounded-2xl max-w-full my-6 border border-gray-100 shadow-sm" loading="lazy" />
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-6 border-l-4 border-amber-400 bg-amber-50 rounded-r-xl px-5 py-4 text-gray-700 not-italic">
                {children}
              </blockquote>
            ),
            hr: () => (
              <hr className="border-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-10" />
            ),
            li: ({ children }) => (
              <li className="leading-relaxed pl-1 marker:text-amber-500">{children}</li>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      {/* ── 구분선 ────────────────────────────────────────────────── */}
      <hr className="border-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-14 mb-10" />

      {/* ── 하단 대형 CTA ─────────────────────────────────────────── */}
      {affiliateUrl && (
        <div className="rounded-3xl border border-gray-200 bg-white shadow-md shadow-gray-100 overflow-hidden">
          {/* 상단 포인트 */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-6 py-3 flex items-center justify-center gap-2">
            <span className="text-sm font-bold text-black">지금 쿠팡에서 최저가 확인하세요</span>
          </div>

          <div className="px-8 py-8 text-center">
            {/* 아이콘 */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200">
              <ShoppingCart className="h-8 w-8 text-amber-500" />
            </div>

            {/* 제목 */}
            <p className="mb-2 text-xl font-bold text-gray-900 leading-snug">
              이 상품, 더 알아보고 싶으신가요?
            </p>
            <p className="mb-1 text-sm text-gray-500">
              쿠팡에서 실구매자 리뷰 · 최저가 · 배송일을 확인해 보세요.
            </p>

            {/* 신뢰 포인트 */}
            <div className="my-5 flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="text-emerald-500 font-bold">✓</span> 무료 반품
              </span>
              <span className="w-px h-3 bg-gray-200" />
              <span className="flex items-center gap-1">
                <span className="text-emerald-500 font-bold">✓</span> 로켓배송
              </span>
              <span className="w-px h-3 bg-gray-200" />
              <span className="flex items-center gap-1">
                <span className="text-emerald-500 font-bold">✓</span> 안전결제
              </span>
            </div>

            {/* CTA 버튼 */}
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => handleCTAClick("bottom")}
              className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 text-base font-bold text-black shadow-lg shadow-amber-400/30 transition hover:bg-amber-400 active:scale-[0.98]"
            >
              <ShoppingBag className="h-5 w-5" />
              쿠팡에서 구매하기
            </a>

            <p className="mt-3 text-[11px] text-gray-400">
              이 링크는 쿠팡 파트너스 제휴 링크입니다. 구매자에게 추가 비용이 없습니다.
            </p>
          </div>
        </div>
      )}

      {/* ── 하단 고정 CTA 바 (스크롤 시 노출) ───────────────────── */}
      {affiliateUrl && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 border-t border-amber-200 bg-white px-4 py-3 shadow-xl shadow-black/10 transition-all duration-300 ${
            showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 line-clamp-1">{title}</p>
              <p className="text-[11px] text-gray-400">쿠팡 최저가 · 로켓배송 가능</p>
            </div>
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => handleCTAClick("sticky")}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black shadow-md shadow-amber-400/30 transition hover:bg-amber-400 active:scale-95"
            >
              <ShoppingBag className="h-4 w-4" />
              구매하기
            </a>
          </div>
        </div>
      )}
    </>
  );
}
