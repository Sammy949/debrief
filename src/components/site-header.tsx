"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, ArrowRight } from "@phosphor-icons/react/dist/ssr";

const NAV = [
  { label: "Methodology", href: "/methodology" },
  { label: "Library", href: "/lessons" },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-obsidian">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Brain weight="duotone" className="size-5 text-amber" />
          <span className="font-serif text-2xl tracking-tight text-ivory">Debrief</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "border-b border-ivory pb-1 text-sm text-ivory"
                    : "pb-1 text-sm text-muted-ink transition-colors hover:text-ivory"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/debrief/new"
          className="inline-flex items-center gap-2 bg-ivory px-4 py-2 font-mono text-[0.7rem] font-medium tracking-[0.14em] uppercase text-obsidian transition-colors hover:bg-amber"
        >
          Get Started
          <ArrowRight weight="bold" className="size-3.5" />
        </Link>
      </div>
    </header>
  );
}
