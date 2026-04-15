import { supabase } from "@/lib/supabase";

export async function GET() {
  const baseUrl = "https://thivelab.com";

  const [projectsResult, buildLogResult, postsResult] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("build_log")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(10),
    supabase
      .from("blog_posts")
      .select("id, slug, title, summary, category, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const projects = projectsResult.data || [];
  const buildLogs = buildLogResult.data || [];
  const posts = postsResult.data || [];

  // 블로그 포스트 아이템 (핵심 콘텐츠)
  const postItems = posts.map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.summary ?? post.title)}</description>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <category>${escapeXml(post.category ?? "리뷰")}</category>
    </item>
  `).join("");

  // 프로젝트 아이템
  const projectItems = projects.map((project) => `
    <item>
      <title>${escapeXml(project.name)}</title>
      <description>${escapeXml(project.description)}</description>
      <link>${project.link.startsWith("http") ? project.link : `${baseUrl}${project.link}`}</link>
      <guid isPermaLink="${project.link.startsWith("http")}">${project.link.startsWith("http") ? project.link : `${baseUrl}${project.link}`}</guid>
      <pubDate>${new Date(project.created_at).toUTCString()}</pubDate>
      <category>${escapeXml(project.status)}</category>
    </item>
  `).join("");

  const buildLogItems = buildLogs.map((log) => `
    <item>
      <title>${escapeXml(log.title)}</title>
      <description>Build Log Update: ${escapeXml(log.title)}</description>
      <link>${baseUrl}/#build-log</link>
      <guid isPermaLink="false">${baseUrl}/build-log/${log.id}</guid>
      <pubDate>${new Date(log.created_at).toUTCString()}</pubDate>
      <category>Build Log</category>
    </item>
  `).join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Thive Lab — 쿠팡 파트너스 추천 &amp; 상품 리뷰</title>
    <link>${baseUrl}</link>
    <description>쿠팡 실구매자 데이터 기반 카테고리별 가성비 상품 추천 가이드. 비교표와 체크리스트로 쉽게 골라보세요.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/icon.png</url>
      <title>Thive Lab</title>
      <link>${baseUrl}</link>
    </image>
    ${postItems}
    ${projectItems}
    ${buildLogItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
