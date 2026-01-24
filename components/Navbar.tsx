"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2 } from "lucide-react";

type NavLink = {
  label: string;
  href: string;
  isActive: boolean;
  icon?: typeof Code2;
};

export default function Navbar() {
  const pathname = usePathname();

  const navLinks: NavLink[] = [
    {
      label: "Projects",
      href: "/#projects",
      isActive: pathname === "/",
    },
    {
      label: "Blueprints",
      href: "/blueprints",
      isActive: pathname?.startsWith("/blueprints"),
    },
    {
      label: "Dev Lab",
      href: "/dev",
      isActive: pathname?.startsWith("/dev"),
    },
    {
      label: "Developers",
      href: "/docs",
      isActive: pathname?.startsWith("/docs"),
      icon: Code2,
    },
  ] as const;

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-lg">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <span className="text-sm font-bold text-white">TL</span>
            </div>
            <span className="text-lg font-semibold text-white">ThiveLab</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const activeClasses = link.isActive
                ? "text-white"
                : "text-zinc-400 hover:text-white";
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeClasses}`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
