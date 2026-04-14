import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
};

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, summary, content_html, content, tags, category, created_at")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) return null;
    return data as BlogPost;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} | Thive Lab Blog`,
    description: post.summary ?? undefined,
  };
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

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

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const categoryStyle =
    CATEGORY_COLORS[post.category ?? ""] ?? "border-zinc-600 text-zinc-400";

  // content_html이 없으면 content를 <pre>로 표시 (fallback)
  const htmlContent = post.content_html
    ? post.content_html
    : `<pre class="whitespace-pre-wrap text-sm text-zinc-300">${post.content}</pre>`;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-160px] h-[360px] bg-gradient-to-b from-indigo-500/15 via-zinc-950 to-transparent blur-3xl"
      />

      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        {/* 뒤로가기 */}
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-indigo-300"
        >
          <ArrowLeft className="h-4 w-4" />
          블로그 목록
        </Link>

        {/* 포스트 헤더 */}
        <header className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {post.category && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${categoryStyle}`}
              >
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
                  className="rounded border border-zinc-800 bg-zinc-900/60 px-2.5 py-0.5 text-xs text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <hr className="border-zinc-800 mb-10" />

        {/* 포스트 본문 */}
        <article
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <hr className="border-zinc-800 mt-14 mb-8" />

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-indigo-300"
        >
          <ArrowLeft className="h-4 w-4" />
          다른 포스트 보기
        </Link>
      </div>
    </div>
  );
}
