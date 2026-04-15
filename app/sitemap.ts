import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thivelab.com";

  const [projectsResult, postsResult] = await Promise.all([
    supabase
      .from("projects")
      .select("name, link, updated_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("blog_posts")
      .select("slug, updated_at, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  const projects = projectsResult.data ?? [];
  const posts = postsResult.data ?? [];

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
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

  // 프로젝트 페이지 (외부 링크는 제외)
  const projectPages: MetadataRoute.Sitemap = projects
    .filter((project) => project.link && !project.link.startsWith("http") && project.link !== "#")
    .map((project) => ({
      url: `${baseUrl}${project.link}`,
      lastModified: new Date(project.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // 블로그 포스트 페이지
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at ?? post.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...projectPages, ...postPages];
}
