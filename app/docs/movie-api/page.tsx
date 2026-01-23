"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function MovieApiPage() {
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
          Movie API
        </h1>
        <p className="text-xl text-zinc-400">
          Access curated movie data from TMDB with 4 specialized endpoints for popularity, ratings, and trends.
        </p>
      </div>

      {/* API Overview */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Available Endpoints</h2>
        <div className="grid gap-4">
          {[
            {
              method: "GET",
              path: "/api/v1/movies/popular",
              desc: "Most popular movies sorted by popularity score",
            },
            {
              method: "GET",
              path: "/api/v1/movies/top-rated",
              desc: "Highest-rated movies with credible vote counts",
            },
            {
              method: "GET",
              path: "/api/v1/movies/recent",
              desc: "Recently released movies (last 6 months by default)",
            },
            {
              method: "GET",
              path: "/api/v1/movies/trending",
              desc: "Trending movies based on recency, rating, and popularity",
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

      {/* 1. Popular Movies */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">1. Popular Movies</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
              GET
            </span>
            <code className="text-lg text-indigo-300">/api/v1/movies/popular</code>
          </div>
          <p className="text-zinc-400">
            Get the most popular movies sorted by TMDB popularity score.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-300">Query Parameters</h3>
          <div className="space-y-4">
            {[
              { name: "limit", type: "integer", desc: "Number of results (1-100, default: 50)", optional: true },
              { name: "min_rating", type: "number", desc: "Minimum rating (0-10, default: 0)", optional: true },
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
            { title: "Get Popular Movies", code: `curl https://thivelab.com/api/v1/movies/popular?limit=20` },
            { title: "With Rating Filter", code: `curl https://thivelab.com/api/v1/movies/popular?min_rating=7.5` },
          ].map((example, idx) => (
            <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
                <span className="text-sm font-medium text-zinc-300">{example.title}</span>
                <button
                  onClick={() => copyToClipboard(example.code, `popular-${idx}`)}
                  className="rounded p-2 hover:bg-zinc-800 transition-colors"
                >
                  {copied === `popular-${idx}` ? (
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

      {/* 2. Top-Rated Movies */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">2. Top-Rated Movies</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
              GET
            </span>
            <code className="text-lg text-indigo-300">/api/v1/movies/top-rated</code>
          </div>
          <p className="text-zinc-400">
            Highest-rated movies with minimum vote thresholds to ensure credibility.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-300">Query Parameters</h3>
          <div className="space-y-4">
            {[
              { name: "limit", type: "integer", desc: "Number of results (1-100, default: 50)", optional: true },
              { name: "min_rating", type: "number", desc: "Minimum rating (0-10, default: 7.0)", optional: true },
              { name: "min_votes", type: "integer", desc: "Minimum vote count (default: 1000)", optional: true },
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
            { title: "Get Top-Rated", code: `curl https://thivelab.com/api/v1/movies/top-rated?limit=15` },
            { title: "High Standards", code: `curl https://thivelab.com/api/v1/movies/top-rated?min_rating=8.0&min_votes=5000` },
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

      {/* 3. Recent Movies */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">3. Recent Releases</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
              GET
            </span>
            <code className="text-lg text-indigo-300">/api/v1/movies/recent</code>
          </div>
          <p className="text-zinc-400">
            Recently released movies sorted by release date (last 6 months by default).
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-300">Query Parameters</h3>
          <div className="space-y-4">
            {[
              { name: "limit", type: "integer", desc: "Number of results (1-100, default: 50)", optional: true },
              { name: "min_rating", type: "number", desc: "Minimum rating (0-10, default: 0)", optional: true },
              { name: "months_back", type: "integer", desc: "How many months back to search (default: 6)", optional: true },
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
            { title: "Recent Releases", code: `curl https://thivelab.com/api/v1/movies/recent?limit=25` },
            { title: "Last 3 Months", code: `curl https://thivelab.com/api/v1/movies/recent?months_back=3&min_rating=7.0` },
          ].map((example, idx) => (
            <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
                <span className="text-sm font-medium text-zinc-300">{example.title}</span>
                <button
                  onClick={() => copyToClipboard(example.code, `recent-${idx}`)}
                  className="rounded p-2 hover:bg-zinc-800 transition-colors"
                >
                  {copied === `recent-${idx}` ? (
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

      {/* 4. Trending Movies */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">4. Trending Movies</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
              GET
            </span>
            <code className="text-lg text-indigo-300">/api/v1/movies/trending</code>
          </div>
          <p className="text-zinc-400">
            Trending movies calculated using recency, rating, and popularity combined.
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
          <p className="text-sm text-blue-300">
            <strong>Trending Score Algorithm:</strong> (Rating × 10) + (Popularity / 10) + Recency Bonus
            <br />
            <span className="text-blue-200/70">Newer releases get higher bonus (max 30 points, decays over 90 days).</span>
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-300">Query Parameters</h3>
          <div className="space-y-4">
            {[
              { name: "limit", type: "integer", desc: "Number of results (1-100, default: 50)", optional: true },
              { name: "min_rating", type: "number", desc: "Minimum rating (0-10, default: 6.0)", optional: true },
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
            { title: "Get Trending", code: `curl https://thivelab.com/api/v1/movies/trending?limit=30` },
            { title: "High-Quality Trending", code: `curl https://thivelab.com/api/v1/movies/trending?min_rating=7.0` },
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

      {/* Response Format */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Response Format</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <pre className="overflow-x-auto text-sm text-zinc-300">
            <code>{`{
  "success": true,
  "data": [
    {
      "id": 1,
      "tmdb_id": "823464",
      "title": "Godzilla x Kong: The New Empire",
      "original_title": "Godzilla x Kong: The New Empire",
      "release_date": "2024-03-27",
      "rating": 7.2,
      "vote_count": 3452,
      "popularity": 847.56,
      "overview": "The epic battle continues!...",
      "poster_path": "/gmGK04iR0dwMeXlKszcCi8VTKa8.jpg",
      "backdrop_path": "/9oYdz5gDoIl8h67e3ccv3OHtmm2.jpg",
      "genre_ids": [28, 878, 12],
      "adult": false,
      "original_language": "en",
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

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Image URLs</h3>
          <p className="text-zinc-400 mb-3">Construct full image URLs using TMDB base URL:</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-indigo-400">•</span>
              <span className="text-zinc-300">Poster: <code className="text-indigo-300">https://image.tmdb.org/t/p/w500{`{poster_path}`}</code></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-400">•</span>
              <span className="text-zinc-300">Backdrop: <code className="text-indigo-300">https://image.tmdb.org/t/p/original{`{backdrop_path}`}</code></span>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limiting */}
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
