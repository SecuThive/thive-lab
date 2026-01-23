"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function SteamApiPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight text-white">
          Steam Deals API
        </h1>
        <p className="text-xl text-zinc-400">
          Access real-time Steam game deals with advanced filtering options.
        </p>
      </div>

      {/* Endpoint */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Endpoint</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
              GET
            </span>
            <code className="text-lg text-indigo-300">/api/v1/steam/deals</code>
          </div>
          <p className="text-zinc-400">
            Retrieve a list of current Steam game deals sorted by discount percentage.
          </p>
        </div>
      </section>

      {/* Query Parameters */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Query Parameters</h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <code className="text-base text-indigo-400">limit</code>
                <span className="ml-2 text-sm text-zinc-500">integer</span>
              </div>
              <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">Optional</span>
            </div>
            <p className="text-zinc-400">
              Number of results to return. Min: 1, Max: 100, Default: 50
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <code className="text-base text-indigo-400">steam_deck</code>
                <span className="ml-2 text-sm text-zinc-500">boolean</span>
              </div>
              <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">Optional</span>
            </div>
            <p className="text-zinc-400">
              Filter for Steam Deck compatible games only. Use <code className="text-indigo-300">true</code> to enable.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <code className="text-base text-indigo-400">min_discount</code>
                <span className="ml-2 text-sm text-zinc-500">integer</span>
              </div>
              <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">Optional</span>
            </div>
            <p className="text-zinc-400">
              Minimum discount percentage (0-100). Default: 0
            </p>
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Examples</h2>

        {/* Example 1: Basic Request */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Basic Request</h3>
          <p className="text-zinc-400">Get the top 10 deals:</p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4">
              <code className="text-sm text-zinc-300">GET /api/v1/steam/deals?limit=10</code>
            </pre>
            <button
              onClick={() => copyToClipboard("GET /api/v1/steam/deals?limit=10", "ex1")}
              className="absolute right-4 top-4 rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              {copied === "ex1" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Example 2: Steam Deck Compatible */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Steam Deck Compatible Games</h3>
          <p className="text-zinc-400">Get Steam Deck verified games with at least 50% discount:</p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4">
              <code className="text-sm text-zinc-300">GET /api/v1/steam/deals?steam_deck=true&min_discount=50</code>
            </pre>
            <button
              onClick={() => copyToClipboard("GET /api/v1/steam/deals?steam_deck=true&min_discount=50", "ex2")}
              className="absolute right-4 top-4 rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              {copied === "ex2" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Example 3: JavaScript */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">JavaScript/TypeScript</h3>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4">
              <code className="text-sm text-zinc-300">{`async function getSteamDeals() {
  const response = await fetch(
    'https://thivelab.com/api/v1/steam/deals?limit=20&min_discount=30'
  );
  const data = await response.json();
  
  if (data.success) {
    console.log(\`Found \${data.meta.count} deals\`);
    data.data.forEach(game => {
      console.log(\`\${game.name}: \${game.discount_percent}% off\`);
    });
  }
}

getSteamDeals();`}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(`async function getSteamDeals() {
  const response = await fetch(
    'https://thivelab.com/api/v1/steam/deals?limit=20&min_discount=30'
  );
  const data = await response.json();
  
  if (data.success) {
    console.log(\`Found \${data.meta.count} deals\`);
    data.data.forEach(game => {
      console.log(\`\${game.name}: \${game.discount_percent}% off\`);
    });
  }
}

getSteamDeals();`, "ex3")}
              className="absolute right-4 top-4 rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              {copied === "ex3" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Example 4: Python */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Python</h3>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4">
              <code className="text-sm text-zinc-300">{`import requests

response = requests.get(
    'https://thivelab.com/api/v1/steam/deals',
    params={'limit': 20, 'min_discount': 30}
)

data = response.json()
if data['success']:
    print(f"Found {data['meta']['count']} deals")
    for game in data['data']:
        print(f"{game['name']}: {game['discount_percent']}% off")`}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(`import requests

response = requests.get(
    'https://thivelab.com/api/v1/steam/deals',
    params={'limit': 20, 'min_discount': 30}
)

data = response.json()
if data['success']:
    print(f"Found {data['meta']['count']} deals")
    for game in data['data']:
        print(f"{game['name']}: {game['discount_percent']}% off")`, "ex4")}
              className="absolute right-4 top-4 rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              {copied === "ex4" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* Response Format */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Response Format</h2>
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4">
            <code className="text-sm text-zinc-300">{`{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Game Title",
      "discount_percent": 75,
      "original_price": 59.99,
      "final_price": 14.99,
      "steam_deck_compatible": true,
      "app_id": "1091500",
      "created_at": "2024-01-20T10:30:00Z"
    }
  ],
  "meta": {
    "count": 1,
    "limit": 50,
    "filters": {
      "steam_deck": false,
      "min_discount": 0
    }
  }
}`}</code>
          </pre>
        </div>
      </section>

      {/* Error Responses */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Error Responses</h2>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Rate Limit Exceeded (429)</h3>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4">
              <code className="text-sm text-zinc-300">{`{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later."
}`}</code>
            </pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Server Error (500)</h3>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4">
              <code className="text-sm text-zinc-300">{`{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}`}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
