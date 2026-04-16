"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowUpRight, ShoppingBag, Tag, SlidersHorizontal, Clock, Newspaper } from "lucide-react";
import { supabase } from "@/lib/supabase";

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  tags: string[];
  category: string | null;
  created_at: string;
  affiliate_url?: string | null;
  product_image?: string | null;
};

type RecentPost = {
  id: number;
  slug: string;
  title: string;
  category: string | null;
  cover_image_url: string | null;
  created_at: string;
};

const CATEGORIES = [
  "전체", "가전/IT", "생활용품", "주방", "뷰티/헬스", "스포츠", "아이디어", "유아/교육", "식품",
];

const CATEGORY_STYLES: Record<string, string> = {
  "가전/IT":   "border-sky-200 text-sky-700 bg-sky-50",
  "생활용품": "border-emerald-200 text-emerald-700 bg-emerald-50",
  "주방":     "border-orange-200 text-orange-700 bg-orange-50",
  "뷰티/헬스": "border-pink-200 text-pink-700 bg-pink-50",
  "스포츠":   "border-lime-200 text-lime-700 bg-lime-50",
  "아이디어": "border-amber-200 text-amber-700 bg-amber-50",
  "유아/교육": "border-violet-200 text-violet-700 bg-violet-50",
  "식품":     "border-rose-200 text-rose-700 bg-rose-50",
};

function catStyle(cat: string | null) {
  return CATEGORY_STYLES[cat ?? ""] ?? "border-gray-200 text-gray-500 bg-gray-50";
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
});

function ReviewListInner() {
  const searchParams = useSearchParams();
  const paramCategory = searchParams?.get("category") ?? "전체";

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(
    CATEGORIES.includes(paramCategory) ? paramCategory : "전체"
  );

  useEffect(() => {
    setActiveCategory(CATEGORIES.includes(paramCategory) ? paramCategory : "전체");
  }, [paramCategory]);

  // 메인 콘텐츠: blog_posts
  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from("blog_posts")
      .select("id, slug, title, summary, tags, category, created_at, affiliate_url, product_image")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(60);

    if (activeCategory !== "전체") {
      query = query.eq("category", activeCategory);
    }

    query.then(({ data }) => {
      setPosts((data ?? []) as BlogPost[]);
      setLoading(false);
    });
  }, [activeCategory]);

  // 사이드바: posts 테이블 (기존 생성된 콘텐츠)
  useEffect(() => {
    supabase
      .from("posts")
      .select("id, slug, title, category, cover_image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setRecentPosts((data ?? []) as RecentPost[]);
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50 text-gray-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-amber-400/5 via-transparent to-transparent"
      />

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">

        {/* 헤더 */}
        <header className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-gray-500 shadow-sm">
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" />
            <span>Thive Lab · 추천 가이드</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            카테고리별 추천 가이드
          </h1>
          <p className="max-w-xl text-sm text-gray-500 leading-relaxed">
            쿠팡 실구매자 평점·리뷰 데이터를 분석해 가성비 좋은 상품을 추천합니다.
          </p>
        </header>

        {/* 카테고리 필터 */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              data-active={activeCategory === cat ? "true" : "false"}
              className="category-pill text-sm"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── 2-Column 레이아웃 ─────────────────────────────────── */}
        <div className="flex gap-8">

          {/* 왼쪽: 메인 콘텐츠 */}
          <div className="min-w-0 flex-1">
            <p className="mb-5 text-xs text-gray-400">
              {loading ? "불러오는 중..." : `${posts.length}개의 추천 가이드`}
            </p>

            {!loading && posts.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-8 py-16 text-center shadow-sm">
                <p className="text-gray-400">이 카테고리의 추천 가이드가 없습니다.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-amber-300 hover:shadow-md hover:shadow-amber-100/60"
                  >
                    {post.product_image && (
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.product_image}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex items-center justify-between gap-2">
                        {post.category && (
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${catStyle(post.category)}`}>
                            {post.category}
                          </span>
                        )}
                        <time className="ml-auto text-xs text-gray-400">
                          {dateFormatter.format(new Date(post.created_at))}
                        </time>
                      </div>

                      <h2 className="text-sm font-semibold leading-snug text-gray-800 line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {post.title}
                      </h2>

                      {post.summary && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {post.summary}
                        </p>
                      )}

                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <Tag className="h-3 w-3 text-gray-300" />
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between">
                        {post.affiliate_url ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                            <ShoppingBag className="h-3 w-3" />
                            쿠팡 추천
                          </span>
                        ) : <span />}
                        <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-amber-500 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 사이드바 */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-20 space-y-6">

              {/* 최근 생성된 포스트 (posts 테이블) */}
              {recentPosts.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
                    <Newspaper className="h-3.5 w-3.5 text-amber-500" />
                    <span>최근 포스트</span>
                  </div>
                  <div className="space-y-3">
                    {recentPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="group flex gap-3 rounded-xl p-2 -mx-2 transition hover:bg-amber-50"
                      >
                        {post.cover_image_url && (
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.cover_image_url}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-700 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                            {post.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            {post.category && (
                              <span className="text-[10px] text-gray-400">{post.category}</span>
                            )}
                            <time className="text-[10px] text-gray-300">
                              {shortDateFormatter.format(new Date(post.created_at))}
                            </time>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 카테고리 요약 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>카테고리</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter((c) => c !== "전체").map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                        activeCategory === cat
                          ? "border-amber-400 bg-amber-50 text-amber-700"
                          : "border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 파트너스 고지 */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.
                  추천 상품은 쿠팡 실구매자 데이터를 기반으로 선정됩니다.
                </p>
              </div>

            </div>
          </aside>

        </div>

        {/* 모바일 파트너스 고지 */}
        <p className="mt-12 text-center text-xs text-gray-400 leading-relaxed lg:hidden">
          이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.
          추천 상품은 쿠팡 실구매자 데이터를 기반으로 선정됩니다.
        </p>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    }>
      <ReviewListInner />
    </Suspense>
  );
}
