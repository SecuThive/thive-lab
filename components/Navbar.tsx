"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag, Flame, Menu, X, ChevronDown,
  Tv, Home, Utensils, Sparkles, Dumbbell, Lightbulb, Baby, Cookie,
} from "lucide-react";
import { useState, useEffect } from "react";

const CATEGORIES = [
  { label: "가전/IT",   slug: "가전/IT",   icon: Tv,        color: "text-sky-600",    bg: "bg-sky-50",    border: "border-sky-200"   },
  { label: "생활용품", slug: "생활용품",   icon: Home,       color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200"},
  { label: "주방",     slug: "주방",       icon: Utensils,  color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-200" },
  { label: "뷰티/헬스", slug: "뷰티/헬스", icon: Sparkles,  color: "text-pink-600",    bg: "bg-pink-50",    border: "border-pink-200"   },
  { label: "스포츠",   slug: "스포츠",     icon: Dumbbell,  color: "text-lime-700",    bg: "bg-lime-50",    border: "border-lime-200"   },
  { label: "아이디어", slug: "아이디어",   icon: Lightbulb, color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200"  },
  { label: "유아/교육", slug: "유아/교육", icon: Baby,      color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200" },
  { label: "식품",     slug: "식품",       icon: Cookie,    color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200"   },
];

export default function Navbar() {
  const pathname = usePathname();
  const [catOpen, setCatOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]   = useState(false);

  // 스크롤 감지 → 배경 전환
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-gray-200/80 bg-white/95 shadow-sm shadow-gray-200/60 backdrop-blur-md"
            : "border-b border-transparent bg-white/60 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* ── 로고 ──────────────────────────────────────────── */}
            <Link href="/" className="flex shrink-0 items-center gap-3 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-300/40 transition group-hover:shadow-amber-400/50 group-hover:scale-105">
                <span className="text-sm font-black text-black tracking-tight">TL</span>
                <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-extrabold text-gray-900 tracking-tight">Thive Lab</span>
                <span className="text-[10px] font-medium text-amber-500 tracking-widest uppercase">쿠팡 추천 큐레이션</span>
              </div>
            </Link>

            {/* ── 데스크톱 네비게이션 ───────────────────────────── */}
            <div className="hidden items-center gap-0.5 md:flex">

              {/* 추천 가이드 */}
              <Link
                href="/blog"
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors rounded-xl ${
                  isActive("/blog") && !pathname?.includes("/blog/")
                    ? "text-amber-600 bg-amber-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                추천 가이드
                {isActive("/blog") && !pathname?.includes("/blog/") && (
                  <span className="absolute bottom-1.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-amber-500" />
                )}
              </Link>

              {/* 카테고리 드롭다운 */}
              <div
                className="relative"
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
              >
                <button
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    catOpen ? "bg-gray-100/80 text-gray-900" : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                  }`}
                >
                  카테고리
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`} />
                </button>

                {/* 메가 드롭다운 */}
                <div
                  className={`absolute left-1/2 top-full mt-1.5 w-72 -translate-x-1/2 transition-all duration-200 ${
                    catOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
                  }`}
                >
                  {/* 연결 브릿지 */}
                  <div className="h-2 w-full" />
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/70">
                    <div className="p-3 grid grid-cols-2 gap-1">
                      {CATEGORIES.map(({ label, slug, icon: Icon, color, bg, border }) => (
                        <Link
                          key={slug}
                          href={`/blog?category=${encodeURIComponent(label)}`}
                          onClick={() => setCatOpen(false)}
                          className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition hover:scale-[1.02] hover:shadow-sm ${bg} ${border}`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                          <span className={`text-xs font-semibold ${color}`}>{label}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5">
                      <Link
                        href="/blog"
                        onClick={() => setCatOpen(false)}
                        className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-amber-600 transition-colors"
                      >
                        전체 추천 가이드 보기
                        <ChevronDown className="h-3 w-3 -rotate-90" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 우측 ──────────────────────────────────────────── */}
            <div className="flex items-center gap-2">
              {/* 모바일 햄버거 */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors md:hidden"
                aria-label="메뉴"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* CTA */}
              <Link
                href="/blog"
                className="hidden items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-black shadow-md shadow-amber-400/30 transition hover:bg-amber-400 hover:shadow-amber-400/40 active:scale-95 sm:flex"
              >
                <ShoppingBag className="h-4 w-4" />
                추천 보러가기
              </Link>
            </div>

          </div>
        </div>

        {/* ── 모바일 메뉴 ────────────────────────────────────────── */}
        <div
          className={`overflow-hidden border-t border-gray-100 bg-white transition-all duration-300 md:hidden ${
            mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-6xl px-4 pb-5 pt-3 space-y-4">
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              <Flame className="h-4 w-4 text-amber-500" />
              추천 가이드 전체 보기
            </Link>

            <div>
              <p className="mb-2.5 px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">카테고리</p>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map(({ label, slug, icon: Icon, color, bg, border }) => (
                  <Link
                    key={slug}
                    href={`/blog?category=${encodeURIComponent(label)}`}
                    onClick={() => setMobileOpen(false)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition active:scale-95 ${bg} ${border}`}
                  >
                    <Icon className={`h-5 w-5 ${color}`} />
                    <span className={`text-[10px] font-semibold text-center leading-tight ${color}`}>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-sm font-bold text-black shadow-md shadow-amber-300/40 transition hover:bg-amber-400 active:scale-[0.98]"
            >
              <ShoppingBag className="h-4 w-4" />
              추천 상품 보러가기
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
