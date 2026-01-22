"use client";

import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, Bell, CheckCircle2, Loader2, Send } from "lucide-react";
import type { Project, ProjectStatus } from "@/components/ProjectCard";

type BroadcastProject = Pick<Project, "name" | "status">;

type WaitlistFormProps = {
  projects: BroadcastProject[];
};

type ProjectOption = {
  value: string;
  label: string;
  status?: ProjectStatus;
};

const ALL_OPTION: ProjectOption = {
  value: "all",
  label: "All launches & future drops",
};

export function WaitlistForm({ projects }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [projectPreference, setProjectPreference] = useState<string>(ALL_OPTION.value);
  const [notifyOnLaunch, setNotifyOnLaunch] = useState(true);

  const projectOptions = useMemo<ProjectOption[]>(() => {
    const seen = new Set<string>();
    const scoped = projects
      .filter((project) => project.name)
      .map((project) => {
        if (seen.has(project.name)) return null;
        seen.add(project.name);
        return {
          value: project.name,
          label: `${project.name} · ${project.status}`,
          status: project.status,
        } satisfies ProjectOption;
      })
      .filter((option): option is ProjectOption => option !== null);

    return [ALL_OPTION, ...scoped];
  }, [projects]);

  const resetForm = () => {
    setEmail("");
    setProjectPreference(ALL_OPTION.value);
    setNotifyOnLaunch(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, projectPreference, notifyOnLaunch }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        const target =
          projectPreference === "all"
            ? "every new launch"
            : `${projectPreference} releases`;
        setMessage(data.message || `Broadcast on—expect an email when ${target} go live.`);
        resetForm();
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please check your connection.");
    }
  };

  const disabled = status === "loading" || status === "success";

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              disabled={disabled}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            />
          </div>
          <button
            type="submit"
            disabled={disabled}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none whitespace-nowrap"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === "success" ? (
                "Subscribed"
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Join Broadcast
                </>
              )}
            </span>
            {status !== "loading" && status !== "success" && (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 transition group-hover:opacity-100" />
            )}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
            Project focus
            <select
              value={projectPreference}
              onChange={(e) => setProjectPreference(e.target.value)}
              disabled={disabled}
              className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
            >
              {projectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300">
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-300" />
              Launch-day email
            </span>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border border-zinc-600 bg-zinc-900 text-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              checked={notifyOnLaunch}
              onChange={() => setNotifyOnLaunch((prev) => !prev)}
              disabled={disabled}
            />
          </label>
        </div>
        <p className="text-xs text-zinc-500">We&apos;ll send a single email whenever the selected projects flip to Live.</p>
      </form>

      {status === "success" && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-300">{message}</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
