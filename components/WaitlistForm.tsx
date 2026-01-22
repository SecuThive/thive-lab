"use client";

import { useState, FormEvent } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message || "Welcome aboard! Check your inbox for confirmation.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please check your connection.");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            disabled={status === "loading" || status === "success"}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none whitespace-nowrap"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "loading" ? "Joining..." : status === "success" ? "Joined!" : "Join Waitlist"}
          </span>
          {status !== "loading" && status !== "success" && (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 transition group-hover:opacity-100" />
          )}
        </button>
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
