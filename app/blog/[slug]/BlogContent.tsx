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

      <hr className="border-zinc-800 mb-10" />

      {/* ── 본문 (react-markdown with GFM tables) ────────────── */}
      <article className="prose-blog">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ children }) => (
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead>{children}</thead>,
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => <tr className="hover:bg-zinc-800/30">{children}</tr>,
            th: ({ children }) => (
              <th className="border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-left text-xs font-semibold text-zinc-200">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-zinc-800 px-3 py-2 text-zinc-300">{children}</td>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-amber-400 underline underline-offset-2 hover:text-amber-300" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            img: ({ src, alt }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ""} className="rounded-xl max-w-full my-4" loading="lazy" />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      <hr className="border-zinc-800 mt-14 mb-10" />

      {/* ── 쿠팡 CTA — 본문 아래 (대형) ─────────────────────── */}
      {affiliateUrl && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
          <div className="mb-3 flex justify-center">
            <ShoppingCart className="h-8 w-8 text-amber-400" />
          </div>
          <p className="mb-1 text-sm font-semibold text-white">이 상품이 궁금하신가요?</p>
          <p className="mb-5 text-xs text-zinc-500">쿠팡에서 실구매자 리뷰와 최저가를 확인해 보세요.</p>
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
