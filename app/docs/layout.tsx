"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Gamepad2, Film } from "lucide-react";

const navigation = [
  {
    title: "Getting Started",
    items: [
      { name: "Introduction", href: "/docs", icon: Book },
    ],
  },
  {
    title: "API Reference",
    items: [
      { name: "Steam Deals API", href: "/docs/steam-api", icon: Gamepad2 },
      { name: "Movie API", href: "/docs/movie-api", icon: Film },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <span className="text-sm font-bold text-white">TL</span>
              </div>
              <span className="text-lg font-semibold text-white">ThiveLab</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/docs"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Documentation
              </Link>
              <Link
                href="/"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Home
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 py-8">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <nav className="sticky top-24 space-y-8">
              {navigation.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-indigo-500/10 text-indigo-400"
                                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-h1:text-4xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-zinc-800 prose-h2:pb-2 prose-h3:text-xl prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-normal prose-code:text-indigo-300 prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:border prose-pre:border-zinc-800 prose-pre:bg-zinc-900">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
