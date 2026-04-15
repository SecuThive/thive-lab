"use client";

import { useEffect, useState } from "react";
import { Activity, FileText, ShoppingBag, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Stats = {
  blogPosts: { total: number; published: number; draft: number };
  products: { total: number; hot: number; featured: number };
  posts: { total: number };
  recentBlogPosts: Array<{ id: number; title: string; slug: string; category: string | null; status: string; created_at: string }>;
};

export default function StatusTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [blogRes, blogPubRes, productsRes, productsHotRes, productsFeatRes, postsRes, recentRes] = await Promise.all([
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_hot", true),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_featured", true),
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id, title, slug, category, status, created_at").order("created_at", { ascending: false }).limit(10),
      ]);

      setStats({
        blogPosts: {
          total: blogRes.count ?? 0,
          published: blogPubRes.count ?? 0,
          draft: (blogRes.count ?? 0) - (blogPubRes.count ?? 0),
        },
        products: {
          total: productsRes.count ?? 0,
          hot: productsHotRes.count ?? 0,
          featured: productsFeatRes.count ?? 0,
        },
        posts: { total: postsRes.count ?? 0 },
        recentBlogPosts: (recentRes.data ?? []) as Stats["recentBlogPosts"],
      });
    } catch (e) {
      console.error("Failed to load stats:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-zinc-500">불러오는 중...</div>;
  }

  if (!stats) {
    return <div className="py-20 text-center text-zinc-500">데이터를 불러올 수 없습니다.</div>;
  }

  const dateFormatter = new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-8">
      {/* 상태 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<FileText className="h-5 w-5" />} label="추천 가이드" value={stats.blogPosts.total} sub={`게시 ${stats.blogPosts.published} · 초안 ${stats.blogPosts.draft}`} color="amber" />
        <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="등록 상품" value={stats.products.total} sub={`HOT ${stats.products.hot} · 추천 ${stats.products.featured}`} color="emerald" />
        <StatCard icon={<Activity className="h-5 w-5" />} label="기존 포스트" value={stats.posts.total} sub="posts 테이블" color="sky" />
        <StatCard icon={<CheckCircle className="h-5 w-5" />} label="서비스 상태" value="정상" sub="Supabase 연결됨" color="emerald" isText />
      </div>

      {/* 최근 생성된 가이드 */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Clock className="h-4 w-4 text-amber-400" />
          최근 생성된 추천 가이드
        </h3>
        {stats.recentBlogPosts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center text-zinc-500">
            아직 생성된 가이드가 없습니다. blog_generator.py를 실행해 주세요.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">제목</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">카테고리</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">생성일</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">링크</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {stats.recentBlogPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-800/20">
                    <td className="px-4 py-3 text-zinc-200 line-clamp-1 max-w-xs">{post.title}</td>
                    <td className="px-4 py-3 text-zinc-500">{post.category ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                        post.status === "published" ? "bg-emerald-500/10 text-emerald-300" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {post.status === "published" ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600">{dateFormatter.format(new Date(post.created_at))}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="text-xs text-amber-400 hover:text-amber-300">
                        보기 →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, isText }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
  color: "amber" | "emerald" | "sky";
  isText?: boolean;
}) {
  const colors = {
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  };

  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${isText ? "text-emerald-400" : "text-white"}`}>{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{sub}</p>
    </div>
  );
}
