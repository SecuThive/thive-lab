"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TrendingUp, Eye, MousePointerClick, BarChart2, RefreshCw } from "lucide-react";

type CategoryRow = {
  category: string;
  views: number;
  clicks: number;
  ctr: number;
};

type TopPost = {
  slug: string;
  title: string;
  category: string | null;
  clicks: number;
  views: number;
};

type DailyClick = { date: string; count: number };

export default function MetricsTab() {
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [dailyClicks, setDailyClicks] = useState<DailyClick[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      // 전체 조회수 합계
      const { data: viewData } = await supabase
        .from("blog_posts")
        .select("view_count")
        .eq("status", "published");
      const sumViews = (viewData ?? []).reduce((s, r) => s + (r.view_count ?? 0), 0);
      setTotalViews(sumViews);

      // 클릭 로그 전체 (최대 50,000건)
      const { data: clickData } = await supabase
        .from("affiliate_click_logs")
        .select("slug, category, clicked_at")
        .order("clicked_at", { ascending: false })
        .limit(50000);

      const clicks = clickData ?? [];
      setTotalClicks(clicks.length);

      // ── 카테고리별 집계 ────────────────────────────────────────
      const catViewMap: Record<string, number> = {};
      const catClickMap: Record<string, number> = {};

      (viewData ?? []).forEach((p: any) => {
        const cat = p.category ?? "기타";
        catViewMap[cat] = (catViewMap[cat] ?? 0) + (p.view_count ?? 0);
      });

      // blog_posts의 category를 가져오기 위해 슬러그→카테고리 맵 생성
      const { data: postMeta } = await supabase
        .from("blog_posts")
        .select("slug, category, view_count")
        .eq("status", "published");
      const slugCat: Record<string, string> = {};
      const slugViews: Record<string, number> = {};
      (postMeta ?? []).forEach((p: any) => {
        slugCat[p.slug] = p.category ?? "기타";
        slugViews[p.slug] = p.view_count ?? 0;
      });

      clicks.forEach((c: any) => {
        const cat = c.category ?? slugCat[c.slug] ?? "기타";
        catClickMap[cat] = (catClickMap[cat] ?? 0) + 1;
      });

      const allCats = new Set([...Object.keys(catViewMap), ...Object.keys(catClickMap)]);
      const catRows: CategoryRow[] = Array.from(allCats)
        .map((cat) => {
          const v = catViewMap[cat] ?? 0;
          const c = catClickMap[cat] ?? 0;
          return { category: cat, views: v, clicks: c, ctr: v > 0 ? (c / v) * 100 : 0 };
        })
        .sort((a, b) => b.clicks - a.clicks);
      setCategories(catRows);

      // ── 포스트별 클릭 수 집계 ──────────────────────────────────
      const slugClickMap: Record<string, number> = {};
      clicks.forEach((c: any) => {
        slugClickMap[c.slug] = (slugClickMap[c.slug] ?? 0) + 1;
      });
      const topSlugs = Object.entries(slugClickMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7);

      if (topSlugs.length > 0) {
        const { data: topData } = await supabase
          .from("blog_posts")
          .select("slug, title, category")
          .in("slug", topSlugs.map(([s]) => s));
        const titleMap: Record<string, { title: string; category: string | null }> = {};
        (topData ?? []).forEach((p: any) => {
          titleMap[p.slug] = { title: p.title, category: p.category };
        });
        setTopPosts(
          topSlugs.map(([slug, cnt]) => ({
            slug,
            title: titleMap[slug]?.title ?? slug,
            category: titleMap[slug]?.category ?? null,
            clicks: cnt,
            views: slugViews[slug] ?? 0,
          }))
        );
      }

      // ── 최근 7일 일별 클릭 수 ──────────────────────────────────
      const dayMap: Record<string, number> = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dayMap[d.toISOString().slice(0, 10)] = 0;
      }
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      clicks
        .filter((c: any) => new Date(c.clicked_at) >= sevenDaysAgo)
        .forEach((c: any) => {
          const key = c.clicked_at.slice(0, 10);
          if (key in dayMap) dayMap[key] += 1;
        });
      setDailyClicks(Object.entries(dayMap).map(([date, count]) => ({ date, count })));
    } catch (e) {
      console.error("[MetricsTab] load error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-zinc-500">불러오는 중...</div>;
  }

  const overallCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";
  const maxDaily = Math.max(...dailyClicks.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* 상단 요약 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard icon={<Eye className="h-5 w-5" />} label="총 조회수" value={totalViews.toLocaleString()} color="sky" />
        <MetricCard icon={<MousePointerClick className="h-5 w-5" />} label="총 클릭수" value={totalClicks.toLocaleString()} color="amber" />
        <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="전체 CTR" value={`${overallCTR}%`} color="emerald" />
      </div>

      {/* 최근 7일 클릭 바 차트 */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-zinc-300">최근 7일 일별 클릭 수</h3>
          <button onClick={load} className="ml-auto text-zinc-500 hover:text-zinc-300 transition">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-end gap-2 h-24">
          {dailyClicks.map(({ date, count }) => (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-zinc-500">{count}</span>
              <div
                className="w-full rounded-t-md bg-amber-500/70 transition-all"
                style={{ height: `${Math.max((count / maxDaily) * 80, count > 0 ? 4 : 0)}px` }}
              />
              <span className="text-[10px] text-zinc-600">
                {new Date(date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 카테고리별 성과 */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <TrendingUp className="h-4 w-4 text-amber-400" />
          카테고리별 성과
        </h3>
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center text-zinc-500 text-sm">
            클릭 데이터가 없습니다. 제휴 링크가 클릭되면 자동으로 수집됩니다.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950/40">
                <tr>
                  {["카테고리", "조회수", "클릭수", "CTR"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {categories.map((row) => (
                  <tr key={row.category} className="hover:bg-zinc-800/20">
                    <td className="px-4 py-3 font-medium text-zinc-200">{row.category}</td>
                    <td className="px-4 py-3 text-zinc-400">{row.views.toLocaleString()}</td>
                    <td className="px-4 py-3 text-amber-400 font-semibold">{row.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row.ctr >= 5 ? "bg-emerald-500/15 text-emerald-300"
                        : row.ctr >= 2 ? "bg-amber-500/15 text-amber-300"
                        : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {row.ctr.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 클릭 수 상위 포스트 */}
      {topPosts.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <MousePointerClick className="h-4 w-4 text-amber-400" />
            클릭 수 상위 포스트
          </h3>
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950/40">
                <tr>
                  {["제목", "카테고리", "조회수", "클릭수", "CTR", "링크"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {topPosts.map((p) => {
                  const ctr = p.views > 0 ? ((p.clicks / p.views) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={p.slug} className="hover:bg-zinc-800/20">
                      <td className="px-4 py-3 text-zinc-200 max-w-xs line-clamp-1">{p.title}</td>
                      <td className="px-4 py-3 text-zinc-500">{p.category ?? "-"}</td>
                      <td className="px-4 py-3 text-zinc-400">{p.views.toLocaleString()}</td>
                      <td className="px-4 py-3 text-amber-400 font-semibold">{p.clicks}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{ctr}%</td>
                      <td className="px-4 py-3">
                        <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="text-xs text-amber-400 hover:text-amber-300">
                          보기 →
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "sky" | "amber" | "emerald";
}) {
  const colors = {
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
