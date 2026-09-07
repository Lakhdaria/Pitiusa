"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { useReducedMotion } from "@/lib/useReducedMotion";

const quickLinks = [
  { href: "#histoire", label: "Histoire" },
  { href: "#presse", label: "Presse" },
  { href: "#contact", label: "Contact" },
];

export default function Hero() {
  const reduced = useReducedMotion();
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [mounted, setMounted] = useState(false);

  // Drive the load-in sequence from React state rather than a named
  // @keyframes animation, so it never silently breaks if the keyframes
  // get renamed or removed elsewhere. Two rAFs guarantee the browser has
  // painted the initial (hidden) state before we flip to visible, so the
  // CSS transition actually has something to animate from.
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMounted(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  // Cursor parallax on the hero image — a few px of drift, purely decorative.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetX = nx * 14;
      targetY = ny * 10;
    };

    const tick = () => {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      if (imageWrapRef.current) {
        imageWrapRef.current.style.transform = `translate3d(${curX.toFixed(
          2
        )}px, ${curY.toFixed(2)}px, 0) scale(1.04)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // Kinetic type: as the hero scrolls out, the headline gains weight and
  // fades slightly, so the transition into the next section feels intentional.
  const onProgress = useCallback((progress: number) => {
    const el = headlineRef.current;
    if (!el) return;
    const weight = 380 + progress * 260;
    el.style.setProperty("font-variation-settings", `'wght' ${weight.toFixed(0)}`);
    el.style.opacity = `${1 - progress * 0.6}`;
    el.style.transform = `translate3d(0, ${(progress * 24).toFixed(1)}px, 0)`;
  }, []);

  const sectionRef = useScrollProgress<HTMLDivElement>({
    onProgress,
    disabled: reduced,
  });

  return (
    <section
      ref={sectionRef}
      className="relative h-svh min-h-[640px] w-full overflow-hidden bg-ink"
    >
      <div ref={imageWrapRef} className="absolute inset-0">
        <Image
          src="/images/interior-side.jpg"
          alt="Pitiusa Art Station installée dans un séjour, écran affichant le logo Pitiusa"
          fill
          priority
          sizes="100vw"
          className={`object-cover object-[65%_center] transition-[opacity,transform] duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mounted ? "opacity-100" : "opacity-0 scale-105"
          }`}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/60" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-oak/10 blur-[140px]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p
          className={`mb-6 max-w-lg text-base text-bone-dim transition-all duration-700 ease-out md:text-lg ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "450ms" }}
        >
          Chêne français tricentenaire. Frêne centenaire. Une pièce unique,
          façonnée à la main.
        </p>
        <h1
          ref={headlineRef}
          className={`max-w-4xl font-display text-5xl leading-[1.05] text-bone transition-all duration-700 ease-out md:text-7xl ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "600ms", fontVariationSettings: "'wght' 380" }}
        >
          Nous ne construisons pas un simulateur. Nous créons une nouvelle
          catégorie d&rsquo;art.
        </h1>

        <div
          className={`mt-12 flex flex-col items-center gap-7 transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          <a
            href="#art-station"
            className="group relative overflow-hidden border border-oak px-9 py-3.5 text-sm tracking-wide"
          >
            <span className="absolute inset-0 -translate-x-full bg-oak transition-transform duration-500 ease-out group-hover:translate-x-0" />
            <span className="relative z-10 text-oak transition-colors duration-500 group-hover:text-ink">
              Découvrir l&rsquo;Art Station
            </span>
          </a>

          <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-bone-dim transition-colors hover:text-oak"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
