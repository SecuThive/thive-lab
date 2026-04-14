"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Flame, Grid3X3, FileText, Search } from "lucide-react";
import { useState } from "react";

const CATEGORIES = [
  { label: "가전/IT",   slug: "가전-IT" },
  { label: "생활용품", slug: "생활용품" },
  { label: "주방",     slug: "주방" },
  { label: "뷰티/헬스", slug: "뷰티-헬스" },
  { label: "스포츠",   slug: "스포츠" },
  { label: "아이디어", slug: "아이디어" },
  { label: "유아/교육", slug: "유아-교육" },
  { label: "식품",     slug: "식품" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [catOpen, setCatOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/85 backdrop-blur-lg">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex h-15 items-center justify-between gap-4 py-3">

          {/* 로고 */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <span className="text-xs font-black text-black">TL</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-white">Thive Lab</span>
              <span className="text-[10px] text-amber-400/80 tracking-wide">추천 & 리뷰</span>
            </div>
          </Link>

          {/* 네비게이션 링크 */}
          <div className="hidden items-center gap-1 md:flex">
            {/* 인기상품 */}
            <Link
              href="/popular"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/popular")
                  ? "bg-amber-500/10 text-amber-300"
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              인기상품
            </Link>

            {/* 카테고리 드롭다운 */}
            <div className="relative">
              <button
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  catOpen
                    ? "bg-zinc-800/60 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                }`}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                카테고리
              </button>
              {catOpen && (
                <div
                  className="absolute left-0 top-full w-40 rounded-xl border border-zinc-800 bg-zinc-900 py-2 shadow-xl"
                  onMouseEnter={() => setCatOpen(true)}
                  onMouseLeave={() => setCatOpen(false)}
                >
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/blog?category=${encodeURIComponent(c.label)}`}
                      className="block px-4 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-amber-300 transition-colors"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 전체 리뷰 */}
            <Link
              href="/blog"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/blog")
                  ? "bg-amber-500/10 text-amber-300"
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              전체 리뷰
            </Link>
          </div>

          {/* 우측: 검색 + CTA */}
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
              <Search className="h-4 w-4" />
            </button>
            <Link
              href="/blog"
              className="hidden items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-black shadow-md shadow-amber-500/20 transition hover:bg-amber-400 sm:flex"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              추천 보러가기
            </Link>
          </div>

        </div>
      </div>

      {/* 모바일 카테고리 바 */}
      <div className="flex gap-2 overflow-x-auto border-t border-zinc-800/40 px-4 py-2 md:hidden">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/blog?category=${encodeURIComponent(c.label)}`}
            className="shrink-0 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
