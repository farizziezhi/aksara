"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";

const NAV = [
  { href: "/", label: "Cari" },
  { href: "/about", label: "Tentang" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-canvas-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Aksara home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={
                  active
                    ? "text-body-sm text-ink-black"
                    : "text-body-sm text-ash-gray hover:text-ink-black"
                }
              >
                {n.label}
              </Link>
            );
          })}
          <a
            href="https://github.com/farizziezhi/aksara"
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-sm text-ash-gray hover:text-ink-black"
          >
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/#cari"
            className="hidden rounded-pill bg-button-black px-[14px] py-[6px] text-body-sm text-canvas-white shadow-[var(--shadow-button)] transition hover:opacity-90 sm:inline-flex"
          >
            Mulai cari
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-pill border border-hairline md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <>
                  <path d="M5 5l10 10" />
                  <path d="M15 5L5 15" />
                </>
              ) : (
                <>
                  <path d="M4 6h12" />
                  <path d="M4 10h12" />
                  <path d="M4 14h12" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-hairline bg-canvas-white md:hidden">
          <nav className="mx-auto flex w-full max-w-[1200px] flex-col gap-1 px-4 py-3">
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={
                    active
                      ? "rounded-pill bg-subtle-cream px-4 py-2 text-body-sm text-ink-black"
                      : "rounded-pill px-4 py-2 text-body-sm text-graphite hover:bg-subtle-cream"
                  }
                >
                  {n.label}
                </Link>
              );
            })}
            <a
              href="https://github.com/farizziezhi/aksara"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="rounded-pill px-4 py-2 text-body-sm text-graphite hover:bg-subtle-cream"
            >
              GitHub
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
