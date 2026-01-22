import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Cpu,
  Database,
  Mail,
  Radar,
  Sparkles,
  WalletMinimal,
} from "lucide-react";
import { type Project, type ProjectStatus } from "@/components/ProjectCard";
import ProjectCarousel from "@/components/ProjectCarousel";
import { supabase } from "@/lib/supabase";
import { WaitlistForm } from "@/components/WaitlistForm";

const PIPELINE_STATUS_STYLES: Record<ProjectStatus, string> = {
  Live: "text-emerald-300",
  Beta: "text-amber-200",
  "Coming Soon": "text-zinc-400",
};

const STATUS_LEGEND = [
  { label: "Live", color: "bg-emerald-400" },
  { label: "Beta", color: "bg-amber-300" },
  { label: "Coming Soon", color: "bg-zinc-500" },
] as const;

const ICON_MAP: Record<string, JSX.Element> = {
  Radar: <Radar className="h-5 w-5 text-indigo-300" />,
  BriefcaseBusiness: <BriefcaseBusiness className="h-5 w-5 text-indigo-300" />,
  Bot: <Bot className="h-5 w-5 text-indigo-300" />,
  WalletMinimal: <WalletMinimal className="h-5 w-5 text-indigo-300" />,
  Database: <Database className="h-5 w-5 text-indigo-300" />,
  Cpu: <Cpu className="h-5 w-5 text-indigo-300" />,
};

const numberFormatter = new Intl.NumberFormat("en-US");

type HeroStat = {
  label: string;
  value: string;
  helper: string;
  accent: string;
};

async function getProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch projects:", error);
      return [];
    }

    return (data || []).map((project) => ({
      name: project.name,
      status: project.status as Project["status"],
      description: project.description,
      link: project.link,
      icon: ICON_MAP[project.icon_name] || ICON_MAP.Radar,
      layout: project.layout,
      category: project.category,
    }));
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

function getFocusAreas(projects: Project[]): string[] {
  // 프로젝트에서 카테고리 추출 (중복 제거)
  const categories = projects
    .map((project) => project.category)
    .filter((category): category is string => !!category);
  
  const uniqueCategories = Array.from(new Set(categories));
  
  // 카테고리가 없으면 기본값 반환
  if (uniqueCategories.length === 0) {
    return ["Developer playbooks", "Automation APIs", "Community drops"];
  }
  
  return uniqueCategories;
}

// 페이지 데이터를 주기적으로 갱신 (60초마다)
export const revalidate = 60;

function buildHeroStats(projects: Project[]): HeroStat[] {
  const total = projects.length;
  const live = projects.filter((project) => project.status === "Live").length;
  const pipeline = projects.filter((project) => project.status !== "Live").length;

  return [
    {
      label: "Projects Published",
      value: numberFormatter.format(total),
      helper: "Total hubs live across Thive",
      accent: "bg-indigo-400",
    },
    {
      label: "Live Launches",
      value: numberFormatter.format(live),
      helper: "Actively shipping right now",
      accent: "bg-emerald-400",
    },
    {
      label: "In Pipeline",
      value: numberFormatter.format(pipeline),
      helper: "Queued for upcoming drops",
      accent: "bg-amber-300",
    },
  ];
}

type PipelineItem = { label: string; status: ProjectStatus; category?: string };

const STATUS_PRIORITY: Record<ProjectStatus, number> = {
  Live: 0,
  Beta: 1,
  "Coming Soon": 2,
};

function buildPipeline(projects: Project[]): PipelineItem[] {
  return projects
    .slice()
    .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status])
    .map((project) => ({
      label: project.name,
      status: project.status,
      category: project.category,
    }));
}

async function getBuildLog(): Promise<Array<{ title: string; date: string }>> {
  try {
    const { data, error } = await supabase
      .from("build_log")
      .select("title, date")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch build log:", error);
      return [
        { title: "Launchpad v2 docs shipped", date: "Jan 2026 / Release" },
        { title: "Atlas kit tokens refreshed", date: "Dec 2025 / Update" },
        { title: "Community vault research sprint", date: "Nov 2025 / Research" },
      ];
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch build log:", error);
    return [
      { title: "Launchpad v2 docs shipped", date: "Jan 2026 / Release" },
      { title: "Atlas kit tokens refreshed", date: "Dec 2025 / Update" },
      { title: "Community vault research sprint", date: "Nov 2025 / Research" },
    ];
  }
}

export default async function HomePage() {
  const year = new Date().getFullYear();
  const projects = await getProjects();
  const focusAreas = getFocusAreas(projects);
  const heroStats = buildHeroStats(projects);
  const pipeline = buildPipeline(projects);
  const buildLog = await getBuildLog();

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-200px] h-[420px] bg-gradient-to-b from-indigo-500/25 via-zinc-950 to-transparent blur-3xl"
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-6 py-16 lg:px-8">
        <header className="space-y-12">
          <div className="inline-flex flex-wrap items-center gap-3 rounded-full border border-zinc-800/80 bg-zinc-900/50 px-5 py-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
            <Sparkles className="h-4 w-4 text-indigo-300" />
            <span>Thive Lab</span>
            <span className="h-1 w-1 rounded-full bg-indigo-400" />
            <span>Project Hub</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[58px] break-words">
                  One home for every Thive Lab project.
                </h1>
                <p className="max-w-2xl text-lg text-zinc-400 lg:text-xl break-words">
                  This hub curates all public Thive Lab builds—developer resources, user-facing tools, API playgrounds, and shared playbooks. Track releases, read docs, and jump into the products that match your workflow.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="#projects"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500/90 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
                >
                  Explore Projects
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="https://github.com/secuthive"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-100 hover:border-indigo-500/50"
                >
                  View GitHub
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-zinc-950/80 via-zinc-950/20 to-zinc-900/40 px-5 py-5 shadow-[0_25px_80px_-60px_rgba(15,23,42,1)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/20" />
                    </div>
                    <div className="relative space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] uppercase tracking-[0.45em] text-zinc-500">{stat.label}</p>
                        <span className={`h-2.5 w-2.5 rounded-full ${stat.accent}`} />
                      </div>
                      <p className="text-3xl font-semibold text-white">{stat.value}</p>
                      <p className="text-xs text-zinc-500">{stat.helper}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8">
              <div className="relative z-10 space-y-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Focus areas</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {focusAreas.map((area) => (
                      <span
                        key={area}
                        className="rounded-full border border-zinc-800/70 bg-zinc-950/60 px-3 py-1 text-xs text-zinc-300 break-words"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-6">
                  <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Currently incubating</p>
                  <ul className="mt-4 space-y-4 text-sm text-zinc-300">
                    {pipeline.slice(0, 6).map((item) => (
                      <li key={item.label} className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <span className="block break-words">{item.label}</span>
                          {item.category && (
                            <span className="mt-1 block text-xs uppercase tracking-[0.25em] text-zinc-500">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-semibold shrink-0 ${PIPELINE_STATUS_STYLES[item.status]}`}>
                          {item.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-xs text-zinc-500">Cross-site upgrades roll out weekly—join the waitlist for previews.</p>
                </div>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),transparent_65%)]"
              />
            </div>
          </div>
        </header>

        <section id="projects" className="space-y-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Project network</p>
              <h2 className="text-3xl font-semibold text-white break-words">Browse the Thive Lab hub</h2>
              <p className="max-w-2xl text-base text-zinc-400 break-words">
                Every tile represents a live site, micro SaaS, or shared knowledge drop. Discover launchpads for builders, lightweight tools for operators, and experiments that invite community feedback.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-500">
              {STATUS_LEGEND.map((legend) => (
                <span key={legend.label} className="inline-flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${legend.color}`} />
                  {legend.label}
                </span>
              ))}
            </div>
          </div>

          <ProjectCarousel projects={projects} />
        </section>

        <section className="grid gap-10 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/40 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-zinc-400">
              <Mail className="h-4 w-4 text-indigo-300" />
              <span>Join Broadcast</span>
            </div>
            <h3 className="text-3xl font-semibold text-white break-words">Stay connected to the hub.</h3>
            <p className="text-base leading-relaxed text-zinc-400 break-words">
              Receive drop notes across every Thive Lab property—release recaps, API updates, community calls, and opportunities to test upcoming sites.
            </p>
            <WaitlistForm />
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                No spam, ever
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                Unsubscribe anytime
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Build log</p>
            <ul className="mt-5 space-y-4 text-sm text-zinc-300">
              {buildLog.map((note) => (
                <li
                  key={note.title}
                  className="flex items-start justify-between gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0"
                >
                  <span className="flex-1 leading-relaxed break-words min-w-0">{note.title}</span>
                  <span className="text-xs text-zinc-500 shrink-0 whitespace-nowrap">{note.date}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-zinc-500">Follow along via GitHub or the broadcast list to join the next release window.</p>
          </div>
        </section>
      </div>

      <footer className="border-t border-zinc-900/60 bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {year} Thive Lab. Built as the hub for devs and users.</p>
          <div className="flex flex-wrap items-center gap-6 text-zinc-400">
            <Link href="/privacy" className="hover:text-indigo-300">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-indigo-300">
              Terms
            </Link>
            <Link href="https://github.com/secuthive" target="_blank" rel="noreferrer" className="hover:text-indigo-300">
              GitHub
            </Link>
            <Link href="https://x.com/devthive" target="_blank" rel="noreferrer" className="hover:text-indigo-300">
              X (Twitter)
            </Link>
            <a href="mailto:thive8564@gmail.com" className="hover:text-indigo-300">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
