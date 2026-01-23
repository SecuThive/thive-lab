"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const exampleRequest = `fetch('https://thivelab.com/api/v1/steam/deals?limit=10&min_discount=50')
  .then(res => res.json())
  .then(data => console.log(data));`;

  const exampleResponse = `{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cyberpunk 2077",
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
    "limit": 10,
    "filters": {
      "steam_deck": false,
      "min_discount": 50
    }
  }
}`;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight text-white">
          ThiveLab API Documentation
        </h1>
        <p className="text-xl text-zinc-400">
          Access powerful data APIs to build amazing applications. Free to use with rate limiting.
        </p>
      </div>

      {/* Quick Start */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Quick Start</h2>
        <p className="text-zinc-400">
          ThiveLab provides RESTful APIs that return JSON responses. All endpoints are rate-limited to ensure fair usage (10 requests per 10 seconds).
        </p>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Base URL</h3>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4">
              <code className="text-sm text-indigo-300">https://thivelab.com/api/v1</code>
            </pre>
            <button
              onClick={() => copyToClipboard("https://thivelab.com/api/v1", "base-url")}
              className="absolute right-4 top-4 rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              {copied === "base-url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Authentication</h2>
        <p className="text-zinc-400">
          Currently, all API endpoints are publicly accessible without authentication. Rate limiting is applied per IP address.
        </p>
        <div className="rounded-xl border border-amber-900/50 bg-amber-500/5 p-6">
          <p className="text-sm text-amber-200">
            <strong>Note:</strong> API keys will be required in the future for higher rate limits and advanced features.
          </p>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Rate Limiting</h2>
        <p className="text-zinc-400">
          All API endpoints are rate-limited to 10 requests per 10 seconds per IP address. Rate limit information is included in response headers:
        </p>
        <div className="space-y-2">
          <div className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <code className="text-sm text-indigo-400">X-RateLimit-Limit</code>
            <span className="text-zinc-500">Maximum requests allowed</span>
          </div>
          <div className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <code className="text-sm text-indigo-400">X-RateLimit-Remaining</code>
            <span className="text-zinc-500">Requests remaining in current window</span>
          </div>
          <div className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <code className="text-sm text-indigo-400">X-RateLimit-Reset</code>
            <span className="text-zinc-500">Time when the rate limit resets</span>
          </div>
        </div>
      </section>

      {/* Example Usage */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Example Usage</h2>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Request</h3>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4">
              <code className="text-sm text-zinc-300">{exampleRequest}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(exampleRequest, "request")}
              className="absolute right-4 top-4 rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              {copied === "request" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Response</h3>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4">
              <code className="text-sm text-zinc-300">{exampleResponse}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(exampleResponse, "response")}
              className="absolute right-4 top-4 rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              {copied === "response" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* Available APIs */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Available APIs</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <a
            href="/docs/steam-api"
            className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-indigo-500/50 hover:bg-zinc-900"
          >
            <h3 className="mb-2 text-xl font-semibold text-white group-hover:text-indigo-400">
              Steam Deals API
            </h3>
            <p className="text-zinc-400">
              Get the best Steam game deals with filters for discount percentage and Steam Deck compatibility.
            </p>
            <span className="mt-4 inline-block text-sm text-indigo-400">
              Learn more →
            </span>
          </a>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 opacity-50">
            <h3 className="mb-2 text-xl font-semibold text-white">
              Movie API
            </h3>
            <p className="text-zinc-400">
              Access movie data and recommendations.
            </p>
            <span className="mt-4 inline-block text-sm text-zinc-500">
              Coming Soon
            </span>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Support</h2>
        <p className="text-zinc-400">
          Need help or have questions? Reach out to us:
        </p>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-zinc-300">
            Email: <a href="mailto:support@thivelab.com" className="text-indigo-400 hover:underline">support@thivelab.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}
