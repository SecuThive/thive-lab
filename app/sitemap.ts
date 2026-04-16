import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

// 1시간마다 자동 갱신 (새 글 발행 반영)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thivelab.com";

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at, created_at, view_count")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const allPosts = posts ?? [];

  // 조회수 최대값 (우선순위 정규화용)
  const maxViews = Math.max(...allPosts.map((p) => (p.view_count ?? 0)), 1);

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // 블로그 포스트 — 조회수 높을수록 priority 0.7~0.95
  const postPages: MetadataRoute.Sitemap = allPosts.map((post) => {
    const views = post.view_count ?? 0;
    const ratio = views / maxViews;                        // 0 ~ 1
    const priority = Math.round((0.7 + ratio * 0.25) * 100) / 100; // 0.70 ~ 0.95

    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at ?? post.created_at),
      changeFrequency: views > 50 ? ("weekly" as const) : ("monthly" as const),
      priority,
    };
  });

  return [...staticPages, ...postPages];
}
