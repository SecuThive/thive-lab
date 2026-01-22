import { supabase } from "@/lib/supabase";

export async function GET() {
  const baseUrl = "https://thivelab.com";
  
  // 프로젝트와 빌드 로그 가져오기
  const [projectsResult, buildLogResult] = await Promise.all([
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
  ]);

  const projects = projectsResult.data || [];
  const buildLogs = buildLogResult.data || [];

  // RSS 아이템 생성
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
    <title>Thive Lab - Automation Tools &amp; Updates</title>
    <link>${baseUrl}</link>
    <description>Stay updated with Thive Lab's latest automation tools, product launches, and build updates.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/icon.png</url>
      <title>Thive Lab</title>
      <link>${baseUrl}</link>
    </image>
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
