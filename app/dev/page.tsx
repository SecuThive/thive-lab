"use client";

import { useMemo, useState } from "react";
import { Code, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { CodeSnippet } from "@/components/CodeSnippet";

type Script = {
  title: string;
  description: string;
  tags: string[];
  language: string;
  code: string;
  affiliate: {
    name: string;
    url: string;
  };
};

const scripts: Script[] = [
  {
    title: "Auto-Blogging Bot with Python",
    description:
      "Automatically generates and publishes Korean tech posts to WordPress or Tistory using OpenAI + REST APIs.",
    tags: ["Python", "Automation", "OpenAI", "WordPress"],
    language: "python",
    code: `import os
import requests
from datetime import datetime

API_KEY = os.getenv("OPENAI_API_KEY")

prompt = "Write a 500 word Korean post about AI-driven growth tactics for indie hackers."

def generate_article() -> str:
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are a prolific Korean SaaS blogger."},
                {"role": "user", "content": prompt}
            ]
        },
        timeout=30
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()

if __name__ == "__main__":
    article = generate_article()
    print(f"[{datetime.utcnow().isoformat()}]\n{article}")
`,
    affiliate: {
      name: "Recommended Server: Vultr ($100 Credit)",
      url: "YOUR_AFFILIATE_LINK",
    },
  },
  {
    title: "Team Health Dashboard Scraper",
    description:
      "Scrapes team KPI dashboards, normalizes the data, and drops a daily report into Slack.",
    tags: ["Python", "Scraper", "Slack"],
    language: "python",
    code: `import json
import time
import random
from pathlib import Path

from playwright.sync_api import sync_playwright

OUTPUT = Path("./reports/latest.json")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://internal-dashboard.example.com/login")
    page.fill("#email", "bot@thivelab.com")
    page.fill("#password", "super-secret")
    page.click("button[type=submit]")
    page.wait_for_timeout(3000)

    metrics = []
    for row in page.query_selector_all(".metric-row"):
        label = row.query_selector(".label").inner_text()
        value = row.query_selector(".value").inner_text()
        metrics.append({"label": label, "value": value})

    OUTPUT.write_text(json.dumps({"metrics": metrics, "ts": time.time()}, indent=2))
    browser.close()

print("Report ready. Ship to Slack webhook next.")
`,
    affiliate: {
      name: "Recommended Server: Vultr ($100 Credit)",
      url: "YOUR_AFFILIATE_LINK",
    },
  },
  {
    title: "Steam Sale Radar",
    description:
      "Monitors Steam deals hourly, filters by deck-verified titles, and pushes high-signal deals to Notion.",
    tags: ["Python", "Steam", "Notion API"],
    language: "python",
    code: `import requests
from datetime import datetime

API = "https://thivelab.com/api/v1/steam/deals?limit=20&steam_deck=true"
NOTION_URL = "https://api.notion.com/v1/pages"

payload = requests.get(API, timeout=10).json()["data"]
filtered = [deal for deal in payload if deal["discount_percent"] >= 60]

for deal in filtered:
    print(f"{deal['name']} — {deal['discount_percent']}% off")

print(f"Synced {len(filtered)} deck-friendly drops @ {datetime.utcnow().isoformat()}Z")
`,
    affiliate: {
      name: "Recommended Server: Vultr ($100 Credit)",
      url: "YOUR_AFFILIATE_LINK",
    },
  },
];

export default function DevPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const columns = useMemo(() => {
    const left: Array<{ script: Script; index: number }> = [];
    const right: Array<{ script: Script; index: number }> = [];

    scripts.forEach((script, index) => {
      if (index % 2 === 0) {
        left.push({ script, index });
      } else {
        right.push({ script, index });
      }
    });

    return [left, right];
  }, []);

  const toggleCard = (index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  };

  const renderCard = (script: Script, index: number) => {
    const isExpanded = expandedIndex === index;

    return (
      <article className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{script.title}</h2>
            <p className="mt-3 text-sm text-zinc-400">{script.description}</p>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300">
            <Code className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {script.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1 text-xs font-semibold text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Recommended Environment
          </p>
          <a
            href={script.affiliate.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
          >
            {script.affiliate.name}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => toggleCard(index)}
          className="mt-6 inline-flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-emerald-500/40"
        >
          <span>{isExpanded ? "Hide Code" : "View Code"}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <div
          className="mt-6 overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out"
          style={{ maxHeight: isExpanded ? 900 : 0, opacity: isExpanded ? 1 : 0 }}
        >
          {isExpanded && (
            <div className="pt-6">
              <CodeSnippet code={script.code} language={script.language} />
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="space-y-4 pb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Developer Resources
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Ship Python automations + monetize the stack.
          </h1>
          <p className="max-w-3xl text-lg text-zinc-400">
            Curated automation blueprints used inside ThiveLab. Copy the scripts, deploy to
            a lightweight VPS, and stack affiliate-friendly infra recommendations.
          </p>
        </header>

        <div className="space-y-8 md:hidden">
          {scripts.map((script, index) => (
            <div key={`mobile-${script.title}`}>{renderCard(script, index)}</div>
          ))}
        </div>

        <div className="hidden gap-8 md:flex md:items-start">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex-1 space-y-8">
              {column.map(({ script, index }) => (
                <div key={script.title}>{renderCard(script, index)}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
