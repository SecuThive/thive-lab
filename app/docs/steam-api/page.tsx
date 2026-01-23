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
          Steam API
        </h1>
        <p className="text-xl text-zinc-400">
          Access real-time Steam game data with 5 specialized endpoints for deals, trending games, ratings, and more.
        </p>
      </div>

      {/* API Overview */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Available Endpoints</h2>
        <div className="grid gap-4">
          {[
            {
              method: "GET",
              path: "/api/v1/steam/deals",
              desc: "All current Steam deals sorted by discount percentage",
            },
            {
              method: "GET",
              path: "/api/v1/steam/trending",
              desc: "Trending games based on recency, discount, and ratings",
            },
            {
              method: "GET",
              path: "/api/v1/steam/top-rated",
              desc: "Highest-rated games on sale (by Metacritic score)",
            },
            {
              method: "GET",
              path: "/api/v1/steam/deck-verified",
              desc: "Steam Deck compatible/verified games",
            },
            {
              method: "GET",
              path: "/api/v1/steam/best-value",
              desc: "Best value deals - high quality, deep discounts, low prices",
            },
          ].map((endpoint, idx) => (
            <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
                  {endpoint.method}
                </span>
                <code className="text-sm text-indigo-300">{endpoint.path}</code>
              </div>
              <p className="text-sm text-zinc-400">{endpoint.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 1. Deals Endpoint */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">1. Steam Deals</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
              GET
            </span>
            <code className="text-lg text-indigo-300">/api/v1/steam/deals</code>
          </div>
          <p className="text-zinc-400">
            Retrieve all current Steam game deals sorted by discount percentage.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-300">Query Parameters</h3>
          <div className="space-y-4">
            {[
              { name: "limit", type: "integer", desc: "Number of results (1-100, default: 50)", optional: true },
              { name: "steam_deck", type: "boolean", desc: "Filter for Steam Deck compatible games", optional: true },
              { name: "min_discount", type: "integer", desc: "Minimum discount percentage (0-100, default: 0)", optional: true },
            ].map((param, idx) => (
              <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <code className="text-base text-indigo-400">{param.name}</code>
                    <span className="ml-2 text-sm text-zinc-500">{param.type}</span>
                  </div>
                  {param.optional && (
                    <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-zinc-400">{param.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-300">Code Examples</h3>
          {[
            { title: "Get All Deals", code: `curl https://thivelab.com/api/v1/steam/deals` },
            { title: "Limit Results", code: `curl https://thivelab.com/api/v1/steam/deals?limit=10` },
            { title: "Steam Deck Compatible", code: `curl https://thivelab.com/api/v1/steam/deals?steam_deck=true` },
            { title: "Minimum Discount", code: `curl https://thivelab.com/api/v1/steam/deals?min_discount=75` },
          ].map((example, idx) => (
            <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
                <span className="text-sm font-medium text-zinc-300">{example.title}</span>
                <button
                  onClick={() => copyToClipboard(example.code, `deals-${idx}`)}
                  className="rounded p-2 hover:bg-zinc-800 transition-colors"
                >
                  {copied === `deals-${idx}` ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-zinc-400" />
                  )}
                </button>
              </div>
              <div className="p-6">
                <pre className="overflow-x-auto text-sm text-zinc-300">
                  <code>{example.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Trending Endpoint */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">2. Trending Games</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
              GET
            </span>
            <code className="text-lg text-indigo-300">/api/v1/steam/trending</code>
          </div>
          <p className="text-zinc-400">
            Get trending games based on recent updates, discount percentage, and ratings.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-300">Code Examples</h3>
          {[
            { title: "Get Trending Games", code: `curl https://thivelab.com/api/v1/steam/trending?limit=20` },
          ].map((example, idx) => (
            <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
                <span className="text-sm font-medium text-zinc-300">{example.title}</span>
                <button
                  onClick={() => copyToClipboard(example.code, `trending-${idx}`)}
                  className="rounded p-2 hover:bg-zinc-800 transition-colors"
                >
                  {copied === `trending-${idx}` ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-zinc-400" />
                  )}
                </button>
              </div>
              <div className="p-6">
                <pre className="overflow-x-auto text-sm text-zinc-300">
                  <code>{example.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Top Rated Endpoint */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">3. Top-Rated Games</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
              GET
            </span>
            <code className="text-lg text-indigo-300">/api/v1/steam/top-rated</code>
          </div>
          <p className="text-zinc-400">
            Highest-rated games on sale, sorted by Metacritic score.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-300">Query Parameters</h3>
          <div className="space-y-4">
            {[
              { name: "limit", type: "integer", desc: "Number of results (1-100, default: 50)", optional: true },
              { name: "min_score", type: "integer", desc: "Minimum Metacritic score (0-100, default: 70)", optional: true },
            ].map((param, idx) => (
              <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <code className="text-base text-indigo-400">{param.name}</code>
                    <span className="ml-2 text-sm text-zinc-500">{param.type}</span>
                  </div>
                  {param.optional && (
                    <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-zinc-400">{param.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-300">Code Examples</h3>
          {[
            { title: "Get Top-Rated Games", code: `curl https://thivelab.com/api/v1/steam/top-rated?min_score=90&limit=15` },
          ].map((example, idx) => (
            <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
                <span className="text-sm font-medium text-zinc-300">{example.title}</span>
                <button
                  onClick={() => copyToClipboard(example.code, `toprated-${idx}`)}
                  className="rounded p-2 hover:bg-zinc-800 transition-colors"
                >
                  {copied === `toprated-${idx}` ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-zinc-400" />
                  )}
                </button>
              </div>
              <div className="p-6">
                <pre className="overflow-x-auto text-sm text-zinc-300">
                  <code>{example.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Deck Verified Endpoint */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">4. Steam Deck Verified</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
              GET
            </span>
            <code className="text-lg text-indigo-300">/api/v1/steam/deck-verified</code>
          </div>
          <p className="text-zinc-400">
            Steam Deck compatible and verified games on sale.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-300">Query Parameters</h3>
          <div className="space-y-4">
            {[
              { name: "limit", type: "integer", desc: "Number of results (1-100, default: 50)", optional: true },
              { name: "min_discount", type: "integer", desc: "Minimum discount percentage (default: 0)", optional: true },
              { name: "sort_by", type: "string", desc: "Sort order: discount, score, price (default: discount)", optional: true },
            ].map((param, idx) => (
              <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <code className="text-base text-indigo-400">{param.name}</code>
                    <span className="ml-2 text-sm text-zinc-500">{param.type}</span>
                  </div>
                  {param.optional && (
                    <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-zinc-400">{param.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-300">Code Examples</h3>
          {[
            { title: "By Discount", code: `curl https://thivelab.com/api/v1/steam/deck-verified?sort_by=discount&limit=25` },
            { title: "By Rating", code: `curl https://thivelab.com/api/v1/steam/deck-verified?sort_by=score` },
          ].map((example, idx) => (
            <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
                <span className="text-sm font-medium text-zinc-300">{example.title}</span>
                <button
                  onClick={() => copyToClipboard(example.code, `deck-${idx}`)}
                  className="rounded p-2 hover:bg-zinc-800 transition-colors"
                >
                  {copied === `deck-${idx}` ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-zinc-400" />
                  )}
                </button>
              </div>
              <div className="p-6">
                <pre className="overflow-x-auto text-sm text-zinc-300">
                  <code>{example.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Best Value Endpoint */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">5. Best Value Deals</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
              GET
            </span>
            <code className="text-lg text-indigo-300">/api/v1/steam/best-value</code>
          </div>
          <p className="text-zinc-400">
            Best value games with high quality, deep discounts, and low final prices.
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
          <p className="text-sm text-blue-300">
            <strong>Value Score Algorithm:</strong> (Metacritic Score × Discount %) / Final Price
            <br />
            <span className="text-blue-200/70">Higher score = better value. Filters: min 70 Metacritic, min 50% discount.</span>
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-300">Query Parameters</h3>
          <div className="space-y-4">
            {[
              { name: "limit", type: "integer", desc: "Number of results (1-100, default: 50)", optional: true },
              { name: "max_price", type: "number", desc: "Maximum final price in USD (default: 20)", optional: true },
            ].map((param, idx) => (
              <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <code className="text-base text-indigo-400">{param.name}</code>
                    <span className="ml-2 text-sm text-zinc-500">{param.type}</span>
                  </div>
                  {param.optional && (
                    <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-zinc-400">{param.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-300">Code Examples</h3>
          {[
            { title: "Under $15", code: `curl https://thivelab.com/api/v1/steam/best-value?max_price=15&limit=20` },
            { title: "Budget Gaming", code: `curl https://thivelab.com/api/v1/steam/best-value?max_price=10` },
          ].map((example, idx) => (
            <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
                <span className="text-sm font-medium text-zinc-300">{example.title}</span>
                <button
                  onClick={() => copyToClipboard(example.code, `value-${idx}`)}
                  className="rounded p-2 hover:bg-zinc-800 transition-colors"
                >
                  {copied === `value-${idx}` ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-zinc-400" />
                  )}
                </button>
              </div>
              <div className="p-6">
                <pre className="overflow-x-auto text-sm text-zinc-300">
                  <code>{example.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Response Format (shared) */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Response Format</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <pre className="overflow-x-auto text-sm text-zinc-300">
            <code>{`{
  "success": true,
  "data": [
    {
      "id": 1,
      "app_id": "1091500",
      "name": "Cyberpunk 2077",
      "discount_percent": 75,
      "original_price": 59.99,
      "final_price": 14.99,
      "steam_deck_compatible": true,
      "metacritic_score": 86,
      "header_image": "https://cdn.cloudflare.steamstatic.com/...",
      "created_at": "2024-01-24T...",
      "updated_at": "2024-01-24T..."
    }
  ],
  "meta": {
    "count": 50,
    "limit": 50,
    "filters": {...}
  }
}`}</code>
          </pre>
        </div>
      </section>

      {/* Rate Limiting (shared) */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Rate Limiting</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="mb-4 text-zinc-400">
            All endpoints are rate-limited to ensure fair usage:
          </p>
          <ul className="space-y-2 text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400">•</span>
              <span><strong className="text-zinc-300">10 requests per 10 seconds</strong> per IP address</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400">•</span>
              <span>Rate limit headers included in all responses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400">•</span>
              <span>HTTP 429 status when limit exceeded</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
