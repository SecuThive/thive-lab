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
import { type Project } from "@/components/ProjectCard";
import ProjectCarousel from "@/components/ProjectCarousel";
import { supabase } from "@/lib/supabase";
import { WaitlistForm } from "@/components/WaitlistForm";

type PipelineStatus = "Live" | "Beta" | "Soon";

const PIPELINE_STATUS_STYLES: Record<PipelineStatus, string> = {
  Live: "text-emerald-300",
  Beta: "text-amber-200",
  Soon: "text-zinc-400",
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

async function getFocusAreas(projects: Project[]): Promise<string[]> {
  // 프로젝트에서 카테고리 추출 (중복 제거)
  const categories = projects
    .map((project) => project.category)
    .filter((category): category is string => !!category);
  
  const uniqueCategories = Array.from(new Set(categories));
  
  // 카테고리가 없으면 기본값 반환
  if (uniqueCategories.length === 0) {
    return ["Pricing intelligence", "Hiring ops", "Finance automation"];
  }
  
  return uniqueCategories;
}

async function getHeroStats(): Promise<Array<{ label: string; value: string }>> {
  try {
    const { data, error } = await supabase
      .from("hero_stats")
      .select("label, value")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch hero stats:", error);
      return [
        { label: "Automations Deployed", value: "38+" },
        { label: "Average Launch Time", value: "9 days" },
        { label: "Teams Supported", value: "24" },
      ];
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch hero stats:", error);
    return [
      { label: "Automations Deployed", value: "38+" },
      { label: "Average Launch Time", value: "9 days" },
      { label: "Teams Supported", value: "24" },
    ];
  }
}

async function getPipeline(): Promise<Array<{ label: string; status: PipelineStatus }>> {
  try {
    const { data, error } = await supabase
      .from("pipeline")
      .select("label, status")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch pipeline:", error);
      return [
        { label: "Steam Scout API", status: "Live" },
        { label: "Junior Jobs EU", status: "Beta" },
        { label: "Subsidy AI alerts", status: "Soon" },
      ];
    }

    return (data || []).map((item) => ({
      label: item.label,
      status: item.status as PipelineStatus,
    }));
  } catch (error) {
    console.error("Failed to fetch pipeline:", error);
    return [
      { label: "Steam Scout API", status: "Live" },
      { label: "Junior Jobs EU", status: "Beta" },
      { label: "Subsidy AI alerts", status: "Soon" },
    ];
  }
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
        { title: "Steam Scout shipped alert webhooks", date: "Jan 2026 / Release" },
        { title: "Junior Jobs talent graph refresh", date: "Dec 2025 / Update" },
        { title: "Subsidy AI grants ingestion", date: "Nov 2025 / Research" },
      ];
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch build log:", error);
    return [
      { title: "Steam Scout shipped alert webhooks", date: "Jan 2026 / Release" },
      { title: "Junior Jobs talent graph refresh", date: "Dec 2025 / Update" },
      { title: "Subsidy AI grants ingestion", date: "Nov 2025 / Research" },
    ];
  }
}

export default async function HomePage() {
  const year = new Date().getFullYear();
  const projects = await getProjects();
  const focusAreas = getFocusAreas(projects);
  const heroStats = await getHeroStats();
  const pipeline = await getPipeline();
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
            <span>Automation Studio</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[58px] break-words">
                  Building automation tools for modern teams.
                </h1>
                <p className="max-w-2xl text-lg text-zinc-400 lg:text-xl break-words">
                  Automated utilities and data-driven services designed to eliminate busywork. We operate as your internal tooling team, delivering solutions focused on speed, clarity, and measurable results.
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

              <dl className="grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 px-5 py-4"
                  >
                    <dt className="text-xs uppercase tracking-[0.4em] text-zinc-500 break-words">{stat.label}</dt>
                    <dd className="mt-3 text-2xl font-semibold text-white break-words">{stat.value}</dd>
                  </div>
                ))}
              </dl>
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
                    {pipeline.map((item) => (
                      <li key={item.label} className="flex items-center justify-between gap-4">
                        <span className="flex-1 break-words min-w-0">{item.label}</span>
                        <span className={`text-xs font-semibold shrink-0 ${PIPELINE_STATUS_STYLES[item.status]}`}>
                          {item.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-xs text-zinc-500">Small pilots, measurable outcomes, shared playbooks.</p>
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
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Product stack</p>
              <h2 className="text-3xl font-semibold text-white break-words">A bento grid of active labs</h2>
              <p className="max-w-2xl text-base text-zinc-400 break-words">
                Each tile links to a focused utility—shipping pricing tools, hiring intelligence, finance automation, and data services that layer on your existing workflow.
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
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/40 px-4 py-1 text-xs uppercase tracking-[0.35em] text-zinc-400">
              <Mail className="h-4 w-4 text-indigo-300" />
              <span>Waitlist</span>
            </div>
            <h3 className="text-3xl font-semibold text-white break-words">Get notified when we launch new tools.</h3>
            <p className="text-base text-zinc-400 break-words">
              Monthly changelog covering new utilities, research drops, and open pilot slots. No noise, just shipping notes.
            </p>
            <WaitlistForm />
            <p className="text-xs text-zinc-500">No spam. Unsubscribe anytime.</p>
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
            <p className="mt-6 text-xs text-zinc-500">Follow along via GitHub or the waitlist to join the next build cycle.</p>
          </div>
        </section>
      </div>

      <footer className="border-t border-zinc-900/60 bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {year} Thive Lab. Built for global teams.</p>
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
