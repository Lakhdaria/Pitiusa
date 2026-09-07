"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#art-station", label: "L'Art Station" },
  { href: "#histoire", label: "Histoire" },
  { href: "#presse", label: "Presse" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 24);
          ticking = false;
        });
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 md:top-6">
      <div
        className={`flex w-full max-w-3xl items-center justify-between rounded-2xl border px-5 py-3 backdrop-blur-xl transition-all duration-500 md:px-7 ${
          scrolled
            ? "border-brass-dim/50 bg-surface/70 shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
            : "border-brass-dim/25 bg-surface/35"
        }`}
      >
        <a href="#" className="font-display text-xl tracking-tight text-bone">
          Pitiusa
        </a>

        <nav className="hidden md:flex gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-base text-bone-dim transition-colors hover:text-bone"
            >
              {link.label}
              <span className="absolute -bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-oak transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="relative flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden"
        >
          <span
            className={`h-px w-5 bg-bone transition-transform duration-300 ${
              menuOpen ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-5 bg-bone transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-px w-5 bg-bone transition-transform duration-300 ${
              menuOpen ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`fixed inset-x-4 top-20 z-40 overflow-hidden rounded-2xl border border-brass-dim/40 bg-surface/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          menuOpen
            ? "max-h-64 opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 p-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-bone-dim transition-colors hover:bg-surface-raised hover:text-bone"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
