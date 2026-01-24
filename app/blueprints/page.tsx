import { BlueprintCard } from "@/components/BlueprintCard";

const blueprints = [
    {
    title: "Google Blogger Auto-Poster",
    description:
      "Creates Korean growth essays with OpenAI, wraps them in lightweight HTML, and pushes them to Blogger via the v3 API.",
    tags: ["Python", "OpenAI API", "Google Blogger", "Cron"],
    code: `import os
  import textwrap
  import requests

  OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
  BLOGGER_TOKEN = os.getenv("BLOGGER_TOKEN")
  BLOGGER_BLOG_ID = os.getenv("BLOGGER_BLOG_ID")

  POST_PROMPT = "\n".join([
    "Write a 600 word Korean blog post about AI marketing experiments",
    "Use markdown headings and bullets for readability",
  ])

  def generate_post() -> str:
    res = requests.post(
      "https://api.openai.com/v1/chat/completions",
      headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
      json={
        "model": "gpt-4o-mini",
        "messages": [
          {"role": "system", "content": "You are a Korean growth marketer."},
          {"role": "user", "content": POST_PROMPT},
        ],
      },
      timeout=30,
    )
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"].strip()

  def markdown_to_html(markdown: str) -> str:
    paragraphs = [f"<p>{line}</p>" for line in markdown.split("\n\n") if line.strip()]
    return "".join(paragraphs)

  def publish_to_blogger(html: str):
    payload = {
      "kind": "blogger#post",
      "blog": {"id": BLOGGER_BLOG_ID},
      "title": "AI Growth Notebook",
      "content": html,
    }
    res = requests.post(
      f"https://www.googleapis.com/blogger/v3/blogs/{BLOGGER_BLOG_ID}/posts/",
      headers={
        "Authorization": f"Bearer {BLOGGER_TOKEN}",
        "Content-Type": "application/json",
      },
      json=payload,
      timeout=30,
    )
    res.raise_for_status()
    return res.json()["url"]

  if __name__ == "__main__":
    markdown = generate_post()
    html = markdown_to_html(markdown)
    url = publish_to_blogger(html)
    print(f"Blogger post published -> {url}")
  `,
    affiliate: {
      text: "Get OpenAI API Key",
      url: "YOUR_OPENAI_AFFILIATE",
    },
    },
  {
    title: "Crypto Price Tracker Bot",
    description:
      "Pulls CCXT exchange data, watches volatility spikes, and ships alerts to Notion + Slack dashboards.",
    tags: ["Python", "CCXT", "Notion", "Alerts", "Scheduler"],
    code: `import os
import time
import ccxt
import requests

SLACK_WEBHOOK = os.getenv("SLACK_WEBHOOK")
notion_token = os.getenv("NOTION_TOKEN")

def send_slack(message: str):
    requests.post(SLACK_WEBHOOK, json={"text": message}, timeout=10)

def main():
    exchange = ccxt.binance()
    tickers = exchange.fetch_tickers(["BTC/USDT", "ETH/USDT"])
    for pair, data in tickers.items():
        change = data.get("percentage")
        if change and abs(change) >= 3:
            msg = f"{pair} moved {change:.2f}% in 15m"
            send_slack(f":rotating_light: {msg}")
            print(msg)

if __name__ == "__main__":
    while True:
        main()
        time.sleep(900)
`,
    affiliate: {
      text: "Run on Vultr ($100 Credit)",
      url: "YOUR_VULTR_AFFILIATE",
    },
  },
];

export default function BlueprintsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="space-y-4 pb-12">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-500/90">Code Lab</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">ThiveLab Blueprints</h1>
          <p className="max-w-2xl text-lg text-zinc-400">
            Production-ready automation scripts for indie hackers and lean teams. Copy, deploy, and ship value fast.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {blueprints.map((blueprint) => (
            <BlueprintCard key={blueprint.title} {...blueprint} />
          ))}
        </div>
      </div>
    </div>
  );
}
