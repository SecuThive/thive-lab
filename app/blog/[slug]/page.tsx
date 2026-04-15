import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Tag, Calendar, ShoppingCart, ExternalLink, ShoppingBag } from "lucide-react";
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
      .select("id, slug, title, category, created_at")
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
  "가전/IT":   "border-sky-500/40 text-sky-300",
  "생활용품": "border-emerald-500/40 text-emerald-300",
  "주방":     "border-orange-500/40 text-orange-300",
  "뷰티/헬스": "border-pink-500/40 text-pink-300",
  "스포츠":   "border-lime-500/40 text-lime-300",
  "아이디어": "border-amber-500/40 text-amber-300",
  "유아/교육": "border-violet-500/40 text-violet-300",
  "식품":     "border-rose-500/40 text-rose-300",
};

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.category, post.slug);
  const categoryStyle = CATEGORY_STYLES[post.category ?? ""] ?? "border-zinc-600 text-zinc-400";

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
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-amber-500/8 via-transparent to-transparent"
      />

      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">

        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4" />
          추천 가이드
        </Link>

        {/* ── 공정위 문구 (이미지) — SEO 키워드 밀도 보호 ────────────── */}
        <div className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/coupang-disclosure.svg"
            alt="쿠팡 파트너스 대가성 문구"
            width={800}
            height={40}
            className="w-full max-w-full rounded-lg"
            loading="eager"
          />
        </div>

        {/* ── 포스트 헤더 ──────────────────────────────────────────── */}
        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {post.category && (
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${categoryStyle}`}>
                {post.category}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Calendar className="h-3.5 w-3.5" />
              {dateFormatter.format(new Date(post.created_at))}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {post.title}
          </h1>

          {post.summary && (
            <p className="text-base leading-relaxed text-zinc-400">{post.summary}</p>
          )}

          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Tag className="h-3.5 w-3.5 text-zinc-600" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-zinc-800 bg-zinc-900/60 px-2.5 py-0.5 text-xs text-zinc-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* ── 상품 이미지 ─────────────────────────────────────────── */}
        {post.product_image && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800">
            <Image
              src={post.product_image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* ── 본문 (react-markdown) + CTA ─────────────────────────── */}
        <BlogContent
          content={post.content}
          contentHtml={post.content_html}
          affiliateUrl={post.affiliate_url ?? null}
          title={post.title}
          category={post.category ?? undefined}
          slug={post.slug}
        />

        {/* ── 관련 글 ─────────────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-5 text-lg font-semibold text-white">관련 추천 가이드</h2>
            <div className="space-y-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-5 py-3 transition hover:border-amber-500/30 hover:bg-zinc-900/60"
                >
                  <span className="text-sm text-zinc-200 line-clamp-1">{r.title}</span>
                  <ArrowLeft className="h-3.5 w-3.5 shrink-0 rotate-180 text-zinc-600" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-amber-400"
          >
            <ArrowLeft className="h-4 w-4" />
            전체 추천 보기
          </Link>
        </div>

      </div>
    </div>
  );
}
