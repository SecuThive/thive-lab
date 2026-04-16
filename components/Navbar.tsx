"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Flame, Grid3X3, FileText, Menu, X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-lg shadow-sm shadow-gray-100/50">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex h-15 items-center justify-between gap-4 py-3">

          {/* 로고 */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <span className="text-xs font-black text-black">TL</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-gray-900">Thive Lab</span>
              <span className="text-[10px] text-amber-500 tracking-wide">추천 & 리뷰</span>
            </div>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/blog?category=전체"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/blog") && !pathname?.includes("/blog/")
                  ? "bg-amber-50 text-amber-600"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              추천 가이드
            </Link>

            {/* 카테고리 드롭다운 */}
            <div className="relative">
              <button
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  catOpen
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                카테고리
              </button>
              {catOpen && (
                <div
                  className="absolute left-0 top-full w-40 rounded-xl border border-gray-200 bg-white py-2 shadow-lg shadow-gray-200/60"
                  onMouseEnter={() => setCatOpen(true)}
                  onMouseLeave={() => setCatOpen(false)}
                >
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/blog?category=${encodeURIComponent(c.label)}`}
                      className="block px-4 py-1.5 text-sm text-gray-600 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 우측: 모바일 메뉴 + CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors md:hidden"
              aria-label="메뉴 열기"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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

      {/* 모바일 메뉴 */}
      {mobileOpen && (
        <div className="border-t border-gray-200/60 bg-white md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-4 space-y-1">
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-amber-50 hover:text-amber-600 transition-colors"
            >
              <FileText className="h-4 w-4" />
              추천 가이드
            </Link>
            <div className="px-4 py-2">
              <p className="mb-2 text-xs uppercase tracking-widest text-gray-400">카테고리</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/blog?category=${encodeURIComponent(c.label)}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 hover:border-amber-400/60 hover:text-amber-600 transition-colors"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="mx-4 mt-2 flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400"
            >
              <ShoppingBag className="h-4 w-4" />
              추천 보러가기
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
