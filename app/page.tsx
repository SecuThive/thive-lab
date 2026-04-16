import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Flame,
  ShoppingBag,
  Star,
  Tag,
  Zap,
  Tv,
  Home,
  Utensils,
  Sparkles,
  Dumbbell,
  Lightbulb,
  Baby,
  Cookie,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductCard, { type Product } from "@/components/ProductCard";

export const revalidate = 60;

// ── 카테고리 정의 ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "가전/IT",   icon: Tv,         color: "text-sky-600",    bg: "bg-sky-50",    border: "border-sky-200"    },
  { label: "생활용품", icon: Home,        color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { label: "주방",     icon: Utensils,   color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-200"  },
  { label: "뷰티/헬스", icon: Sparkles,   color: "text-pink-600",    bg: "bg-pink-50",    border: "border-pink-200"    },
  { label: "스포츠",   icon: Dumbbell,   color: "text-lime-700",    bg: "bg-lime-50",    border: "border-lime-200"    },
  { label: "아이디어", icon: Lightbulb,  color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200"   },
  { label: "유아/교육", icon: Baby,       color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200"  },
  { label: "식품",     icon: Cookie,     color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200"    },
] as const;

const priceFormatter = new Intl.NumberFormat("ko-KR");
const dateFormatter  = new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" });

// ── 데이터 Fetch ──────────────────────────────────────────────────────────────
async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6);
    return (data ?? []) as Product[];
  } catch { return []; }
}

async function getHotProducts(): Promise<Product[]> {
  try {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .eq("is_hot", true)
      .order("created_at", { ascending: false })
      .limit(4);
    return (data ?? []) as Product[];
  } catch { return []; }
}

type RecentPost = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  tags: string[];
  created_at: string;
  affiliate_url?: string | null;
  product_image?: string | null;
};

async function getRecentPosts(): Promise<RecentPost[]> {
  try {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, slug, title, summary, category, tags, created_at, affiliate_url, product_image")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(6);
    return (data ?? []) as RecentPost[];
  } catch { return []; }
}

// ── 카테고리 색상 매핑 ────────────────────────────────────────────────────────
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

// ── 홈 페이지 ─────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const [featured, hot, posts] = await Promise.all([
    getFeaturedProducts(),
    getHotProducts(),
    getRecentPosts(),
  ]);

  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-16 pt-14 lg:px-8">
        {/* 배경 글로우 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-amber-400/6 via-transparent to-transparent"
        />

        <div className="mx-auto max-w-4xl text-center">
          {/* 뱃지 */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-700">
            <Flame className="h-3.5 w-3.5" />
            <span>쿠팡 실구매자 데이터 기반 추천</span>
          </div>

          <h1 className="mb-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            뭘 사야 할지 모를 때<br />
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              딱 정리해 드립니다
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base text-gray-500 leading-relaxed">
            쿠팡 실구매자 평점·리뷰 수·가격 데이터를 분석해<br />
            카테고리별 가성비 TOP 상품을 큐레이션합니다.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/blog"
              className="btn-coupang text-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              추천 상품 보기
            </Link>
            <Link
              href="#categories"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-900 shadow-sm"
            >
              카테고리 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* ── 카테고리 그리드 ────────────────────────────────────────────────── */}
      <section id="categories" className="px-4 pb-14 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeader
            label="카테고리"
            title="원하는 분야를 골라보세요"
            icon={<Tag className="h-4 w-4 text-amber-500" />}
          />

          <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {CATEGORIES.map(({ label, icon: Icon, color, bg, border }) => (
              <Link
                key={label}
                href={`/blog?category=${encodeURIComponent(label)}`}
                className={`group flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition hover:scale-105 hover:shadow-md ${bg} ${border}`}
              >
                <span className={`rounded-lg p-2 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </span>
                <span className={`text-xs font-medium ${color}`}>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 구독핀 파트너스 배너 ───────────────────────────────────────────── */}
      <section className="px-4 pb-10 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <a
            href="https://www.gudokpin.com/subscribe?ref=구독핀oeOkh"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 px-6 py-5 transition hover:border-violet-300 hover:shadow-md hover:shadow-violet-100"
          >
            {/* 배경 글로우 */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 h-full w-64 bg-gradient-to-l from-violet-100/50 to-transparent"
            />

            {/* 아이콘 */}
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-white text-lg font-black text-violet-600 shadow-sm">
              핀
            </div>

            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-gray-900">구독핀</span>
                <span className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[10px] font-medium text-violet-600">
                  파트너스
                </span>
              </div>
              <p className="text-xs text-gray-500">
                각종 구독 서비스를 한 곳에서 관리 — 추천 코드로 구매 시{" "}
                <span className="font-semibold text-violet-600">3,000원 할인</span>
              </p>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition group-hover:bg-violet-50">
              할인받기
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </a>
        </div>
      </section>

      {/* ── 이번 주 HOT 상품 ───────────────────────────────────────────────── */}
      {hot.length > 0 && (
        <section className="px-4 pb-14 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <SectionHeader
              label="이번 주 핫딜"
              title="지금 가장 인기 있어요"
              icon={<Flame className="h-4 w-4 text-orange-500" />}
              href="/blog"
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {hot.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 추천 상품 ──────────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="px-4 pb-14 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <SectionHeader
              label="에디터 픽"
              title="믿고 사는 추천 상품"
              icon={<Star className="h-4 w-4 text-amber-500" />}
              href="/blog"
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 최신 리뷰 글 ──────────────────────────────────────────────────── */}
      <section className="px-4 pb-14 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeader
            label="최신 가이드"
            title="최근 올라온 추천 가이드"
            icon={<Zap className="h-4 w-4 text-amber-500" />}
            href="/blog"
          />

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white py-14 text-center shadow-sm">
              <p className="text-gray-400">아직 가이드가 없습니다. 곧 업로드됩니다!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition hover:border-amber-300 hover:text-amber-600 shadow-sm"
            >
              전체 추천 보기
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 파트너스 고지 ─────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-gray-50 px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-4 text-center">
          <p className="text-xs text-gray-400 leading-relaxed max-w-2xl mx-auto">
            이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.<br />
            구매자에게는 추가 비용이 발생하지 않으며, 추천 상품은 쿠팡 실구매자 평점·리뷰 데이터를 기반으로 선정됩니다.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">개인정보처리방침</Link>
            <Link href="/terms"   className="hover:text-gray-600 transition-colors">이용약관</Link>
            <Link href="/blog"    className="hover:text-gray-600 transition-colors">전체 추천</Link>
          </div>
          <p className="text-xs text-gray-300">© {new Date().getFullYear()} Thive Lab. All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}

// ── 서브 컴포넌트 ─────────────────────────────────────────────────────────────

function SectionHeader({
  label, title, icon, href,
}: {
  label: string;
  title: string;
  icon: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
          {icon}
          {label}
        </div>
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-xs text-gray-400 hover:text-amber-500 transition-colors"
        >
          더 보기 <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function PostCard({ post }: { post: RecentPost }) {
  const style = (cat: string | null) =>
    CATEGORY_STYLES[cat ?? ""] ?? "border-gray-200 text-gray-500 bg-gray-50";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-amber-300 hover:shadow-md hover:shadow-amber-100/60"
    >
      {/* 상품 이미지 */}
      {post.product_image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
          <Image
            src={post.product_image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
          {post.affiliate_url && (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-black">
              <ShoppingBag className="h-2.5 w-2.5" />
              쿠팡
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* 카테고리 + 날짜 */}
        <div className="flex items-center justify-between gap-2">
          {post.category && (
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${style(post.category)}`}>
              {post.category}
            </span>
          )}
          <time className="ml-auto text-xs text-gray-400">
            {dateFormatter.format(new Date(post.created_at))}
          </time>
        </div>

        {/* 제목 */}
        <h3 className="text-sm font-semibold leading-snug text-gray-800 line-clamp-2 group-hover:text-amber-600 transition-colors">
          {post.title}
        </h3>

        {/* 요약 */}
        {post.summary && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {post.summary}
          </p>
        )}

        {/* 하단 */}
        <div className="mt-auto flex items-center justify-between pt-1">
          {post.affiliate_url && !post.product_image ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
              <ShoppingBag className="h-3 w-3" />
              쿠팡 추천
            </span>
          ) : (
            <span />
          )}
          <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-amber-500 transition-colors" />
        </div>
      </div>
    </Link>
  );
}
