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
import ProjectCard, { type Project } from "@/components/ProjectCard";

const HERO_STATS = [
  { label: "Automations shipped", value: "38+" },
  { label: "Launch cadence", value: "9 days" },
  { label: "Teams served", value: "24" },
] as const;

const FOCUS_AREAS = [
  "Pricing intelligence",
  "Hiring ops",
  "Finance automation",
  "Gov funding radar",
  "Community data",
] as const;

type PipelineStatus = "Live" | "Beta" | "Soon";

const PIPELINE_STATUS_STYLES: Record<PipelineStatus, string> = {
  Live: "text-emerald-300",
  Beta: "text-amber-200",
  Soon: "text-zinc-400",
};

const PIPELINE: Array<{ label: string; status: PipelineStatus }> = [
  { label: "Steam Scout API", status: "Live" },
  { label: "Junior Jobs EU", status: "Beta" },
  { label: "Subsidy AI alerts", status: "Soon" },
];

const STATUS_LEGEND = [
  { label: "Live", color: "bg-emerald-400" },
  { label: "Beta", color: "bg-amber-300" },
  { label: "Coming Soon", color: "bg-zinc-500" },
] as const;

const LATEST_NOTES = [
  { title: "Steam Scout shipped alert webhooks", date: "Jan 2026 / Release" },
  { title: "Junior Jobs talent graph refresh", date: "Dec 2025 / Update" },
  { title: "Subsidy AI grants ingestion", date: "Nov 2025 / Research" },
] as const;

const PROJECTS: Project[] = [
  {
    name: "Steam Scout",
    status: "Live",
    description: "Price intelligence for Steam hardware with archived drop history.",
    link: "https://steam.thivelab.com",
    icon: <Radar className="h-5 w-5 text-indigo-300" />,
    layout: "sm:col-span-3 sm:row-span-2",
  },
  {
    name: "Junior Jobs",
    status: "Beta",
    description: "Signal-based job board for emerging talent with daily scrapes and filters.",
    link: "#",
    icon: <BriefcaseBusiness className="h-5 w-5 text-indigo-300" />,
    layout: "sm:col-span-3",
  },
  {
    name: "Subsidy AI",
    status: "Coming Soon",
    description: "Gov incentives radar tuned to your stack, geography, and hiring plan.",
    link: "#",
    icon: <Bot className="h-5 w-5 text-indigo-300" />,
    layout: "sm:col-span-2",
  },
  {
    name: "Ledger Pulse",
    status: "Live",
    description: "Finance cockpit to monitor MRR, burn, and cash runway in a single view.",
    link: "https://finance.thivelab.com",
    icon: <WalletMinimal className="h-5 w-5 text-indigo-300" />,
    layout: "sm:col-span-2",
  },
  {
    name: "Signal Vault",
    status: "Beta",
    description: "Ops telemetry overlays that merge product analytics, support, and alerting.",
    link: "https://ops.thivelab.com",
    icon: <Database className="h-5 w-5 text-indigo-300" />,
    layout: "sm:col-span-4",
  },
  {
    name: "Relay Forms",
    status: "Coming Soon",
    description: "Adaptive intake forms that sync structured data into your ops stack automatically.",
    link: "#",
    icon: <Cpu className="h-5 w-5 text-indigo-300" />,
    layout: "sm:col-span-2",
  },
];

export default function HomePage() {
  const year = new Date().getFullYear();

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
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[58px]">
                  Building tools for the modern web.
                </h1>
                <p className="max-w-2xl text-lg text-zinc-400 lg:text-xl">
                  Automated utilities and data services designed to erase busywork. We operate like an internal tooling team for founders that care about speed, clarity, and measurable outcomes.
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
                  href="https://github.com/thivelab"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-100 hover:border-indigo-500/50"
                >
                  View GitHub
                </Link>
              </div>

              <dl className="grid gap-4 sm:grid-cols-3">
                {HERO_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 px-5 py-4"
                  >
                    <dt className="text-xs uppercase tracking-[0.4em] text-zinc-500">{stat.label}</dt>
                    <dd className="mt-3 text-2xl font-semibold text-white">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8">
              <div className="relative z-10 space-y-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Focus areas</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {FOCUS_AREAS.map((area) => (
                      <span
                        key={area}
                        className="rounded-full border border-zinc-800/70 bg-zinc-950/60 px-3 py-1 text-xs text-zinc-300"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-6">
                  <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Currently incubating</p>
                  <ul className="mt-4 space-y-4 text-sm text-zinc-300">
                    {PIPELINE.map((item) => (
                      <li key={item.label} className="flex items-center justify-between gap-4">
                        <span>{item.label}</span>
                        <span className={`text-xs font-semibold ${PIPELINE_STATUS_STYLES[item.status]}`}>
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
              <h2 className="text-3xl font-semibold text-white">A bento grid of active labs</h2>
              <p className="max-w-2xl text-base text-zinc-400">
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

          <div className="grid grid-cols-1 gap-5 sm:auto-rows-[250px] sm:grid-cols-6 sm:grid-flow-dense">
            {PROJECTS.map((project) => (
              <ProjectCard
                key={project.name}
                project={project}
                className={project.layout ?? "sm:col-span-3"}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-10 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/40 px-4 py-1 text-xs uppercase tracking-[0.35em] text-zinc-400">
              <Mail className="h-4 w-4 text-indigo-300" />
              <span>Waitlist</span>
            </div>
            <h3 className="text-3xl font-semibold text-white">Get notified when we launch new tools.</h3>
            <p className="text-base text-zinc-400">
              Monthly changelog covering new utilities, research drops, and open pilot slots. No noise, just shipping notes.
            </p>
            <form className="flex flex-col gap-3 sm:flex-row" action="#" method="post">
              <input
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-2xl bg-indigo-500/90 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Join Waitlist
              </button>
            </form>
            <p className="text-xs text-zinc-500">No spam. Unsubscribe anytime.</p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Build log</p>
            <ul className="mt-5 space-y-4 text-sm text-zinc-300">
              {LATEST_NOTES.map((note) => (
                <li
                  key={note.title}
                  className="flex items-start justify-between gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0"
                >
                  <span className="max-w-[70%] leading-relaxed">{note.title}</span>
                  <span className="text-xs text-zinc-500">{note.date}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-zinc-500">Follow along via GitHub or the waitlist to join the next build cycle.</p>
          </div>
        </section>
      </div>

      <footer className="border-t border-zinc-900/60 bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {year} Thive Lab. Crafted in Seoul.</p>
          <div className="flex flex-wrap items-center gap-6 text-zinc-400">
            <Link href="https://github.com/thivelab" target="_blank" rel="noreferrer" className="hover:text-indigo-300">
              GitHub
            </Link>
            <Link href="https://twitter.com/thivelab" target="_blank" rel="noreferrer" className="hover:text-indigo-300">
              Twitter
            </Link>
            <a href="mailto:hi@thivelab.com" className="hover:text-indigo-300">
              hi@thivelab.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
