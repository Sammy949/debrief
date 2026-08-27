"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Brain, ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";

const NAV = [
  { label: "Library", href: "/lessons" },
  { label: "About", href: "/about" },
  { label: "Methodology", href: "/methodology" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-obsidian">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Brain weight="duotone" className="size-5 text-amber" />
          <span className="font-serif text-2xl tracking-tight text-ivory">Debrief</span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={
                isActive(item.href)
                  ? "border-b border-ivory pb-1 text-sm text-ivory"
                  : "pb-1 text-sm text-muted-ink transition-colors hover:text-ivory"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* desktop action */}
        <Link
          href="/debrief/new"
          className="hidden items-center gap-2 bg-ivory px-4 py-2 font-mono text-[0.7rem] font-medium tracking-[0.14em] uppercase text-obsidian transition-colors hover:bg-amber md:inline-flex"
        >
          Get Started
          <ArrowRight weight="bold" className="size-3.5" />
        </Link>

        {/* mobile menu */}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger
            aria-label="Open menu"
            className="flex size-9 items-center justify-center border border-line text-ivory transition-colors hover:border-amber hover:text-amber md:hidden"
          >
            <List weight="bold" className="size-5" />
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-md transition-[opacity,backdrop-filter] duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
            <Dialog.Popup className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col border-t border-line bg-surface transition-transform duration-300 ease-out data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full">
              <div className="flex justify-center pt-3 pb-1">
                <span className="h-1 w-10 bg-line-strong" aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between px-6 py-3">
                <Dialog.Title className="flex items-center gap-2.5 font-serif text-xl tracking-tight text-ivory">
                  <Brain weight="duotone" className="size-5 text-amber" aria-hidden="true" />
                  Debrief
                </Dialog.Title>
                <Dialog.Close
                  aria-label="Close menu"
                  className="flex size-9 items-center justify-center border border-line text-ivory transition-colors hover:border-amber hover:text-amber"
                >
                  <X weight="bold" className="size-5" />
                </Dialog.Close>
              </div>

              <nav className="flex flex-col px-6">
                {NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`border-t border-line py-4 font-serif text-2xl tracking-tight transition-colors ${
                      isActive(item.href) ? "text-amber" : "text-ivory hover:text-amber"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="p-6">
                <Link
                  href="/debrief/new"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 bg-ivory px-4 py-3.5 font-mono text-[0.7rem] font-medium tracking-[0.16em] uppercase text-obsidian transition-colors hover:bg-amber"
                >
                  Get Started
                  <ArrowRight weight="bold" className="size-3.5" />
                </Link>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
