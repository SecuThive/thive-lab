"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag, Flame, Menu, X, ChevronDown,
  Tv, Home, Utensils, Sparkles, Dumbbell, Lightbulb, Baby, Cookie,
  ArrowUpRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  { label: "가전/IT",    slug: "가전/IT",    icon: Tv,        color: "text-sky-600",     bg: "bg-sky-50",     border: "border-sky-100"    },
  { label: "생활용품",  slug: "생활용품",   icon: Home,       color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { label: "주방",      slug: "주방",       icon: Utensils,   color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-100"  },
  { label: "뷰티/헬스", slug: "뷰티/헬스", icon: Sparkles,   color: "text-pink-600",    bg: "bg-pink-50",    border: "border-pink-100"    },
  { label: "스포츠",    slug: "스포츠",     icon: Dumbbell,   color: "text-lime-700",    bg: "bg-lime-50",    border: "border-lime-100"    },
  { label: "아이디어",  slug: "아이디어",   icon: Lightbulb,  color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100"   },
  { label: "유아/교육", slug: "유아/교육",  icon: Baby,       color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-100"  },
  { label: "식품",      slug: "식품",       icon: Cookie,     color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-100"    },
];

export default function Navbar() {
  const pathname     = usePathname();
  const [catOpen,    setCatOpen]    = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const catRef       = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 모바일 메뉴 열릴 때 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.07)] backdrop-blur-xl border-b border-gray-200/60"
            : "bg-white border-b border-gray-100"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="flex h-[68px] items-center justify-between gap-6">

            {/* ── 로고 ──────────────────────────────────────────────────── */}
            <Link href="/" className="group flex shrink-0 items-center gap-3" onClick={() => setMobileOpen(false)}>
              {/* 배지 */}
              <div className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-md shadow-amber-300/40 transition-all duration-200 group-hover:shadow-amber-400/60 group-hover:scale-[1.06]">
                <span className="text-[13px] font-black tracking-tighter text-white drop-shadow-sm">TL</span>
                <span className="absolute -right-[3px] -top-[3px] flex h-[9px] w-[9px]">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-[9px] w-[9px] rounded-full bg-emerald-400 ring-2 ring-white" />
                </span>
              </div>
              {/* 텍스트 */}
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-extrabold tracking-tight text-gray-900">
                  Thive<span className="text-amber-500"> Lab</span>
                </span>
                <span className="mt-[3px] text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                  Curated by Data
                </span>
              </div>
            </Link>

            {/* ── 데스크톱 네비게이션 ────────────────────────────────── */}
            <div className="hidden flex-1 items-center gap-0.5 md:flex">

              {/* 추천 가이드 */}
              <Link
                href="/blog"
                className={`group relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
                  isActive("/blog") && !pathname?.includes("/blog/")
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Flame className={`h-3.5 w-3.5 transition-colors ${
                  isActive("/blog") && !pathname?.includes("/blog/") ? "text-amber-500" : "text-gray-400 group-hover:text-amber-400"
                }`} />
                추천 가이드
                {/* 활성 언더라인 */}
                <span className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-amber-500 transition-all duration-200 ${
                  isActive("/blog") && !pathname?.includes("/blog/") ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                }`} />
              </Link>

              {/* 카테고리 드롭다운 */}
              <div
                ref={catRef}
                className="relative"
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
              >
                <button
                  className={`group flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
                    catOpen ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  카테고리
                  <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`} />
                </button>

                {/* 드롭다운 패널 — pt-2로 버튼과 틈새 없이 연결 */}
                <div className="absolute left-1/2 top-full w-[320px] -translate-x-1/2 pt-2">
                  <div className={`transition-all duration-200 ${
                    catOpen
                      ? "pointer-events-auto translate-y-0 opacity-100"
                      : "pointer-events-none -translate-y-1 opacity-0"
                  }`}>
                  <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.10)]">
                    {/* 헤더 */}
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">카테고리별 탐색</p>
                    </div>
                    {/* 그리드 */}
                    <div className="grid grid-cols-2 gap-1.5 p-3">
                      {CATEGORIES.map(({ label, slug, icon: Icon, color, bg, border }) => (
                        <Link
                          key={slug}
                          href={`/blog?category=${encodeURIComponent(label)}`}
                          onClick={() => setCatOpen(false)}
                          className={`group/item flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-150 hover:shadow-sm ${bg} ${border}`}
                        >
                          <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
                          <span className={`text-xs font-bold ${color}`}>{label}</span>
                        </Link>
                      ))}
                    </div>
                    {/* 푸터 */}
                    <div className="border-t border-gray-100 px-4 py-2.5">
                      <Link
                        href="/blog"
                        onClick={() => setCatOpen(false)}
                        className="flex items-center justify-between text-xs font-semibold text-gray-500 transition-colors hover:text-amber-600"
                      >
                        <span>전체 추천 가이드 보기</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ── 우측 액션 ─────────────────────────────────────────── */}
            <div className="flex items-center gap-2.5">

              {/* CTA — 데스크톱 */}
              <Link
                href="/blog"
                className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-400/30 transition-all duration-200 hover:shadow-amber-400/50 hover:brightness-110 active:scale-95 sm:flex"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                추천 보러가기
              </Link>

              {/* 햄버거 — 모바일 */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 md:hidden"
                aria-label="메뉴"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* ── 모바일 오버레이 + 사이드 패널 ─────────────────────────── */}
      {/* 딤드 배경 */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* 슬라이드 패널 */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-[min(80vw,320px)] bg-white shadow-2xl transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 패널 헤더 */}
        <div className="flex h-[68px] items-center justify-between border-b border-gray-100 px-5">
          <span className="text-[13px] font-bold text-gray-900">메뉴</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 패널 본문 */}
        <div className="overflow-y-auto h-[calc(100%-68px)]">
          <div className="space-y-1 px-3 py-4">

            {/* 추천 가이드 */}
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-amber-50 hover:text-amber-700"
            >
              <Flame className="h-4 w-4 text-amber-500" />
              추천 가이드 전체 보기
            </Link>

          </div>

          {/* 카테고리 */}
          <div className="border-t border-gray-100 px-3 py-4">
            <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">카테고리</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(({ label, slug, icon: Icon, color, bg, border }) => (
                <Link
                  key={slug}
                  href={`/blog?category=${encodeURIComponent(label)}`}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition active:scale-95 ${bg} ${border}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                  <span className={`text-xs font-bold ${color}`}>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="border-t border-gray-100 px-5 py-5">
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-300/40 transition hover:brightness-110 active:scale-[0.98]"
            >
              <ShoppingBag className="h-4 w-4" />
              추천 상품 보러가기
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
