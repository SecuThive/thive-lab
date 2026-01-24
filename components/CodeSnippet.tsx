"use client";

import { useState } from "react";
import { ClipboardCopy, Check } from "lucide-react";

interface CodeSnippetProps {
  code: string;
  language: string;
}

const filenameByLanguage: Record<string, string> = {
  python: "main.py",
  javascript: "index.js",
  typescript: "main.ts",
  bash: "run.sh",
};

const deriveFilename = (language: string) => {
  const normalized = language?.toLowerCase() ?? "";
  if (filenameByLanguage[normalized]) {
    return filenameByLanguage[normalized];
  }
  return normalized ? `snippet.${normalized}` : "snippet.txt";
};

export function CodeSnippet({ code, language }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const filename = deriveFilename(language);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black/60 shadow-xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          {filename}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-emerald-500/50 hover:text-emerald-300"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <ClipboardCopy className="h-4 w-4 text-zinc-400" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="relative max-h-[480px] overflow-x-auto bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 text-sm text-zinc-100">
        <code className="block whitespace-pre text-left">{code}</code>
      </pre>
    </div>
  );
}
