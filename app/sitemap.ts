import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thivelab.com";

  // 프로젝트 목록 가져오기
  const { data: projects } = await supabase
    .from("projects")
    .select("name, link, updated_at")
    .order("created_at", { ascending: true });

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 프로젝트 페이지 (외부 링크는 제외)
  const projectPages: MetadataRoute.Sitemap = (projects || [])
    .filter((project) => project.link && !project.link.startsWith("http") && project.link !== "#")
    .map((project) => ({
      url: `${baseUrl}${project.link}`,
      lastModified: new Date(project.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...projectPages];
}
