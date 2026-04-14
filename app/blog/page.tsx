import Link from "next/link";
import { ArrowUpRight, Tag, Rss } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  tags: string[];
  category: string | null;
  created_at: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  AI:         "border-violet-500/40 text-violet-300",
  Dev:        "border-indigo-500/40 text-indigo-300",
  Indie:      "border-emerald-500/40 text-emerald-300",
  Automation: "border-amber-500/40 text-amber-300",
  DevOps:     "border-sky-500/40 text-sky-300",
  Security:   "border-rose-500/40 text-rose-300",
  Data:       "border-teal-500/40 text-teal-300",
  Growth:     "border-pink-500/40 text-pink-300",
};

function categoryStyle(category: string | null) {
  return CATEGORY_COLORS[category ?? ""] ?? "border-zinc-600 text-zinc-400";
}

async function getPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, summary, tags, category, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to fetch blog posts:", error);
      return [];
    }
    return (data ?? []) as BlogPost[];
  } catch {
    return [];
  }
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-160px] h-[380px] bg-gradient-to-b from-indigo-500/20 via-zinc-950 to-transparent blur-3xl"
      />

      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        {/* 헤더 */}
        <header className="mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/50 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-zinc-400">
            <Rss className="h-3.5 w-3.5 text-indigo-300" />
            <span>Thive Lab · Blog</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Dev &amp; Indie Notes
          </h1>
          <p className="max-w-xl text-base text-zinc-400">
            AI, 마이크로 SaaS, 자동화에 관한 실전 포스트. 매주 자동 발행됩니다.
          </p>
        </header>

        {/* 포스트 목록 */}
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 px-8 py-16 text-center">
            <p className="text-zinc-500">아직 발행된 포스트가 없습니다.</p>
            <p className="mt-2 text-sm text-zinc-600">
              블로그 생성기를 실행하면 자동으로 채워집니다.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 px-6 py-5 transition hover:border-indigo-500/40 hover:bg-zinc-900/60 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {post.category && (
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryStyle(post.category)}`}
                        >
                          {post.category}
                        </span>
                      )}
                      <span className="text-xs text-zinc-600">
                        {dateFormatter.format(new Date(post.created_at))}
                      </span>
                    </div>

                    <h2 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {post.summary && (
                      <p className="text-sm text-zinc-400 line-clamp-2">{post.summary}</p>
                    )}

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <Tag className="h-3 w-3 text-zinc-600" />
                        {post.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded border border-zinc-800 bg-zinc-950/60 px-2 py-0.5 text-xs text-zinc-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-600 transition group-hover:text-indigo-400 sm:mt-1" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
