"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ShoppingCart, ExternalLink, ShoppingBag } from "lucide-react";
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

  const handleCTAClick = () => {
    trackAffiliateLinkClick({
      productName: title,
      category,
      slug,
    });
  };

  return (
    <>
      {/* ── 쿠팡 CTA — 본문 위 ───────────────────────────────── */}
      {affiliateUrl && (
        <div className="mb-8 flex items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-zinc-200">쿠팡에서 확인 가능</p>
              <p className="text-xs text-zinc-500 line-clamp-1">{title}</p>
            </div>
          </div>
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleCTAClick}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-black shadow-sm shadow-amber-500/20 transition hover:bg-amber-400 active:scale-95"
          >
            <ExternalLink className="h-3 w-3" />
            쿠팡에서 보기
          </a>
        </div>
      )}

      <hr className="border-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-10" />

      {/* ── 본문 (react-markdown with GFM) ────────────────────── */}
      <article className="prose-blog">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // 테이블: 가로 스크롤 래퍼 + 둥근 테두리
            table: ({ children }) => (
              <div className="overflow-x-auto mb-8 rounded-xl border border-zinc-800 bg-zinc-900/20">
                <table className="w-full text-sm border-collapse min-w-[500px]">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead>{children}</thead>,
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => <tr>{children}</tr>,
            th: ({ children }) => (
              <th className="border-b border-zinc-700 bg-zinc-800/60 px-4 py-3 text-left text-xs font-semibold text-amber-300/90 uppercase tracking-wider first:rounded-tl-xl last:rounded-tr-xl">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-b border-zinc-800/40 px-4 py-3 text-zinc-300 text-[13px]">
                {children}
              </td>
            ),
            // 링크
            a: ({ href, children }) => (
              <a href={href} className="text-amber-400 underline underline-offset-2 decoration-amber-400/30 hover:text-amber-300 hover:decoration-amber-300/50 transition-colors" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            // 이미지
            img: ({ src, alt }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ""} className="rounded-xl max-w-full my-6" loading="lazy" />
            ),
            // 인용문
            blockquote: ({ children }) => (
              <blockquote className="my-6 border-l-4 border-amber-500/40 bg-amber-500/5 rounded-r-lg px-5 py-4 text-zinc-300 italic not-italic">
                {children}
              </blockquote>
            ),
            // 수평선
            hr: () => (
              <hr className="border-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent my-10" />
            ),
            // 리스트 마커 강조
            li: ({ children }) => (
              <li className="leading-relaxed pl-1 marker:text-amber-500/60">{children}</li>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      <hr className="border-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mt-14 mb-10" />

      {/* ── 쿠팡 CTA — 본문 아래 (대형) ─────────────────────── */}
      {affiliateUrl && (
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-amber-500/10 p-3">
              <ShoppingCart className="h-7 w-7 text-amber-400" />
            </div>
          </div>
          <p className="mb-2 text-base font-semibold text-white">이 상품이 궁금하신가요?</p>
          <p className="mb-6 text-sm text-zinc-400">쿠팡에서 실구매자 리뷰와 최저가를 확인해 보세요.</p>
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleCTAClick}
            className="btn-coupang mx-auto justify-center text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            쿠팡에서 확인하기
          </a>
        </div>
      )}
    </>
  );
}
