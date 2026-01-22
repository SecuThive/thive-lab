"use client";

import { useEffect } from "react";
import { X, ArrowUpRight, Sparkles, Zap, CheckCircle2 } from "lucide-react";
import type { Project } from "./ProjectCard";

type ProjectModalProps = {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
};

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDisabled = project.link === "#";

  const statusInfo = {
    Live: {
      text: "Ready to deploy and integrate into your workflow.",
      color: "emerald",
      features: ["Production ready", "Full documentation", "Active support"],
    },
    Beta: {
      text: "Accepting pilot users for testing and feedback.",
      color: "amber",
      features: ["Early access", "Pilot program", "Direct feedback channel"],
    },
    "Coming Soon": {
      text: "Currently in research and development phase.",
      color: "zinc",
      features: ["In development", "Roadmap planned", "Join waitlist"],
    },
  };

  const info = statusInfo[project.status];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Enhanced Backdrop */}
      <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.1),transparent_50%)]" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800/80 bg-zinc-900/90 text-zinc-400 backdrop-blur-sm transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="relative p-8 sm:p-12">
          {/* Header Section */}
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-500/10">
              <div className="scale-125">{project.icon}</div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                    project.status === "Live"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10"
                      : project.status === "Beta"
                      ? "bg-amber-500/10 text-amber-300 border border-amber-400/40 shadow-amber-500/10"
                      : "bg-zinc-800/80 text-zinc-300 border border-zinc-600/60"
                  } shadow-lg`}
                >
                  {project.status === "Live" && <CheckCircle2 className="h-3 w-3" />}
                  {project.status === "Beta" && <Zap className="h-3 w-3" />}
                  {project.status === "Coming Soon" && <Sparkles className="h-3 w-3" />}
                  {project.status}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">{project.name}</h2>
            </div>
          </div>

          {/* Description */}
          <p className="mt-8 text-lg leading-relaxed text-zinc-300">{project.description}</p>

          {/* Info Grid */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {/* Status Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 p-6 transition hover:border-zinc-700">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative">
                <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
                  <Sparkles className="h-3.5 w-3.5" />
                  Current Status
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{info.text}</p>
              </div>
            </div>

            {/* Features Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 p-6 transition hover:border-zinc-700">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative">
                <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
                  <Zap className="h-3.5 w-3.5" />
                  Key Features
                </h3>
                <ul className="mt-3 space-y-2">
                  {info.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                      <span className="h-1 w-1 rounded-full bg-indigo-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="mt-10 space-y-4">
            {!isDisabled && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Visit Project
                  <ArrowUpRight className="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 transition group-hover:opacity-100" />
              </a>
            )}
            {isDisabled && (
              <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-8 py-4 text-base font-semibold text-zinc-400">
                <Sparkles className="h-5 w-5" />
                Coming Soon
              </div>
            )}
            <p className="text-center text-xs text-zinc-500">
              {isDisabled
                ? "This project is currently under development. Join our waitlist to get notified."
                : "Opens in a new tab"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
