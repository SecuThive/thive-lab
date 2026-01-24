"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Gamepad2, Film, Menu, X } from "lucide-react";

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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const renderNavigation = (onNavigate?: () => void) =>
    navigation.map((section) => (
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
                  onClick={() => onNavigate?.()}
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
    ));

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6 lg:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Developer
            </p>
            <p className="text-2xl font-semibold text-white">Documentation</p>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-colors hover:border-indigo-500/50 hover:text-indigo-300"
            aria-label="Open documentation navigation"
          >
            <Menu className="h-5 w-5" />
            Menu
          </button>
        </div>

        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              role="presentation"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div className="relative ml-auto flex h-full w-80 max-w-[85%] flex-col gap-6 border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Browse APIs
                </p>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="rounded-full border border-zinc-800 p-2 text-zinc-300 transition-colors hover:border-indigo-500/50 hover:text-white"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-8 overflow-y-auto">
                {renderNavigation(() => setIsMobileNavOpen(false))}
              </nav>
            </div>
          </div>
        )}

        <div className="flex gap-8 py-8">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <nav className="sticky top-20 space-y-8">
              {renderNavigation()}
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
