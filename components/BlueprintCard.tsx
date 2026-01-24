"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Terminal,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Check,
  Server,
  ExternalLink,
} from "lucide-react";

interface AffiliateLink {
  text: string;
  url: string;
}

interface BlueprintCardProps {
  title: string;
  description: string;
  tags: string[];
  code: string;
  affiliate: AffiliateLink;
}

const deriveDifficulty = (code: string) => {
  const lines = code.split("\n").length;
  if (lines >= 40) return "Advanced";
  if (lines >= 25) return "Intermediate";
  return "Easy";
};

export function BlueprintCard({ title, description, tags, code, affiliate }: BlueprintCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const difficulty = useMemo(() => deriveDifficulty(code), [code]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <article className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-[0_35px_120px_-45px_rgba(0,0,0,0.8)]">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-500/80">Blueprint</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        </div>
        <span className="rounded-full border border-zinc-800 bg-zinc-950/70 px-4 py-2 text-xs font-semibold text-zinc-400">
          {difficulty}
        </span>
      </header>

      <p className="mt-4 text-sm text-zinc-400">{description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-zinc-800 bg-black/40 px-3 py-1 text-xs font-semibold text-zinc-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-400">
          <Server className="h-4 w-4" /> Recommended Infrastructure
        </div>
        <a
          href={affiliate.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition-colors hover:text-emerald-200"
        >
          {affiliate.text}
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mt-6 inline-flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-emerald-500/40"
      >
        <span className="inline-flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          {isOpen ? "Hide Code" : "View Code"}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <div
        className={`mt-6 overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{ maxHeight: isOpen ? 900 : 0 }}
      >
        <div className="rounded-2xl border border-zinc-800 bg-black/70">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">script.py</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-emerald-500/50 hover:text-emerald-300"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <ClipboardCopy className="h-4 w-4 text-zinc-400" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="max-h-[420px] overflow-auto bg-gradient-to-br from-zinc-950 via-zinc-950 to-black p-4 text-sm text-zinc-100">
            <code className="block whitespace-pre text-left">{code}</code>
          </pre>
        </div>
      </div>
    </article>
  );
}
