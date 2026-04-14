"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowUpRight, ShoppingBag, Tag, SlidersHorizontal } from "lucide-react";
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

const CATEGORIES = [
  "전체", "가전/IT", "생활용품", "주방", "뷰티/헬스", "스포츠", "아이디어", "유아/교육", "식품",
];

const CATEGORY_STYLES: Record<string, string> = {
  "가전/IT":   "border-sky-500/40 text-sky-300",
  "생활용품": "border-emerald-500/40 text-emerald-300",
  "주방":     "border-orange-500/40 text-orange-300",
  "뷰티/헬스": "border-pink-500/40 text-pink-300",
  "스포츠":   "border-lime-500/40 text-lime-300",
  "아이디어": "border-amber-500/40 text-amber-300",
  "유아/교육": "border-violet-500/40 text-violet-300",
  "식품":     "border-rose-500/40 text-rose-300",
};

function catStyle(cat: string | null) {
  return CATEGORY_STYLES[cat ?? ""] ?? "border-zinc-600/60 text-zinc-400";
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function ReviewListInner() {
  const searchParams = useSearchParams();
  const paramCategory = searchParams?.get("category") ?? "전체";

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(
    CATEGORIES.includes(paramCategory) ? paramCategory : "전체"
  );

  useEffect(() => {
    setActiveCategory(CATEGORIES.includes(paramCategory) ? paramCategory : "전체");
  }, [paramCategory]);

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

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      {/* 헤더 글로우 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-amber-500/8 via-transparent to-transparent"
      />

      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">

        {/* 헤더 */}
        <header className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/50 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-zinc-400">
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
            <span>Thive Lab · 전체 리뷰</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            솔직한 제품 리뷰
          </h1>
          <p className="max-w-xl text-sm text-zinc-400 leading-relaxed">
            직접 써보고 쓴 리뷰만 올립니다. 쿠팡 파트너스 링크가 포함될 수 있어요.
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

        {/* 결과 수 */}
        <p className="mb-5 text-xs text-zinc-600">
          {loading ? "불러오는 중..." : `${posts.length}개의 리뷰`}
        </p>

        {/* 포스트 목록 */}
        {!loading && posts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 px-8 py-16 text-center">
            <p className="text-zinc-500">이 카테고리의 리뷰가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 transition hover:border-amber-500/30 hover:bg-zinc-900/60"
              >
                {/* 카테고리 + 날짜 */}
                <div className="flex items-center justify-between gap-2">
                  {post.category && (
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${catStyle(post.category)}`}>
                      {post.category}
                    </span>
                  )}
                  <time className="ml-auto text-xs text-zinc-600">
                    {dateFormatter.format(new Date(post.created_at))}
                  </time>
                </div>

                {/* 제목 */}
                <h2 className="text-sm font-semibold leading-snug text-zinc-100 line-clamp-2 group-hover:text-amber-300 transition-colors">
                  {post.title}
                </h2>

                {/* 요약 */}
                {post.summary && (
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {post.summary}
                  </p>
                )}

                {/* 태그 */}
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Tag className="h-3 w-3 text-zinc-700" />
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-zinc-800 bg-zinc-950/60 px-1.5 py-0.5 text-[10px] text-zinc-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 하단 */}
                <div className="mt-auto flex items-center justify-between">
                  {post.affiliate_url ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400/80">
                      <ShoppingBag className="h-3 w-3" />
                      쿠팡 구매 가능
                    </span>
                  ) : <span />}
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-700 group-hover:text-amber-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 파트너스 고지 */}
        <p className="mt-12 text-center text-xs text-zinc-700 leading-relaxed">
          이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    }>
      <ReviewListInner />
    </Suspense>
  );
}
