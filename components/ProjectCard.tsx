"use client";

import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import ProjectModal from "./ProjectModal";

export type ProjectStatus = "Live" | "Beta" | "Coming Soon";

export type Project = {
  name: string;
  status: ProjectStatus;
  description: string;
  link: string;
  icon: ReactNode;
  layout?: string;
  category?: string;
};

type ProjectCardProps = {
  project: Project;
  className?: string;
};

const STATUS_STYLES: Record<ProjectStatus, string> = {
  Live: "bg-emerald-500/10 text-emerald-200 border border-emerald-500/40",
  Beta: "bg-amber-500/10 text-amber-200 border border-amber-400/40",
  "Coming Soon": "bg-zinc-800/80 text-zinc-100 border border-zinc-600/60",
};

const STATUS_COPY: Record<ProjectStatus, string> = {
  Live: "Ready to deploy",
  Beta: "Accepting pilots",
  "Coming Soon": "In research queue",
};

const combineClasses = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

const CardBody = ({ project }: { project: Project }) => (
  <div className="flex h-full flex-col">
    <div className="flex items-start justify-between gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30 shrink-0">
        {project.icon}
      </div>
      <span
        className={combineClasses(
          "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide whitespace-nowrap shrink-0",
          STATUS_STYLES[project.status]
        )}
      >
        {project.status}
      </span>
    </div>

    <div className="mt-8 space-y-3">
      <p className="text-xl font-semibold tracking-tight text-white break-words">{project.name}</p>
      <p className="text-sm leading-relaxed text-zinc-400 break-words">{project.description}</p>
    </div>

    <div className="mt-auto pt-8 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
      <div className="flex items-center justify-between gap-3 min-w-0">
        <span className="leading-tight break-words flex-1">{STATUS_COPY[project.status]}</span>
        <span className="flex items-center gap-2 text-sm font-medium tracking-normal text-indigo-300 shrink-0 whitespace-nowrap">
          {project.link === "#" ? "Stay tuned" : "View project"}
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  </div>
);

const baseCardClasses =
  "group relative block h-full overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950/80 via-zinc-950/30 to-zinc-900/30 shadow-[0_35px_80px_-60px_rgba(5,5,5,1)] transition-transform duration-300 hover:-translate-y-1.5 hover:border-indigo-500/40";

const innerClasses = "relative z-10 h-full p-7";

const Overlay = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),transparent_55%)]" />
    <div className="absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-fuchsia-500/10" />
    </div>
    <div className="absolute inset-0 z-0 rounded-[1.7rem] border border-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
  </div>
);

export default function ProjectCard({ project, className }: ProjectCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const body = (
    <div className={innerClasses}>
      <CardBody project={project} />
    </div>
  );
  const cardClasses = combineClasses(baseCardClasses, className);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={combineClasses(
          cardClasses,
          "w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500"
        )}
      >
        {body}
        <Overlay />
      </button>

      <ProjectModal
        project={project}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
