import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Tag, Calendar, ShoppingBag, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BlogContent from "./BlogContent";

export const revalidate = 60;

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  content_html: string | null;
  content: string;
  tags: string[];
  category: string | null;
  created_at: string;
  affiliate_url?: string | null;
  product_image?: string | null;
};

async function getPost(rawSlug: string): Promise<BlogPost | null> {
  const slug = decodeURIComponent(rawSlug);
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, summary, content_html, content, tags, category, created_at, affiliate_url, product_image")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    if (error || !data) {
      console.error("[blog/slug] getPost failed:", slug, error?.message);
      return null;
    }
    return data as BlogPost;
  } catch (e) {
    console.error("[blog/slug] getPost exception:", slug, e);
    return null;
  }
}

async function getRelatedPosts(category: string | null, currentSlug: string) {
  if (!category) return [];
  try {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, slug, title, category, created_at, product_image")
      .eq("status", "published")
      .eq("category", category)
      .neq("slug", currentSlug)
      .order("created_at", { ascending: false })
      .limit(3);
    return data ?? [];
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) return { title: "Not Found", robots: { index: false, follow: false } };
  const canonical = `https://thivelab.com/blog/${post.slug}`;
  return {
    title: `${post.title} | Thive Lab`,
    description: post.summary ?? undefined,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      url: canonical,
      type: "article",
      siteName: "Thive Lab",
      locale: "ko_KR",
      images: post.product_image ? [{ url: post.product_image, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary ?? undefined,
    },
  };
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

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

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.category, post.slug);
  const categoryStyle = CATEGORY_STYLES[post.category ?? ""] ?? "border-gray-200 text-gray-500 bg-gray-50";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary ?? undefined,
    image: post.product_image ?? undefined,
    datePublished: post.created_at,
    author: { "@type": "Organization", name: "Thive Lab", url: "https://thivelab.com" },
    publisher: {
      "@type": "Organization",
      name: "Thive Lab",
      logo: { "@type": "ImageObject", url: "https://thivelab.com/icon.png" },
    },
    mainEntityOfPage: `https://thivelab.com/blog/${post.slug}`,
    articleSection: post.category ?? undefined,
    keywords: post.tags?.join(", ") || undefined,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">

        {/* ── 뒤로가기 ────────────────────────────────────────────── */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          추천 가이드 목록
        </Link>

        {/* ── 공정위 문구 ──────────────────────────────────────────── */}
        <div className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/coupang-disclosure.svg"
            alt="쿠팡 파트너스 대가성 문구"
            width={800}
            height={40}
            className="w-full max-w-full rounded-lg opacity-70"
            loading="eager"
          />
        </div>

        {/* ── 헤더 카드 ────────────────────────────────────────────── */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

          {/* 상품 이미지 */}
          {post.product_image && (
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
              <Image
                src={post.product_image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
              {/* 이미지 위 카테고리 뱃지 */}
              {post.category && (
                <div className="absolute left-4 top-4">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${categoryStyle}`}>
                    {post.category}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 헤더 텍스트 영역 */}
          <div className="px-6 py-6 sm:px-8">
            {/* 카테고리 + 날짜 (이미지 없을 때) */}
            {!post.product_image && (
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {post.category && (
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryStyle}`}>
                    {post.category}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {dateFormatter.format(new Date(post.created_at))}
                </span>
              </div>
            )}

            <h1 className="text-2xl font-bold leading-snug tracking-tight text-gray-900 sm:text-3xl">
              {post.title}
            </h1>

            {post.summary && (
              <p className="mt-3 text-base leading-relaxed text-gray-500">{post.summary}</p>
            )}

            {/* 날짜 (이미지 있을 때) */}
            {post.product_image && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                {dateFormatter.format(new Date(post.created_at))}
              </p>
            )}

            {/* 태그 */}
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 헤더 인라인 CTA (affiliate 있을 때) */}
            {post.affiliate_url && (
              <a
                href={post.affiliate_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-black shadow-md shadow-amber-300/40 transition hover:bg-amber-400 active:scale-[0.98] sm:w-auto sm:justify-start"
              >
                <ShoppingBag className="h-4 w-4" />
                쿠팡에서 가격 확인하기
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            )}
          </div>
        </div>

        {/* ── 본문 + CTA들 ─────────────────────────────────────────── */}
        <BlogContent
          content={post.content}
          contentHtml={post.content_html}
          affiliateUrl={post.affiliate_url ?? null}
          title={post.title}
          category={post.category ?? undefined}
          slug={post.slug}
        />

        {/* ── 관련 추천 가이드 ──────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-gray-800">
              <span className="h-4 w-1 rounded-full bg-amber-500" />
              같은 카테고리 추천
            </h2>
            <div className="space-y-3">
              {(related as Array<{ id: number; slug: string; title: string; category: string | null; created_at: string; product_image?: string | null }>).map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 transition hover:border-amber-300 hover:shadow-sm"
                >
                  {r.product_image && (
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.product_image}
                        alt={r.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <span className="flex-1 text-sm font-medium text-gray-700 line-clamp-2 group-hover:text-amber-700 transition-colors leading-snug">
                    {r.title}
                  </span>
                  <ArrowLeft className="h-4 w-4 shrink-0 rotate-180 text-gray-300 group-hover:text-amber-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── 목록으로 ────────────────────────────────────────────── */}
        <div className="mt-10 border-t border-gray-200 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            전체 추천 가이드 보러가기
          </Link>
        </div>

      </div>
    </div>
  );
}
