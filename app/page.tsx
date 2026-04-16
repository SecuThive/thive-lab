import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Flame,
  ShoppingBag,
  Star,
  Zap,
  Tv,
  Home,
  Utensils,
  Sparkles,
  Dumbbell,
  Lightbulb,
  Baby,
  Cookie,
  Play,
  Users,
  BadgePercent,
  Gift,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductCard, { type Product } from "@/components/ProductCard";
import ContactButton from "@/components/ContactButton";

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

      {/* ── Hero ──────────────────────────────────────────────────────���───── */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-8 lg:py-20">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">

            {/* ── 왼쪽: 텍스트 ──────────────────────────────────── */}
            <div className="flex-1 text-center lg:text-left">

              {/* 뱃지 */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800">
                <Flame className="h-3.5 w-3.5 text-amber-600" />
                쿠팡 실구매자 데이터 기반 추천
              </div>

              {/* 제목 */}
              <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-[3rem]">
                뭘 사야 할지<br />
                모를 때<br />
                <span className="text-amber-500">딱 정리해 드립니다</span>
              </h1>

              {/* 설명 */}
              <p className="mx-auto mb-8 max-w-md text-[15px] leading-relaxed text-gray-600 lg:mx-0">
                쿠팡 실구매자 평점·리뷰·가격 데이터를 분석해<br />
                카테고리별 가성비 <strong className="font-bold text-gray-900">TOP 상품</strong>을 큐레이션합니다.
              </p>

              {/* CTA 버튼 */}
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-300/50 transition hover:bg-amber-400 active:scale-95"
                >
                  <ShoppingBag className="h-4 w-4" />
                  추천 상품 보기
                </Link>
                <Link
                  href="#categories"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-gray-900 bg-white px-7 py-3.5 text-sm font-bold text-gray-900 transition hover:bg-gray-900 hover:text-white"
                >
                  카테고리 둘러보기
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              {/* 통계 */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
                {[
                  { value: "8개",    label: "카테고리" },
                  { value: "100+",   label: "추천 가이드" },
                  { value: "실시간", label: "가격 반영" },
                ].map(({ value, label }, i, arr) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="text-center lg:text-left">
                      <p className="text-lg font-extrabold text-gray-900">{value}</p>
                      <p className="text-xs font-semibold text-gray-500">{label}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="h-8 w-px bg-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── 오른쪽: 카테고리 카드 그리드 ──────────────────── */}
            <div className="w-full max-w-sm shrink-0 lg:w-[340px]">
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.slice(0, 8).map(({ label, icon: Icon, color, bg, border }) => (
                  <Link
                    key={label}
                    href={`/blog?category=${encodeURIComponent(label)}`}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 transition hover:scale-[1.03] hover:shadow-md ${bg} ${border}`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                    <span className={`text-sm font-bold ${color}`}>{label}</span>
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-center text-xs font-semibold text-gray-500">
                원하는 카테고리를 클릭해보세요
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 카테고리 앵커 */}
      <div id="categories" />

      {/* ── 구독핀 파트너스 배너 ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-violet-50 via-white to-purple-50 border-y border-violet-100 px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-5xl">

          {/* 섹션 라벨 */}
          <div className="mb-5 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">파트너스 · Partners</span>
            <span className="h-px flex-1 bg-violet-100" />
          </div>

          <div className="rounded-3xl border border-violet-200 bg-white shadow-md shadow-violet-100/60 overflow-hidden">

            {/* 상단 헤더 */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-sm font-black text-white">
                  핀
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-white">구독핀</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">공식 파트너</span>
                  </div>
                  <p className="text-xs text-violet-200 mt-0.5">OTT 구독 공유 플랫폼 · 비용을 반으로 줄이세요</p>
                </div>
              </div>
              {/* 할인 배지 */}
              <div className="hidden sm:flex flex-col items-center rounded-2xl bg-white/15 px-4 py-2 text-center border border-white/20">
                <span className="text-xl font-extrabold text-white leading-none">3,000원</span>
                <span className="text-[10px] text-violet-200 mt-0.5">첫 구독 할인</span>
              </div>
            </div>

            <div className="px-6 py-6">

              {/* 서비스 소개 */}
              <p className="mb-5 text-sm text-gray-600 leading-relaxed">
                구독핀은 <strong className="text-gray-900">Netflix · 왓챠 · 디즈니+ · 웨이브</strong> 등 OTT 구독을 여러 명이 함께 나눠 쓰는 플랫폼입니다.
                혼자 내던 구독료를 최대 <strong className="text-violet-700">절반 이하</strong>로 줄이고, 안전한 결제·자동 매칭 시스템으로 번거로움 없이 관리하세요.
              </p>

              {/* 혜택 카드 4개 */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: BadgePercent, label: "구독료 절반",   desc: "멤버와 나눠 내는 월정액",   color: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-200" },
                  { icon: Play,        label: "OTT 전 종류",  desc: "넷플릭스·왓챠·디즈니+",  color: "text-purple-600", bg: "bg-purple-50",  border: "border-purple-200" },
                  { icon: Users,       label: "자동 파티 매칭", desc: "클릭 한 번으로 즉시 연결",  color: "text-indigo-600", bg: "bg-indigo-50",  border: "border-indigo-200" },
                  { icon: CheckCircle2, label: "안전 결제",    desc: "에스크로 보호 결제 시스템", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
                ].map(({ icon: Icon, label, desc, color, bg, border }) => (
                  <div key={label} className={`rounded-2xl border p-3 ${bg} ${border}`}>
                    <Icon className={`mb-1.5 h-4 w-4 ${color}`} />
                    <p className={`text-xs font-bold ${color}`}>{label}</p>
                    <p className="mt-0.5 text-[11px] text-gray-500 leading-snug">{desc}</p>
                  </div>
                ))}
              </div>

              {/* 리워드 + CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">

                {/* 추천 리워드 안내 */}
                <div className="flex-1 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <Gift className="h-5 w-5 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-gray-800">추천 코드 혜택</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      신규 가입 시 <span className="font-bold text-amber-600">3,000원 즉시 할인</span>
                      <span className="mx-1 text-gray-300">·</span>
                      추천인 <span className="font-bold text-amber-600">5,000 핀 적립</span>
                    </p>
                  </div>
                </div>

                {/* CTA 버튼 */}
                <a
                  href="https://www.gudokpin.com/subscribe?ref=구독핀oeOkh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-400/30 transition hover:bg-violet-500 active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  지금 할인받고 시작하기
                  <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>

            </div>
          </div>
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
      <section className="px-4 pt-14 pb-14 lg:px-8">
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

      {/* ── 문의하기 플로팅 버튼 ──────────────────────────────────────────── */}
      <ContactButton />

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
          <p className="text-xs text-gray-400">
            파트너스 · 광고 문의는{" "}
            <span className="font-medium text-amber-500">우하단 문의하기</span>
            {" "}버튼을 이용해 주세요.
          </p>
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
